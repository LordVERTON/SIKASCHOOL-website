'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PaymentSuccessPage() {
  const pathname = usePathname();
  const spaceBase = pathname?.startsWith('/family') ? '/family' : '/student';
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-stroke bg-white p-8 text-center dark:border-strokedark dark:bg-blacksection">
        <h1 className="text-2xl font-bold text-black dark:text-white md:text-3xl">Retour du paiement</h1>
        <p className="mt-4 leading-relaxed text-waterloo dark:text-manatee">
          Retrouvez le statut de votre achat, vos crédits et vos factures dans votre espace paiements.
          Votre solde peut prendre quelques instants à se mettre à jour.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`${spaceBase}/paiements`} className="sika-button">Vérifier mon paiement</Link>
          <Link href={`${spaceBase}/tutors`} className="sika-button sika-button-secondary">Mes tuteurs</Link>
        </div>
      </div>
    </main>
  );
}
