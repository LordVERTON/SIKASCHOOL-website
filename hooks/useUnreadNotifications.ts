"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabaseBrowser } from "@/lib/supabase-browser";

/**
 * Hook pour récupérer le nombre de notifications non lues en temps réel
 */
export function useUnreadNotifications() {
  const { user, loading: authLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!user || authLoading) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/student/notifications", {
        credentials: "include",
      });
      if (!response.ok) {
        // 401 est attendu pendant les transitions d'authentification → silencieux.
        if (response.status !== 401) {
          console.warn(
            `[useUnreadNotifications] /api/student/notifications a retourné ${response.status}`
          );
        }
        setUnreadCount(0);
        return;
      }
      const notifications: Array<{ isRead: boolean }> = await response.json();
      const count = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    } catch (err) {
      console.error("Erreur lors du chargement du nombre de notifications:", err);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Garder une référence à la dernière version de fetchUnreadCount pour
  // éviter de résouscrire au canal realtime à chaque rendu.
  const fetchRef = useRef(fetchUnreadCount);
  useEffect(() => {
    fetchRef.current = fetchUnreadCount;
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!user || authLoading) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const userId = user.id;

    fetchRef.current();

    // Nom de canal unique par montage pour éviter que Supabase retourne
    // un canal déjà en cache (et déjà subscribed) en StrictMode/dev.
    const channelName = `student-unread-notifications-${userId}-${
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
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchRef.current();
        }
      )
      .subscribe();

    const interval = setInterval(() => fetchRef.current(), 30_000);

    return () => {
      // removeChannel supprime le canal du cache interne de Supabase,
      // évitant l'erreur "cannot add postgres_changes callbacks after subscribe()"
      // lors du re-mount (StrictMode / re-render).
      supabaseBrowser.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user, authLoading]);

  return { unreadCount, loading };
}

