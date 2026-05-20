"use client";

import { useEffect } from "react";
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
  role,
  enabled = true,
  onChange,
}: UseRealtimeSessionsParams) {
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    onChange();
  }, [enabled, onChange, role, userId]);

  useMercure({
    enabled: enabled && !!userId,
    topics: [userId ? mercureUserTopic(userId) : null],
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string };
        if (payload.type === "session" || payload.type === "notification") {
          onChange();
        }
      } catch {
        onChange();
      }
    },
  });
}
