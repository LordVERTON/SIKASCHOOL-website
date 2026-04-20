"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AIConversation {
  id: string;
  title: string;
  subject: string | null;
  level: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AITutorConversationsPage() {
  const { user: _user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/student/ai-tutor/conversations', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        } else {
          setError('Erreur de chargement des discussions');
        }
      } catch {
        setError('Erreur de chargement des discussions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const createConversation = async () => {
    try {
      setCreating(true);
      const res = await fetch('/api/student/ai-tutor/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: 'Nouvelle discussion' }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/student/messages/ai-tutor/${data.conversation.id}`);
      } else {
        setError('Impossible de créer la discussion');
      }
    } catch {
      setError('Impossible de créer la discussion');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diff < 1) return "À l'instant";
    if (diff < 24) return `Il y a ${Math.floor(diff)}h`;
    if (diff < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Supprimer cette discussion ?')) return;
    const res = await fetch(`/api/student/ai-tutor/conversations/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/student/messages" className="text-primary hover:opacity-90 text-sm">
          ← Retour aux messages
        </Link>
      </div>

      <div className="mb-8 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Sika AI — Tuteur permanent</h1>
            <p className="text-sm text-gray-700">
              Disponible 24/7 pour tes questions, tes devoirs, la correction d'exercices
              (photos acceptées) et la génération de fiches de révision.
            </p>
          </div>
          <button
            onClick={createConversation}
            disabled={creating}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {creating ? '...' : 'Nouvelle discussion'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Commence ta première discussion
          </h3>
          <p className="text-gray-500 mb-4">
            Pose une question, envoie la photo d'un exercice ou demande une fiche de révision.
          </p>
          <button
            onClick={createConversation}
            disabled={creating}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {creating ? 'Création...' : 'Démarrer'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {conversations.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
              <Link href={`/student/messages/ai-tutor/${c.id}`} className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{c.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Mise à jour : {formatDate(c.updatedAt)}
                  {c.subject ? ` · ${c.subject}` : ''}
                  {c.level ? ` · ${c.level}` : ''}
                </p>
              </Link>
              <button
                onClick={() => deleteConversation(c.id)}
                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
                aria-label="Supprimer"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
