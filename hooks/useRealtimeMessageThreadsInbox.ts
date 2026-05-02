"use client";

import { useEffect, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

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

    const uid = options.userId;
    const channelName = `messages-inbox-${uid}-${
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
        },
        () => {
          onInvalidateRef.current();
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [options.enabled, options.userId]);
}
