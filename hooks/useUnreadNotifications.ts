"use client";

import { useEffect, useState, useCallback } from "react";
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
        throw new Error("Erreur lors de la récupération des notifications");
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

  useEffect(() => {
    if (!user || authLoading) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Charger initialement
    fetchUnreadCount();

    // S'abonner aux changements en temps réel
    const channel = supabaseBrowser
      .channel(`student-unread-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Rafraîchir le compteur quand une notification change
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Rafraîchir périodiquement (toutes les 30 secondes)
    const interval = setInterval(fetchUnreadCount, 30_000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [user, authLoading, fetchUnreadCount]);

  return { unreadCount, loading };
}

