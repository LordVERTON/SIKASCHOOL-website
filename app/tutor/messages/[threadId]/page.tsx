"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

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

export default function TutorThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string>('');

  useEffect(() => {
    const loadThreadId = async () => {
      const resolvedParams = await params;
      setThreadId(resolvedParams.threadId);
    };
    loadThreadId();
  }, [params]);

  const fetchThread = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tutor/messages/${threadId}?tutorId=${user?.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch thread');
      }

      const data = await response.json();
      setThread(data.thread);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching thread:', err);
      setError('Erreur lors du chargement de la conversation');
    } finally {
      setLoading(false);
    }
  }, [threadId, user?.id]);

  useEffect(() => {
    if (threadId && user?.id) {
      fetchThread();
    }
  }, [threadId, user?.id, fetchThread]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch(`/api/tutor/messages/${threadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutorId: user?.id,
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Ajouter le nouveau message à la liste
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      
      // Recharger les messages pour avoir les données complètes
      await fetchThread();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">{error || 'Conversation non trouvée'}</p>
          <button
            onClick={() => router.push('/tutor/messages')}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Retour aux messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/tutor/messages')}
          className="text-primary hover:text-primary/80 mb-4"
        >
          ← Retour aux messages
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{thread.subject}</h1>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun message dans cette conversation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender?.role === 'TUTOR' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender?.role === 'TUTOR'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender?.role === 'TUTOR' ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Formulaire d'envoi */}
      <form onSubmit={handleSendMessage} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </form>
    </div>
  );
}
