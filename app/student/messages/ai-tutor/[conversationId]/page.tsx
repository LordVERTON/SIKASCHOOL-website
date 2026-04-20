"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AttachmentIn {
  kind: 'image';
  url: string;
  mimeType?: string;
  name?: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  images: AttachmentIn[];
  metadata?: { model?: string; toolCalls?: { name: string }[]; error?: boolean };
  createdAt: string;
}

interface AIConversation {
  id: string;
  title: string;
  subject: string | null;
  level: string | null;
  createdAt: string;
  updatedAt: string;
}

const MAX_IMAGE_SIZE_MB = 4;
const MAX_IMAGE_WIDTH = 1600;

// Compresse et encode une image en data URL JPEG pour rester sous la limite.
async function fileToResizedDataUrl(file: File): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Image invalide'));
    i.src = dataUrl;
  });

  const ratio = Math.min(1, MAX_IMAGE_WIDTH / img.width);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

function renderContent(content: string) {
  // Rendu Markdown simple : paragraphes, sauts de ligne, gras, code inline, code blocks, listes.
  // On reste volontairement minimal pour ne pas ajouter de dépendance.
  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  // Code blocks ```lang\n...\n```
  let html = escape(content).replace(
    /```([\w-]*)\n([\s\S]*?)```/g,
    (_m, _lang, code) =>
      `<pre class="bg-gray-900 text-gray-100 rounded-md p-3 overflow-x-auto text-xs my-2"><code>${code}</code></pre>`
  );

  // Inline code `...`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[0.85em]">$1</code>'
  );

  // Bold **...**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>');

  // Bullet lists
  html = html.replace(/^(?:- (.+)(?:\n|$))+?/gm, (match) => {
    const items = match
      .trim()
      .split(/\n/)
      .map((l) => l.replace(/^-\s+/, ''))
      .map((l) => `<li class="ml-5 list-disc">${l}</li>`) // inline class
      .join('');
    return `<ul class="my-2">${items}</ul>`;
  });

  // Line breaks
  html = html.replace(/\n/g, '<br />');
  return html;
}

export default function AITutorChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<AttachmentIn[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    params.then((p) => setConversationId(p.conversationId));
  }, [params]);

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/student/ai-tutor/conversations/${conversationId}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setMessages(data.messages || []);
      } else if (res.status === 404) {
        setError('Discussion introuvable');
      } else {
        setError('Erreur de chargement');
      }
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, sending]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const next: AttachmentIn[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setError(`L'image ${file.name} dépasse ${MAX_IMAGE_SIZE_MB} Mo`);
        continue;
      }
      try {
        const url = await fileToResizedDataUrl(file);
        next.push({ kind: 'image', url, mimeType: 'image/jpeg', name: file.name });
      } catch (e) {
        console.error('Erreur image:', e);
      }
    }
    setPendingImages((prev) => [...prev, ...next].slice(0, 6));
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && pendingImages.length === 0) || sending || !conversationId) return;

    const contentToSend = input.trim();
    const attachmentsToSend = pendingImages;

    // Optimistic UI
    const tempUserMsg: AIMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: contentToSend,
      images: attachmentsToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setPendingImages([]);
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/student/ai-tutor/conversations/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: contentToSend, attachments: attachmentsToSend }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Erreur envoi');
        // Retirer le message temp si erreur
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        return;
      }
      const data = await res.json();
      // Remplacer le temp + ajouter la réponse
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
        const updated = [...withoutTemp];
        if (data.userMessage) updated.push(data.userMessage);
        if (data.assistantMessage) updated.push(data.assistantMessage);
        return updated;
      });
      // Rafraichir titre
      loadConversation();
    } catch (err) {
      console.error(err);
      setError('Erreur réseau');
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = useMemo(
    () => [
      {
        label: 'Corrige une photo',
        text: "Voici une photo d'un exercice que j'ai fait. Corrige-le et indique mes erreurs.",
      },
      {
        label: 'Aide-moi sur ce devoir',
        text: "Aide-moi à résoudre ce devoir étape par étape (je veux comprendre).",
      },
      {
        label: 'Fiche de révision',
        text: 'Génère-moi une fiche de révision complète sur : ',
      },
      {
        label: 'Explique un concept',
        text: "Explique-moi ce concept avec intuition, exemple et pièges : ",
      },
    ],
    []
  );

  if (loading && !conversation) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 text-sm text-gray-500">Chargement de la discussion...</p>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/student/messages/ai-tutor" className="mt-4 inline-block text-primary">
          ← Retour aux discussions
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/student/messages/ai-tutor"
          className="text-primary hover:opacity-90 text-sm"
        >
          ← Toutes les discussions
        </Link>
        <button
          onClick={async () => {
            if (!conversationId) return;
            if (!confirm('Supprimer cette discussion ?')) return;
            const res = await fetch(
              `/api/student/ai-tutor/conversations/${conversationId}`,
              { method: 'DELETE', credentials: 'include' }
            );
            if (res.ok) router.push('/student/messages/ai-tutor');
          }}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Supprimer
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {conversation?.title || 'Discussion avec Sika AI'}
            </h1>
            <p className="text-xs text-gray-600">
              Sika AI · Tuteur IA permanent · Envoie du texte ou des photos d'exercices
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Bienvenue {user?.name ? user.name.split(' ')[0] : ''} !
                Demande-moi ce que tu veux : aide sur un exercice, correction d'une copie
                (envoie une photo), fiche de révision, explication de cours…
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setInput(p.text)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                  m.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-primary/10 text-primary'
                }`}
                aria-hidden
              >
                {m.role === 'user' ? 'Moi' : 'IA'}
              </div>
              <div
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-white'
                    : m.metadata?.error
                      ? 'bg-red-50 text-red-900 border border-red-200'
                      : 'bg-gray-50 text-gray-900 border border-gray-200'
                }`}
              >
                {m.images && m.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {m.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative w-24 h-24 rounded-md overflow-hidden border border-black/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.name || `image-${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {m.content && (
                  <div
                    className={`prose prose-sm max-w-none ${
                      m.role === 'user' ? 'prose-invert' : ''
                    }`}
                    dangerouslySetInnerHTML={{ __html: renderContent(m.content) }}
                  />
                )}
                {m.metadata?.toolCalls && m.metadata.toolCalls.length > 0 && (
                  <p className="text-[10px] mt-2 opacity-70">
                    🛠 {m.metadata.toolCalls.map((t) => t.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                IA
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-2 text-xs text-gray-500">Sika AI réfléchit…</span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-3">
          {pendingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {pendingImages.map((img, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.name || `image-${i}`}
                    className="w-16 h-16 object-cover rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPendingImages((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                    aria-label="Retirer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
              title="Ajouter une image (photo d'exercice)"
              aria-label="Ajouter une image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                if (e.target) e.target.value = '';
              }}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Pose ta question, colle un énoncé ou envoie une photo d'exercice..."
              className="flex-1 p-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || (!input.trim() && pendingImages.length === 0)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {sending ? '...' : 'Envoyer'}
            </button>
          </form>
          <p className="mt-2 text-[11px] text-gray-400">
            Entrée pour envoyer · Maj+Entrée pour saut de ligne · Jusqu'à 6 images par message
          </p>
        </div>
      </div>
    </div>
  );
}
