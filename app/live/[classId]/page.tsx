"use client";

import { use, useEffect, useState } from "react";
import LiveClass from "@/components/LiveClass";

type PageProps = {
  params?: Promise<any>;
};

export default function LiveClassPage({ params }: PageProps) {
  const unwrapped = use(params ?? Promise.resolve({})) as any;
  const classId = unwrapped?.classId as string | undefined;
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL;

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

  const onLeavePath = role === 'instructor' ? '/tutor/calendar' : '/student/calendar';

  return <LiveClass serverUrl={serverUrl} token={token} onLeavePath={onLeavePath} />;
}


