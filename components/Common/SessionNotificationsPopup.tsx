"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any> | null;
};

interface SessionNotificationsPopupProps {
  apiEndpoint: string;
  viewAllHref: string;
}

const POPUP_STORAGE_PREFIX = "sika:notif-popup-shown";

export default function SessionNotificationsPopup({
  apiEndpoint,
  viewAllHref,
}: SessionNotificationsPopupProps) {
  const [unread, setUnread] = useState<NotificationRecord[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        if (!meRes.ok) return;
        const me = await meRes.json();
        if (!me?.id) return;

        const storageKey = `${POPUP_STORAGE_PREFIX}:${me.id}`;
        if (sessionStorage.getItem(storageKey) === "1") return;

        const res = await fetch(apiEndpoint, { credentials: "include" });
        if (!res.ok) {
          sessionStorage.setItem(storageKey, "1");
          return;
        }
        const data: NotificationRecord[] = await res.json();
        const unreadList = (data || []).filter((n) => !n.isRead);

        sessionStorage.setItem(storageKey, "1");

        if (!cancelled && unreadList.length > 0) {
          setUnread(unreadList);
          setVisible(true);
        }
      } catch {
        // ignore
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [apiEndpoint]);

  if (!visible) return null;

  const registrations = unread.filter(
    (n) =>
      n.type === "SYSTEM" && n.data?.action === "NEW_STUDENT_REGISTRATION"
  );
  const others = unread.filter(
    (n) =>
      !(n.type === "SYSTEM" && n.data?.action === "NEW_STUDENT_REGISTRATION")
  );

  const close = () => setVisible(false);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={close}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl dark:bg-blacksection"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">
              {unread.length} notification{unread.length > 1 ? "s" : ""} non
              lue{unread.length > 1 ? "s" : ""}
            </h2>
            <p className="mt-1 text-sm text-waterloo dark:text-manatee">
              Voici un récapitulatif de vos notifications en attente.
            </p>
          </div>
          <button
            onClick={close}
            className="text-waterloo transition hover:text-black dark:text-manatee dark:hover:text-white"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-6 py-4">
          {registrations.length > 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-900/20">
              <div className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                {registrations.length} nouvelle
                {registrations.length > 1 ? "s" : ""} inscription
                {registrations.length > 1 ? "s" : ""} en attente d&apos;attribution
              </div>
              <p className="mt-1 text-xs text-orange-800/80 dark:text-orange-200/80">
                Assignez un tuteur à chaque nouvel élève.
              </p>
              <ul className="mt-3 space-y-2">
                {registrations.slice(0, 5).map((n) => (
                  <li
                    key={n.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-white/70 p-2 dark:bg-black/20"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-black dark:text-white">
                        {n.data?.student_name || n.title}
                      </div>
                      <div className="truncate text-xs text-waterloo dark:text-manatee">
                        {n.data?.student_email || n.message}
                      </div>
                    </div>
                    <Link
                      href={`/tutor/administration?tab=assignments&studentId=${n.data?.student_id ?? ""}`}
                      onClick={close}
                      className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      Assigner
                    </Link>
                  </li>
                ))}
                {registrations.length > 5 && (
                  <li className="text-xs text-waterloo dark:text-manatee">
                    +{registrations.length - 5} autres à traiter
                  </li>
                )}
              </ul>
            </div>
          )}

          {others.slice(0, 5).map((n) => (
            <div
              key={n.id}
              className="rounded-lg border border-stroke p-3 dark:border-strokedark"
            >
              <div className="text-sm font-semibold text-black dark:text-white">
                {n.title}
              </div>
              <div className="mt-1 line-clamp-2 text-xs text-waterloo dark:text-manatee">
                {n.message}
              </div>
            </div>
          ))}

          {others.length > 5 && (
            <div className="text-xs text-waterloo dark:text-manatee">
              +{others.length - 5} autres notifications non lues
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-stroke px-6 py-4 dark:border-strokedark">
          <button
            onClick={close}
            className="rounded-md border border-stroke px-4 py-2 text-sm text-black transition hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-gray-800"
          >
            Plus tard
          </button>
          <Link
            href={viewAllHref}
            onClick={close}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Voir toutes les notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
