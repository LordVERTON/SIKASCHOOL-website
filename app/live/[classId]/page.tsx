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
  const [egressId, setEgressId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL;
  
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
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Impossible d'obtenir le token LiveKit");
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

  if (!serverUrl) {
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

  const canRecord = role === 'instructor';

  const handleStartRecording = async () => {
    try {
      const res = await fetch('/api/livekit/recording/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ classId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to start recording');
      }
      const data = await res.json();
      setEgressId(data.egressId);
    } catch (e: any) {
      setError(e?.message || 'Erreur en démarrant l\'enregistrement');
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!egressId) return;
      const res = await fetch('/api/livekit/recording/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ classId, egressId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to stop recording');
      }
      setEgressId(null);
    } catch (e: any) {
      setError(e?.message || 'Erreur en arrêtant l\'enregistrement');
    }
  };

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
      
      {/* Boutons d'enregistrement */}
      {canRecord && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          {!egressId ? (
            <button onClick={handleStartRecording} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:opacity-90">
              Démarrer l'enregistrement
            </button>
          ) : (
            <button onClick={handleStopRecording} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:opacity-90">
              Arrêter l'enregistrement
            </button>
          )}
        </div>
      )}
      
      <LiveClass serverUrl={serverUrl} token={token} onLeavePath={onLeavePath} />
    </div>
  );
}


