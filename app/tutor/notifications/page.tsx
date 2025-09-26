"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

type TutorNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
};

export default function TutorNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TutorNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/tutor/notifications', { credentials: 'include' });
      if (!res.ok) throw new Error('Erreur de chargement');
      const data = await res.json();
      setItems(data);
    } catch (_e) {
      setError("Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = useMemo(() => items.filter(n => !n.isRead).length, [items]);

  const actOn = async (id: string, action: 'CONFIRM' | 'DECLINE') => {
    try {
      setActingId(id);
      const res = await fetch('/api/tutor/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, action }),
      });
      if (!res.ok) throw new Error('Action échouée');
      if (action === 'CONFIRM') {
        toast.success('Séance confirmée et ajoutée à votre calendrier.');
      } else {
        toast('Demande refusée.', { icon: 'ℹ️' });
      }
      await fetchNotifications();
    } catch (_e) {
      setError('Action impossible');
      toast.error('Une erreur est survenue. Réessayez.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top mx-auto text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Notifications
          </h1>
          <p className="mt-2 text-para2 text-waterloo dark:text-manatee">
            {unreadCount} non lues
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-10 max-w-[900px] px-4 md:px-8 xl:px-0">
        {loading ? (
          <div className="text-center text-waterloo dark:text-manatee">Chargement…</div>
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center text-waterloo dark:text-manatee">Aucune notification</div>
        ) : (
          <ul className="space-y-4">
            {items.map((n) => (
              <li key={n.id} className="rounded-lg border border-stroke bg-white p-5 dark:border-strokedark dark:bg-blacksection">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{n.type}</span>
                      {!n.isRead && <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Nouveau</span>}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-black dark:text-white">{n.title}</h3>
                    <p className="mt-1 text-sm text-waterloo dark:text-manatee">{n.message}</p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{new Date(n.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  {n.type === 'BOOKING' && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        disabled={actingId === n.id}
                        onClick={() => actOn(n.id, 'DECLINE')}
                        className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        Refuser
                      </button>
                      <button
                        disabled={actingId === n.id}
                        onClick={() => actOn(n.id, 'CONFIRM')}
                        className="rounded bg-primary px-3 py-2 text-sm text-white hover:bg-primaryho disabled:opacity-70"
                      >
                        Confirmer
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}


