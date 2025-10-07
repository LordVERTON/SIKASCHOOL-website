"use client";

import { use, useEffect, useState } from "react";
import LiveClass from "@/components/LiveClass";
import SessionTimer from "@/components/SessionTimer";

type PageProps = {
  params?: Promise<any>;
};

export default function LiveClassPage({ params }: PageProps) {
  const unwrapped = use(params ?? Promise.resolve({})) as any;
  const classId = unwrapped?.classId as string | undefined;
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL;
  const toWebsocketUrl = (raw?: string | null): string | null => {
    if (!raw) return null;
    const url = String(raw).trim();
    try {
      // If already ws/wss, keep as-is
      if (url.startsWith('ws://') || url.startsWith('wss://')) {
        // If page is https and url is ws://, upgrade to wss:// to avoid mixed content
        if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('ws://')) {
          return url.replace(/^ws:/, 'wss:');
        }
        return url;
      }
      // Support protocol-relative (//host)
      if (url.startsWith('//')) {
        return (typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:') + url;
      }
      // Prepend scheme if missing
      const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
      const u = new URL(hasScheme ? url : `https://${url}`);
      // On https pages, always use wss to avoid mixed-content blocks
      const shouldUseSecure = (typeof window !== 'undefined' && window.location.protocol === 'https:') || u.protocol === 'https:';
      u.protocol = shouldUseSecure ? 'wss:' : 'ws:';
      return u.toString();
    } catch {
      // As a last resort, prefix wss://
      return `wss://${url.replace(/^\/*/, '')}`;
    }
  };
  const websocketUrl = toWebsocketUrl(serverUrl || null);
  
  // Déterminer le chemin de retour basé sur le rôle de l'utilisateur
  const onLeavePath = role === 'instructor' ? '/tutor/calendar' : '/student/calendar';

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ classId }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          let reason = "";
          try { reason = JSON.parse(text)?.error || text; } catch { reason = text; }
          throw new Error(reason || `Impossible d'obtenir le token LiveKit (HTTP ${res.status})`);
        }
        const data = await res.json();
        setToken(data.token);
        setRole(data.role ?? null);
        // Démarrer le timer quand le token est obtenu
        setSessionStartTime(new Date());
      } catch (e: any) {
        setError(e?.message || "Erreur inconnue");
      }
    };
    if (classId) {
      fetchToken();
    }
  }, [classId]);

  if (!classId) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="rounded-lg border border-stroke bg-white p-6 text-center dark:border-strokedark dark:bg-blacksection">
          <p className="text-sm text-black dark:text-white">Identifiant de séance manquant.</p>
        </div>
      </div>
    );
  }

  if (!websocketUrl) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="rounded-lg border border-stroke bg-white p-6 text-center dark:border-strokedark dark:bg-blacksection">
          <p className="text-sm text-black dark:text-white">
            NEXT_PUBLIC_LIVEKIT_SERVER_URL n'est pas configuré.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="rounded-lg border border-stroke bg-white p-6 text-center dark:border-strokedark dark:bg-blacksection">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="rounded-lg border border-stroke bg-white p-6 text-center dark:border-strokedark dark:bg-blacksection">
          <p className="text-sm text-waterloo dark:text-manatee">Chargement de la salle…</p>
        </div>
      </div>
    );
  }


  return (
    <div className="h-screen w-full relative">
      {/* Timer de session */}
      {sessionStartTime && (
        <div className="absolute top-4 left-4 z-[9999]">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <SessionTimer startTime={sessionStartTime} />
          </div>
        </div>
      )}
      
      
      <LiveClass serverUrl={websocketUrl} token={token} onLeavePath={onLeavePath} />
    </div>
  );
}


