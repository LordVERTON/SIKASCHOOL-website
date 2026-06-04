"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import StudentSidebar from "./StudentSidebar";
import CreateSessionModal from "./CreateSessionModal";
import LogoutButton from "../Auth/LogoutButton";
import MobileFooterNav from "../Common/MobileFooterNav";
import SessionNotificationsPopup from "../Common/SessionNotificationsPopup";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hideLogo, setHideLogo] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [assignedTutors, setAssignedTutors] = useState<Array<{ id: string; name: string }>>([]);
  const { unreadCount } = useUnreadNotifications();

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY || 0;
      const isDown = current > lastScrollY;
      if (current > 80 && isDown) {
        setHideLogo(true);
      } else {
        setHideLogo(false);
      }
      setLastScrollY(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (!showCreateSession || assignedTutors.length > 0) return;

    const loadTutors = async () => {
      const res = await fetch("/api/student/assigned-tutors", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAssignedTutors((data.tutors || []).map((t: any) => ({ id: t.id, name: t.name })));
      }
    };

    void loadTutors();
  }, [assignedTutors.length, showCreateSession]);

  return (
    <div className="min-h-screen bg-[#f7f8fb] dark:bg-black">
      {/* Logo SikaSchool en haut à droite (auto-hide on scroll) */}
      <div className={`fixed top-4 right-4 z-50 hidden transition-transform duration-300 lg:block ${hideLogo ? '-translate-y-20' : 'translate-y-0'}`}>
        <Image
          src="/images/logo/logo-light.svg"
          alt="SikaSchool Logo"
          width={120}
          height={40}
          className="h-10 w-auto dark:hidden"
        />
        <Image
          src="/images/logo/logo-dark.svg"
          alt="SikaSchool Logo"
          width={120}
          height={40}
          className="h-10 w-auto hidden dark:block"
        />
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-64 flex-col bg-white dark:bg-blacksection">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-black dark:text-white">
              Espace Étudiant
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link
              href="/student"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Tableau de bord
            </Link>
            <Link
              href="/student/messages"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Messages
            </Link>
            <Link
              href="/student/calendar"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Calendrier
            </Link>
            <Link
              href="/student/notifications"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="relative mr-3 h-5 w-5">
                <svg className="h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              Notifications
            </Link>
            <Link
              href="/student/profile"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Mon profil
            </Link>
          </nav>
          
          {/* Bouton de déconnexion mobile */}
          <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <StudentSidebar />

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-stroke bg-white/95 px-4 py-3 backdrop-blur dark:border-strokedark dark:bg-black/85 lg:hidden">
          <div className="flex items-center justify-center">
            <Link href="/student" className="flex items-center gap-2">
              <Image
                src="/images/logo/logo-light.svg"
                alt="SikaSchool"
                width={118}
                height={34}
                className="h-8 w-auto dark:hidden"
                priority
              />
              <Image
                src="/images/logo/logo-dark.svg"
                alt="SikaSchool"
                width={118}
                height={34}
                className="hidden h-8 w-auto dark:block"
                priority
              />
            </Link>
          </div>
        </header>

        {/* Mobile menu button */}
        <div className="hidden">
          <button
            type="button"
            className="p-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-md"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {/* Page content */}
        <main className="pb-24 pt-4 lg:py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <SessionNotificationsPopup
        apiEndpoint="/api/student/notifications"
        viewAllHref="/student/notifications"
      />

      {/* Mobile footer navigation */}
      <MobileFooterNav
        items={[
          {
            href: "/student",
            label: "Accueil",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9 20v-6h6v6"/></svg>
            ),
          },
          {
            href: "/student/calendar",
            label: "Calendrier",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg>
            ),
          },
          {
            href: "/student/calendar",
            label: "Réserver",
            primary: true,
            onClick: () => setShowCreateSession(true),
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14"/></svg>
            ),
          },
          {
            href: "/student/notifications",
            label: "Alertes",
            badge: unreadCount,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
            ),
          },
        ]}
        menuItems={[
          {
            href: "/student",
            label: "Dashboard",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16M4 12h7M4 19h16"/><path d="M15 9h5v6h-5z"/></svg>
            ),
          },
          {
            href: "/student/messages",
            label: "Messages",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16v12H7l-3 3V5Z"/><path d="M8 9h8M8 13h5"/></svg>
            ),
          },
          {
            href: "/student/tutors",
            label: "Tuteurs",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11a4 4 0 1 0-8 0"/><path d="M4 21a8 8 0 0 1 16 0"/><path d="M19 8v4M21 10h-4"/></svg>
            ),
          },
          {
            href: "/student/history",
            label: "Historique",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v5l3 2"/><path d="M4 12a8 8 0 1 0 2.35-5.65"/><path d="M4 4v5h5"/></svg>
            ),
          },
          {
            href: "/student/paiements",
            label: "Paiements",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18v10H3z"/><path d="M3 10h18"/><path d="M7 15h4"/></svg>
            ),
          },
          {
            href: "/student/statistics",
            label: "Stats",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V5"/><path d="M8 17v-6M13 17V7M18 17v-3"/><path d="M4 19h17"/></svg>
            ),
          },
          {
            href: "/student/messages/ai-tutor",
            label: "Sika AI",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M8 8h8v8H8z"/><path d="M10 11h.01M14 11h.01M10 15h4"/></svg>
            ),
          },
          {
            href: "/student/profile",
            label: "Profil",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
            ),
          },
        ]}
      />

      {showCreateSession && (
        <CreateSessionModal
          tutors={assignedTutors}
          onClose={() => setShowCreateSession(false)}
          onSuccess={() => setShowCreateSession(false)}
        />
      )}
    </div>
  );
}
