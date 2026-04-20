"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "@/hooks/useAuth";

type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any> | null;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return "À l’instant";
  }
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`;
  }
  if (diffInHours < 48) {
    return "Hier";
  }
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getTypeLabel(type: string) {
  switch (type) {
    case "PROFILE":
      return "Profil";
    case "PASSWORD":
      return "Sécurité";
    case "BOOKING":
      return "Séance";
    case "ASSIGNMENT":
    case "TUTOR_ASSIGNMENT":
      return "Assignation";
    case "MESSAGE":
      return "Message";
    case "SYSTEM":
      return "Système";
    default:
      return "Notification";
  }
}

function getIcon(type: string) {
  const iconClass = (color: string) => `text-${color}-500`;

  switch (type) {
    case "PROFILE":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={iconClass("emerald")}>
          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        </svg>
      );
    case "PASSWORD":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={iconClass("amber")}>
          <path d="M8 1a4 4 0 0 0-4 4v1H3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm-3 4a3 3 0 1 1 6 0v1H5V5Zm3 3a1 1 0 0 1 1 1v1.5a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "BOOKING":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={iconClass("blue")}>
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h.5A1.5 1.5 0 0 1 15 2.5V4H1V2.5A1.5 1.5 0 0 1 2.5 1H3V.5a.5.5 0 0 1 .5-.5Z" />
          <path d="M1 14V5h14v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1Zm3.5-6a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1Zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1Zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1ZM4 10.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5Zm3 .5a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1Zm3 0a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1Z" />
        </svg>
      );
    case "TUTOR_ASSIGNMENT":
    case "ASSIGNMENT":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={iconClass("violet")}>
          <path d="M15.854.146a.5.5 0 0 1 0 .708l-9.5 9.5L5 10l.646-.354 9.5-9.5a.5.5 0 0 1 .708 0Z" />
          <path d="M4.5 11.207 5 10.5l.5.707V14.5a.5.5 0 0 1-.5.5h-4A1.5 1.5 0 0 1 0 13.5v-4A.5.5 0 0 1 .5 9h3.793l.207.207v1.5a.5.5 0 0 0 .5.5Z" />
        </svg>
      );
    case "MESSAGE":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={iconClass("sky")}>
          <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2Z" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={iconClass("gray")}>
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287Z" />
        </svg>
      );
  }
}

function getActionUrl(notification: NotificationRecord) {
  if (!notification.data) return null;
  if (notification.type === "BOOKING") {
    return "/student/calendar";
  }
  if (notification.type === "TUTOR_ASSIGNMENT" || notification.type === "ASSIGNMENT") {
    return "/student/tutors";
  }
  if (notification.type === "PROFILE" || notification.type === "PASSWORD") {
    return "/student/profile";
  }
  return null;
}

export default function StudentNotifications() {
  const { user } = useAuth("STUDENT");
  const [marking, setMarking] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsInitialLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/student/notifications", { credentials: "include" });
      if (!response.ok) {
        if (response.status === 401) {
          // Session non encore prête — on ne bloque pas l'UI avec un message d'erreur.
          setNotifications([]);
          setError(null);
          return;
        }
        console.warn(
          `[StudentNotifications] /api/student/notifications a retourné ${response.status}`
        );
        setError("Impossible de charger vos notifications pour le moment.");
        return;
      }
      const payload: NotificationRecord[] = await response.json();
      setNotifications(payload);
      setError(null);
    } catch (err) {
      console.error("Erreur de chargement des notifications:", err);
      setError("Impossible de charger vos notifications pour le moment.");
    } finally {
      setIsInitialLoading(false);
    }
  }, [user]);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const today = notifications.filter((n) => {
      const date = new Date(n.createdAt);
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }).length;
    return { total, unread, today };
  }, [notifications]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await fetch("/api/student/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ markAllAsRead: true })
      });
      fetchNotifications();
    } catch (err) {
      console.error("Erreur lors du marquage des notifications:", err);
    }
  }, [fetchNotifications]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      setMarking(id);
      try {
        await fetch("/api/student/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ notificationId: id })
        });
        fetchNotifications();
      } catch (err) {
        console.error("Erreur marquage notification:", err);
      } finally {
        setMarking(null);
      }
    },
    [fetchNotifications]
  );

  // Garder une référence à la dernière version de fetchNotifications pour
  // éviter de résouscrire au canal realtime à chaque rendu.
  const fetchRef = useRef(fetchNotifications);
  useEffect(() => {
    fetchRef.current = fetchNotifications;
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    setIsInitialLoading(true);
    fetchRef.current();
    const interval = setInterval(() => fetchRef.current(), 60_000);

    // Nom de canal unique par montage pour éviter que Supabase retourne
    // un canal déjà en cache (et déjà subscribed) en StrictMode/dev.
    const channelName = `student-notifications-${userId}-${
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    }`;

    const channel = supabaseBrowser
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchRef.current();
        }
      )
      .subscribe();

    return () => {
      // removeChannel supprime le canal du cache interne de Supabase,
      // évitant l'erreur "cannot add postgres_changes callbacks after subscribe()"
      // lors du re-mount (StrictMode / re-render).
      supabaseBrowser.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                Notifications
              </h1>
              <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
                Toutes les alertes importantes liées à vos séances et à votre compte.
              </p>
            </div>
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-7.5 md:grid-cols-3">
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Total</div>
            <div className="text-2xl font-semibold text-black dark:text-white">{stats.total}</div>
          </div>
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Non lues</div>
            <div className="text-2xl font-semibold text-primary">{stats.unread}</div>
          </div>
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Aujourd’hui</div>
            <div className="text-2xl font-semibold text-green-600">{stats.today}</div>
          </div>
        </div>

        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h2 className="text-lg font-semibold text-black dark:text-white">Toutes les notifications</h2>
            {isInitialLoading && <span className="text-xs text-waterloo dark:text-manatee">Chargement…</span>}
          </div>

          {error && (
            <div className="p-6 text-sm text-red-500">
              {error}
            </div>
          )}

          {!isInitialLoading && notifications.length === 0 && !error && (
            <div className="p-6 text-sm text-waterloo dark:text-manatee">
              Vous n’avez aucune notification pour le moment.
            </div>
          )}

          <div className="divide-y divide-stroke dark:divide-strokedark">
            {notifications.map((notification) => {
              const actionUrl = getActionUrl(notification);
              return (
                <div
                  key={notification.id}
                  className={`p-6 transition hover:bg-gray-50 dark:hover:bg-gray-800/40 ${
                    !notification.isRead ? "bg-primary/5 border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">{getIcon(notification.type)}</div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3
                          className={`text-sm font-semibold ${
                            !notification.isRead ? "text-black dark:text-white" : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {getTypeLabel(notification.type)}
                        </span>
                        {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>

                      <p
                        className={`mb-3 text-sm ${
                          !notification.isRead ? "text-black dark:text-white" : "text-waterloo dark:text-manatee"
                        }`}
                      >
                        {notification.message}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-waterloo dark:text-manatee">{formatDate(notification.createdAt)}</p>

                        <div className="flex items-center gap-3">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              className="text-xs text-primary hover:underline disabled:opacity-50"
                              disabled={marking === notification.id}
                            >
                              {marking === notification.id ? "..." : "Marquer comme lu"}
                            </button>
                          )}

                          {actionUrl && (
                            <Link href={actionUrl} className="text-xs text-primary hover:underline">
                              Voir →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}


