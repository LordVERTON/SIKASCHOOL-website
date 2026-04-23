"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { hasAdminPermissions } from "@/lib/admin-permissions";

/**
 * Hook pour récupérer le nombre de notifications non lues en temps réel pour les admins/tuteurs
 */
export function useUnreadAdminNotifications() {
  const { user, loading: authLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const activeRequestRef = useRef<AbortController | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user || authLoading) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Vérifier que l'utilisateur a accès aux fonctionnalités tuteur/admin
    // Les admins (rôle ADMIN) et les tuteurs (rôle TUTOR) peuvent voir les notifications
    const canAccess = user.role === 'ADMIN' || user.role === 'TUTOR' || hasAdminPermissions(user);
    if (!canAccess) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;

    const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch("/api/tutor/notifications", {
        credentials: "include",
        signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status !== 401) {
          console.warn(
            `[useUnreadAdminNotifications] /api/tutor/notifications a retourné ${response.status}`
          );
        }
        setUnreadCount(0);
        return;
      }
      const notifications: Array<{ isRead: boolean }> = await response.json();
      const count = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    } catch (err) {
      // Les erreurs réseau/abort peuvent arriver pendant les transitions de page,
      // hot-reload dev ou backend temporairement indisponible.
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      if (err instanceof TypeError) {
        console.warn(
          "[useUnreadAdminNotifications] Réseau temporairement indisponible pour /api/tutor/notifications"
        );
        setUnreadCount(0);
        return;
      }

      console.error("Erreur lors du chargement du nombre de notifications:", err);
      setUnreadCount(0);
    } finally {
      window.clearTimeout(timeoutId);
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

    const canAccess = user.role === 'ADMIN' || user.role === 'TUTOR' || hasAdminPermissions(user);
    if (!canAccess) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const userId = user.id;

    fetchRef.current();

    // Nom de canal unique par montage pour éviter que Supabase retourne
    // un canal déjà en cache (et déjà subscribed) en StrictMode/dev.
    const channelName = `admin-unread-notifications-${userId}-${
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
      activeRequestRef.current?.abort();
      // removeChannel supprime le canal du cache interne de Supabase,
      // évitant l'erreur "cannot add postgres_changes callbacks after subscribe()"
      // lors du re-mount (StrictMode / re-render).
      supabaseBrowser.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user, authLoading]);

  return { unreadCount, loading };
}

