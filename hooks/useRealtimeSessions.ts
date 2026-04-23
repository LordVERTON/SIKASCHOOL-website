"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

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

    const filter = role === "student" ? `student_id=eq.${userId}` : `tutor_id=eq.${userId}`;
    const channelName = `realtime-sessions-${role}-${userId}-${
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    }`;

    const channel = supabaseBrowser
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions", filter }, onChange)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        onChange
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [enabled, onChange, role, userId]);
}
