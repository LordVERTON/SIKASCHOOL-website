"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeMessageThreadsInbox } from '@/hooks/useRealtimeMessageThreadsInbox';
import Image from 'next/image';
import Link from 'next/link';

interface MessageThread {
  id: string;
  subject: string;
  student: {
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

export default function TutorMessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [participants, setParticipants] = useState<{ id: string; name: string; email: string }[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tutor/messages?tutorId=${user?.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch message threads');
      }

      const data = await response.json();
      setThreads(data.threads || []);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchThreads();
    }
  }, [user?.id, fetchThreads]);

  useRealtimeMessageThreadsInbox({
    userId: user?.id,
    enabled: !!user?.id,
    onInvalidate: () => {
      void fetchThreads();
    },
  });

  const openNewModal = async () => {
    if (!user?.id) return;
    try {
      setIsNewOpen(true);
      setParticipantsLoading(true);
      const res = await fetch('/api/tutor/students', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setParticipants((data.students || []).map((s: any) => ({ id: s.id, name: s.name, email: s.email })));
      } else {
        setError('Erreur lors du chargement des étudiants assignés');
      }
    } catch {
      setError('Erreur lors du chargement des étudiants assignés');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !subject.trim() || !content.trim() || selectedIds.length === 0) return;
    try {
      setCreating(true);
      const res = await fetch('/api/tutor/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId: user.id, subject: subject.trim(), content: content.trim(), participantIds: selectedIds })
      });
      if (res.ok) {
        await fetchThreads();
        setIsNewOpen(false);
        setSelectedIds([]);
        setSubject('');
        setContent('');
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
      return date.toLocaleDateString('fr-FR');
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchThreads}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">
          Gérez vos conversations avec vos étudiants
        </p>
        <div className="mt-4">
          <button onClick={openNewModal} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
            Nouveau message
          </button>
        </div>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message</h3>
          <p className="text-gray-500">
            Vous n'avez pas encore de conversations avec vos étudiants.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/tutor/messages/${thread.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar de l'étudiant */}
                  <div className="flex-shrink-0">
                    {thread.student?.avatar ? (
                      <Image
                        src={thread.student.avatar}
                        alt={thread.student.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium text-lg">
                          {thread.student?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu du thread */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {thread.student?.name || 'Étudiant inconnu'}
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
                      <span>{thread.student?.email}</span>
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
    <TutorModal open={isNewOpen} onClose={() => setIsNewOpen(false)}>
      <h3 className="text-lg font-semibold mb-4">Nouvelle conversation</h3>
      <form onSubmit={handleCreateThread} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Sujet</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Sujet de la conversation"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Message</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="Votre message initial"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">Choisir des étudiants</label>
          {participantsLoading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : participants.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun étudiant assigné</p>
          ) : (
            <div className="max-h-48 overflow-y-auto divide-y border rounded-md">
              {participants.map((p) => (
                <label key={p.id} className="flex items-center gap-3 p-3">
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                  <span className="text-sm">{p.name} <span className="text-gray-500">{p.email}</span></span>
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
    </TutorModal>
    </>
  );
}

function TutorModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousTouchAction = (body.style as any).touchAction as string;
    body.style.overflow = 'hidden';
    (body.style as any).touchAction = 'none';
    return () => {
      body.style.overflow = previousOverflow;
      (body.style as any).touchAction = previousTouchAction || '';
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onTouchMove={(e) => {
          // Prevent background scroll while allowing modal content to scroll
          e.preventDefault();
        }}
      />
      <div
        className="relative z-10 w-full max-w-xl rounded-lg bg-white p-6 shadow-sm border border-gray-200 max-h-[80vh] overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  );
}
