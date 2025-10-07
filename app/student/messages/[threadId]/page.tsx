"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  } | null;
  createdAt: string;
  isRead: boolean;
}

interface Thread {
  id: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function MessageThread({ params }: { params: Promise<{ threadId: string }> }) {
  const { user: _user } = useAuth();
  const _router = useRouter();
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [editingSubject, setEditingSubject] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadThread = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const response = await fetch(`/api/student/messages/${resolvedParams.threadId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setThread(data.thread);
          setMessages(data.messages || []);
        } else {
          setError('Erreur lors du chargement de la conversation');
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la conversation:', err);
        setError('Erreur lors du chargement de la conversation');
      } finally {
        setLoading(false);
      }
    };

    loadThread();
  }, [params]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const resolvedParams = await params;
      const response = await fetch(`/api/student/messages/${resolvedParams.threadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        // Message envoyé: recharger le thread pour rafraîchir immédiatement l'affichage
        setNewMessage("");
        const refreshed = await fetch(`/api/student/messages/${resolvedParams.threadId}`, { credentials: 'include' });
        if (refreshed.ok) {
          const refreshedData = await refreshed.json();
          setThread(refreshedData.thread);
          setMessages(refreshedData.messages || []);
        }
        try { _router.refresh(); } catch {}
      } else {
        setError('Erreur lors de l\'envoi du message');
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const handleEditSubject = async () => {
    if (!thread) return;
    if (!subjectInput.trim()) return;
    try {
      const resolvedParams = await params;
      const res = await fetch(`/api/student/messages/${resolvedParams.threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject: subjectInput.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setThread((prev) => prev ? { ...prev, subject: data.thread.subject } : prev);
        setEditingSubject(false);
      } else {
        setError('Erreur lors de la mise à jour du sujet');
      }
    } catch {
      setError('Erreur lors de la mise à jour du sujet');
    }
  };

  const handleDeleteThread = async () => {
    if (!thread || deleting) return;
    try {
      setDeleting(true);
      const resolvedParams = await params;
      const res = await fetch(`/api/student/messages/${resolvedParams.threadId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        _router.push('/student/messages');
      } else {
        setError('Erreur lors de la suppression de la conversation');
      }
    } catch {
      setError('Erreur lors de la suppression de la conversation');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-waterloo dark:text-manatee">Chargement de la conversation...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !thread) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{error || 'Conversation non trouvée'}</p>
            <Link 
              href="/student/messages" 
              className="mt-4 inline-block text-primary hover:opacity-90"
            >
              ← Retour aux messages
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        {/* Header */}
        <div className="animate_top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/student/messages" 
                className="text-primary hover:opacity-90"
              >
                ← Retour
              </Link>
              <div>
                {!editingSubject ? (
                  <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                    {thread.subject}
                  </h1>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      className="px-3 py-2 border border-stroke rounded-md dark:border-strokedark dark:bg-blacksection"
                      placeholder="Sujet de la conversation"
                    />
                    <button onClick={handleEditSubject} className="px-3 py-2 bg-primary text-white rounded-md">Enregistrer</button>
                    <button onClick={() => setEditingSubject(false)} className="px-3 py-2 border rounded-md">Annuler</button>
                  </div>
                )}
                <p className="mt-2 text-para2 text-waterloo dark:text-manatee">
                  Conversation créée le {new Date(thread.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!editingSubject && (
                <button
                  onClick={() => { setSubjectInput(thread.subject); setEditingSubject(true); }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Modifier le sujet
                </button>
              )}
              <button
                onClick={handleDeleteThread}
                disabled={deleting}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <div className="p-6 border-b border-stroke dark:border-strokedark">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-medium text-lg">T</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Tuteur
                </h2>
                <p className="text-sm text-waterloo dark:text-manatee">
                  Conversation créée le {new Date(thread.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-waterloo dark:text-manatee">Aucun message dans cette conversation</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.sender?.role === 'STUDENT' ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium text-sm">
                      {message.sender?.role === 'STUDENT' ? 'M' : 'T'}
                    </span>
                  </div>
                  <div className={`flex-1 ${message.sender?.role === 'STUDENT' ? 'text-right' : ''}`}>
                    <div className={`rounded-lg p-3 ${
                      message.sender?.role === 'STUDENT'
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className={`text-xs text-waterloo dark:text-manatee mt-1 ${
                      message.sender?.role === 'STUDENT' ? 'text-right' : ''
                    }`}>
                      {message.sender?.name || 'Utilisateur'} • {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Composer */}
          <div className="p-6 border-t border-stroke dark:border-strokedark">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="w-full p-3 border border-stroke rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                  rows={3}
                  disabled={sending}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
