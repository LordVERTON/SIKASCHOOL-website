'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PaymentCancelPage() {
  const pathname = usePathname();
  const spaceBase = pathname?.startsWith('/family') ? '/family' : '/student';
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-stroke bg-white p-8 text-center dark:border-strokedark dark:bg-blacksection">
        <h1 className="text-2xl font-bold text-black dark:text-white md:text-3xl">Achat interrompu</h1>
        <p className="mt-4 leading-relaxed text-waterloo dark:text-manatee">
          Vous avez quitté le paiement. Vérifiez son statut dans votre espace avant de reprendre votre achat.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`${spaceBase}/paiements`} className="sika-button">Retour aux paiements</Link>
          <Link href={spaceBase} className="sika-button sika-button-secondary">Tableau de bord</Link>
        </div>
      </div>
    </main>
  );
}
