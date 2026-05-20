"use client";

import { useEffect, useRef } from "react";
import { mercureThreadTopic, mercureUserTopic, useMercure } from "@/hooks/useMercure";

/**
 * Rafraîchit la conversation lorsque la table messages change pour ce fil (Realtime + RLS).
 */
export function useRealtimeThreadMessages(options: {
  threadId: string | null;
  userId: string | undefined;
  enabled?: boolean;
  onInvalidate: () => void;
}) {
  const onInvalidateRef = useRef(options.onInvalidate);
  useEffect(() => {
    onInvalidateRef.current = options.onInvalidate;
  }, [options.onInvalidate]);

  useEffect(() => {
    if (!options.enabled || !options.threadId || !options.userId) {
      return;
    }

    onInvalidateRef.current();
  }, [options.enabled, options.threadId, options.userId]);

  useMercure({
    enabled: options.enabled && !!options.threadId && !!options.userId,
    topics: [
      options.threadId ? mercureThreadTopic(options.threadId) : null,
      options.userId ? mercureUserTopic(options.userId) : null,
    ],
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string; threadId?: string };
        if (
          payload.type === "message" &&
          (!payload.threadId || payload.threadId === options.threadId)
        ) {
          onInvalidateRef.current();
        }
      } catch {
        onInvalidateRef.current();
      }
    },
  });
}
