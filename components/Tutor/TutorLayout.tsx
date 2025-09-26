"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "../Auth/LogoutButton";

interface TutorLayoutProps {
  children: React.ReactNode;
}

export default function TutorLayout({ children }: TutorLayoutProps) {
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
              Espace Tuteur
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
              href="/tutor"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Tableau de bord
            </Link>
            <Link
              href="/tutor/eleves"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Mes élèves
            </Link>
            <Link
              href="/tutor/disponibilites"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Disponibilités
            </Link>
            <Link
              href="/tutor/paiements"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-waterloo hover:bg-gray-50 hover:text-black dark:text-manatee dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <svg className="mr-3 h-5 w-5 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Paiements
            </Link>
          </nav>
          
          {/* Bouton de déconnexion mobile */}
          <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 dark:bg-blacksection">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-black dark:text-white">
              Espace Tuteur
            </h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <Link
                      href="/tutor"
                      className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-waterloo hover:text-black hover:bg-gray-50 dark:text-manatee dark:hover:text-white dark:hover:bg-gray-800"
                    >
                      <svg className="h-6 w-6 shrink-0 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      Tableau de bord
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tutor/eleves"
                      className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-waterloo hover:text-black hover:bg-gray-50 dark:text-manatee dark:hover:text-white dark:hover:bg-gray-800"
                    >
                      <svg className="h-6 w-6 shrink-0 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      Mes élèves
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tutor/disponibilites"
                      className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-waterloo hover:text-black hover:bg-gray-50 dark:text-manatee dark:hover:text-white dark:hover:bg-gray-800"
                    >
                      <svg className="h-6 w-6 shrink-0 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Disponibilités
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tutor/paiements"
                      className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-waterloo hover:text-black hover:bg-gray-50 dark:text-manatee dark:hover:text-white dark:hover:bg-gray-800"
                    >
                      <svg className="h-6 w-6 shrink-0 text-waterloo group-hover:text-black dark:text-manatee dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                      Paiements
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
          
          {/* Bouton de déconnexion desktop */}
          <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700">
            <LogoutButton />
          </div>
        </div>
      </div>

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
