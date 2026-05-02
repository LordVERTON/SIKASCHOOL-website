"use client";

import { useEffect, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

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

    const tid = options.threadId;
    const channelName = `thread-messages-${tid}-${
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
          table: "messages",
          filter: `thread_id=eq.${tid}`,
        },
        () => {
          onInvalidateRef.current();
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [options.enabled, options.threadId, options.userId]);
}
