"use client";

import Link from "next/link";
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
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                Messages
              </h1>
              <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
                Communiquez avec vos tuteurs.
              </p>
            </div>
            <button className="rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:opacity-90">
              Nouveau message
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-7.5 lg:grid-cols-3">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="animate_top rounded-lg border border-stroke bg-white shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="p-6 border-b border-stroke dark:border-strokedark">
                <h2 className="text-lg font-semibold text-black dark:text-white">Conversations</h2>
              </div>
              
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-waterloo dark:text-manatee mt-2">Chargement...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : threads.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-waterloo dark:text-manatee">Aucune conversation</p>
                  <p className="text-sm text-waterloo dark:text-manatee mt-1">
                    Commencez une conversation avec vos tuteurs
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stroke dark:divide-strokedark">
                  {threads.map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/student/messages/${thread.id}`}
                      className={`block p-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                        thread.unreadCount > 0 ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm font-medium truncate ${
                              thread.unreadCount > 0 ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {thread.subject}
                            </h3>
                            {thread.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-waterloo dark:text-manatee mb-1">
                            avec {thread.tutor?.name || 'Tuteur inconnu'}
                          </p>
                          {thread.lastMessage && (
                            <p className={`text-sm truncate ${
                              thread.unreadCount > 0 ? 'text-black dark:text-white' : 'text-waterloo dark:text-manatee'
                            }`}>
                              {truncateContent(thread.lastMessage.content)}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 text-xs text-waterloo dark:text-manatee">
                          {formatDate(thread.updatedAt)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-2">
            <div className="animate_top rounded-lg border border-stroke bg-white shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-waterloo dark:text-manatee">
                  Choisissez une conversation dans la liste pour commencer à échanger avec vos tuteurs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
