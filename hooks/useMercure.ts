"use client";

import { useEffect, useRef } from "react";

type UseMercureOptions = {
  topics: Array<string | null | undefined>;
  enabled?: boolean;
  onMessage: (event: MessageEvent<string>) => void;
};

export function mercureUserTopic(userId: string) {
  return `https://sikaschool.app/realtime/users/${userId}`;
}

export function mercureThreadTopic(threadId: string) {
  return `https://sikaschool.app/realtime/messages/threads/${threadId}`;
}

export function useMercure({ topics, enabled = true, onMessage }: UseMercureOptions) {
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const hubUrl = process.env.NEXT_PUBLIC_MERCURE_URL;
    const cleanTopics = Array.from(new Set(topics.filter(Boolean) as string[]));

    if (!enabled || !hubUrl || cleanTopics.length === 0 || typeof EventSource === "undefined") {
      return;
    }

    const url = new URL(hubUrl);
    cleanTopics.forEach((topic) => url.searchParams.append("topic", topic));

    const source = new EventSource(url.toString(), { withCredentials: true });
    source.onmessage = (event) => onMessageRef.current(event);
    source.onerror = () => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[mercure] Connexion SSE interrompue, reconnexion automatique du navigateur.");
      }
    };

    return () => source.close();
  }, [enabled, topics.join("|")]);
}

