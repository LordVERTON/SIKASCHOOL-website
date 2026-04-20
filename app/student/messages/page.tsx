"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface MessageThread {
  id: string;
  subject: string;
  tutor: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  } | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function StudentMessages() {
  const { user: _user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [participants, setParticipants] = useState<{ id: string; name: string; email: string; avatar: string }[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadThreads = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/student/messages', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setThreads(data.threads || []);
        } else {
          setError('Erreur lors du chargement des messages');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des messages:', err);
        setError('Erreur lors du chargement des messages');
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, []);

  const openNewModal = async () => {
    try {
      setIsNewOpen(true);
      setParticipantsLoading(true);
      const res = await fetch('/api/student/assigned-tutors', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setParticipants((data.tutors || []).map((t: any) => ({ id: t.id, name: t.name, email: t.email, avatar: t.avatar })));
      } else {
        setError('Erreur lors du chargement des tuteurs assignés');
      }
    } catch {
      setError('Erreur lors du chargement des tuteurs assignés');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim() || selectedIds.length === 0) return;
    try {
      setCreating(true);
      const res = await fetch('/api/student/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject: subject.trim(), content: content.trim(), participantIds: selectedIds })
      });
      if (res.ok) {
        // refresh list
        const list = await fetch('/api/student/messages', { credentials: 'include' });
        if (list.ok) {
          const data = await list.json();
          setThreads(data.threads || []);
        }
        // reset and close
        setIsNewOpen(false);
        setSelectedIds([]);
        setSubject("");
        setContent("");
      } else {
        setError('Erreur lors de la création de la conversation');
      }
    } catch {
      setError('Erreur lors de la création de la conversation');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">
          Gérez vos conversations avec vos tuteurs
        </p>
        <div className="mt-4">
          <button onClick={openNewModal} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
            Nouveau message
          </button>
        </div>
      </div>

      {/* Tuteur IA permanent - toujours épinglé en haut */}
      <Link
        href="/student/messages/ai-tutor"
        className="mb-6 block rounded-lg border border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900">Sika AI</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary">
                Tuteur permanent · 24/7
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                En ligne
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700">
              Pose tes questions techniques, fais corriger un devoir à partir d'une photo,
              demande une fiche de révision ou une explication détaillée.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600">Exercices</span>
              <span className="px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600">Correction de photos</span>
              <span className="px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600">Fiches de révision</span>
              <span className="px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600">Explications</span>
            </div>
          </div>
          <div className="flex-shrink-0 self-center">
            <span className="inline-flex items-center px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium">
              Ouvrir →
            </span>
          </div>
        </div>
      </Link>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message</h3>
          <p className="text-gray-500">
            Vous n'avez pas encore de conversations avec vos tuteurs.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/student/messages/${thread.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar du tuteur */}
                  <div className="flex-shrink-0">
                    {thread.tutor?.avatar ? (
                      <Image
                        src={thread.tutor.avatar}
                        alt={thread.tutor.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium text-lg">
                          {thread.tutor?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu du thread */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {thread.tutor?.name || 'Tuteur inconnu'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {thread.unreadCount > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                            {thread.unreadCount}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(thread.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {thread.subject}
                    </p>

                    {thread.lastMessage && (
                      <p className="text-sm text-gray-600 mt-1">
                        {truncateContent(thread.lastMessage.content)}
                      </p>
                    )}

                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span>{thread.tutor?.email}</span>
                    </div>
                  </div>

                  {/* Indicateur de message non lu */}
                  {thread.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Modal Nouvelle conversation */}
    <Modal open={isNewOpen} onClose={() => setIsNewOpen(false)}>
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Nouvelle conversation</h3>
      <form onSubmit={handleCreateThread} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Sujet</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-stroke rounded-md dark:border-strokedark dark:bg-blacksection"
            placeholder="Sujet de la conversation"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Message</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-stroke rounded-md resize-none dark:border-strokedark dark:bg-blacksection"
            rows={3}
            placeholder="Votre message initial"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">Choisir des tuteurs</label>
          {participantsLoading ? (
            <p className="text-sm text-waterloo">Chargement...</p>
          ) : participants.length === 0 ? (
            <p className="text-sm text-waterloo">Aucun tuteur assigné</p>
          ) : (
            <div className="max-h-48 overflow-y-auto divide-y divide-stroke dark:divide-strokedark border border-stroke rounded-md dark:border-strokedark">
              {participants.map((p) => (
                <label key={p.id} className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />
                  <span className="text-sm">{p.name} <span className="text-waterloo">{p.email}</span></span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setIsNewOpen(false)} className="px-4 py-2 border rounded-md">Annuler</button>
          <button
            type="submit"
            disabled={creating || !subject.trim() || !content.trim() || selectedIds.length === 0}
            className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
          >
            {creating ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
    </>
  );
}

// New conversation modal
// Simple inline modal implementation
// Placed after default export to keep file self-contained
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction as string;
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    return () => {
      body.style.overflow = previousOverflow;
      body.style.touchAction = previousTouchAction || '';
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onTouchMove={(e) => {
          // Prevent background from scrolling on mobile while allowing modal content to scroll
          e.preventDefault();
        }}
      />
      <div
        className="relative z-10 w-full max-w-xl rounded-lg border border-stroke bg-white p-6 shadow-solid-10 dark:border-strokedark dark:bg-blacksection max-h-[80vh] overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  );
}

// Augment the page with the modal JSX by rendering it via a wrapper component override
// We monkey-patch render by exporting a Client Component that includes the modal
// This is minimal and keeps current structure
