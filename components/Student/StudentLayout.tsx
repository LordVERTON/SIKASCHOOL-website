"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import StudentSidebar from "./StudentSidebar";
import LogoutButton from "../Auth/LogoutButton";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Logo SikaSchool en haut à droite */}
      <div className="fixed top-4 right-4 z-50">
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
              href="/student/dashboard"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Tableau de bord
            </Link>
            <Link
              href="/student/courses"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mes cours
            </Link>
            <Link
              href="/student/assignments"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Mes devoirs
            </Link>
            <Link
              href="/student/messages"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
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
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Calendrier
            </Link>
            <Link
              href="/student/notifications"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Notifications
            </Link>
            <Link
              href="/student/profile"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
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
        {/* Mobile menu button */}
        <div className="fixed top-4 left-4 z-40 lg:hidden">
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
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
