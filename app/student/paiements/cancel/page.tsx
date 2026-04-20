"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg rounded-2xl border border-stroke bg-white p-8 text-center shadow-solid-10 dark:border-strokedark dark:bg-blacksection md:p-12"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-300">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-black dark:text-white md:text-3xl">
          Paiement annulé
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-para2 text-waterloo dark:text-manatee">
          Pas de souci — aucun montant n&apos;a été prélevé sur ta carte.
          Tu peux reprendre ton achat quand tu veux.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/student/paiements"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primaryho"
          >
            Retour aux paiements
          </Link>
          <Link
            href="/student"
            className="inline-flex items-center justify-center rounded-lg border border-stroke bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-50 dark:border-strokedark dark:bg-transparent dark:text-white dark:hover:bg-black/30"
          >
            Tableau de bord
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
