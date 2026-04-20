"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-16">
      {/* Fond dégradé + cercles décoratifs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      {showConfetti && <Confetti />}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-2xl border border-stroke bg-white p-8 text-center shadow-solid-10 dark:border-strokedark dark:bg-blacksection md:p-12"
      >
        {/* Coche animée */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20"
        >
          <motion.svg
            width="44"
            height="44"
            viewBox="0 0 52 52"
            fill="none"
            className="text-emerald-600 dark:text-emerald-300"
          >
            <motion.path
              d="M14 27l8 8 16-18"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            />
          </motion.svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-black dark:text-white md:text-3xl"
        >
          Paiement confirmé !
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-3 max-w-sm text-para2 text-waterloo dark:text-manatee"
        >
          Merci pour ta confiance. Tes séances ont été créditées sur ton compte.
          Un reçu vient de t&apos;être envoyé par email.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="/student/paiements"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primaryho"
          >
            Voir mon solde
          </Link>
          <Link
            href="/student/tutors"
            className="inline-flex items-center justify-center rounded-lg border border-stroke bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-50 dark:border-strokedark dark:bg-transparent dark:text-white dark:hover:bg-black/30"
          >
            Réserver une séance
          </Link>
        </motion.div>

        <p className="mt-6 text-xs text-waterloo dark:text-manatee">
          Le traitement par Stripe peut prendre quelques secondes. Si tes séances
          n&apos;apparaissent pas immédiatement, actualise la page.
        </p>
      </motion.div>
    </main>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 30 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const duration = 2 + Math.random() * 1.5;
        const color = ["bg-primary", "bg-emerald-400", "bg-yellow-400", "bg-sky-400", "bg-pink-400"][i % 5];
        return (
          <motion.span
            key={i}
            className={`absolute top-[-20px] h-2 w-2 rounded-sm ${color}`}
            style={{ left: `${left}%` }}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ duration, delay, ease: "linear" }}
          />
        );
      })}
    </div>
  );
}
