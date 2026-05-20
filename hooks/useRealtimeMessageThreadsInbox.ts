"use client";

import { useEffect, useRef } from "react";
import { mercureUserTopic, useMercure } from "@/hooks/useMercure";

/**
 * Invalide la liste des conversations lorsqu’un message accessible à l’utilisateur change (RLS limite les événements).
 */
export function useRealtimeMessageThreadsInbox(options: {
  userId: string | undefined;
  enabled?: boolean;
  onInvalidate: () => void;
}) {
  const onInvalidateRef = useRef(options.onInvalidate);
  useEffect(() => {
    onInvalidateRef.current = options.onInvalidate;
  }, [options.onInvalidate]);

  useEffect(() => {
    if (!options.enabled || !options.userId) {
      return;
    }

    onInvalidateRef.current();
  }, [options.enabled, options.userId]);

  useMercure({
    enabled: options.enabled && !!options.userId,
    topics: [options.userId ? mercureUserTopic(options.userId) : null],
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string };
        if (payload.type === "message" || payload.type === "notification") {
          onInvalidateRef.current();
        }
      } catch {
        onInvalidateRef.current();
      }
    },
  });
}
