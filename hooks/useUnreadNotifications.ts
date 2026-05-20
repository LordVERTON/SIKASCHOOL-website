"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { mercureUserTopic, useMercure } from "@/hooks/useMercure";

/**
 * Hook pour recuperer le nombre de notifications non lues en temps reel.
 */
export function useUnreadNotifications() {
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

    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;

    const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch("/api/student/notifications", {
        credentials: "include",
        signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status !== 401) {
          console.warn(
            `[useUnreadNotifications] /api/student/notifications a retourne ${response.status}`
          );
        }
        setUnreadCount(0);
        return;
      }
      const notifications: Array<{ isRead: boolean }> = await response.json();
      setUnreadCount(notifications.filter((n) => !n.isRead).length);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      if (err instanceof TypeError) {
        console.warn(
          "[useUnreadNotifications] Reseau temporairement indisponible pour /api/student/notifications"
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

    fetchRef.current();
    const interval = window.setInterval(() => fetchRef.current(), 30_000);

    return () => {
      activeRequestRef.current?.abort();
      window.clearInterval(interval);
    };
  }, [user, authLoading]);

  useMercure({
    enabled: !!user && !authLoading,
    topics: [user?.id ? mercureUserTopic(user.id) : null],
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string };
        if (
          payload.type === "notification" ||
          payload.type === "message" ||
          payload.type === "session"
        ) {
          fetchRef.current();
        }
      } catch {
        fetchRef.current();
      }
    },
  });

  return { unreadCount, loading };
}
