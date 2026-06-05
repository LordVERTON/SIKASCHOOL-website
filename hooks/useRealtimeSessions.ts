"use client";

import { useCallback, useEffect, useRef } from "react";
import { mercureUserTopic, useMercure } from "@/hooks/useMercure";

type Role = "student" | "tutor";

type UseRealtimeSessionsParams = {
  userId?: string;
  role: Role;
  enabled?: boolean;
  onChange: () => void;
};

/**
 * Synchronise en temps réel les écrans liés aux séances (sessions + notifications).
 */
export function useRealtimeSessions({
  userId,
  enabled = true,
  onChange,
}: UseRealtimeSessionsParams) {
  const onChangeRef = useRef(onChange);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const scheduleChange = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      onChangeRef.current();
    }, 750);
  }, []);

  useMercure({
    enabled: enabled && !!userId,
    topics: [userId ? mercureUserTopic(userId) : null],
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string };
        if (payload.type === "session" || payload.type === "notification") {
          scheduleChange();
        }
      } catch {
        scheduleChange();
      }
    },
  });
}
