'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export function usePlanCheckout(returnPath: '/packs' | '/book-online') {
  const router = useRouter();
  const { language } = useLanguage();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const fr = language === 'fr';

  const startCheckout = async (planId: string) => {
    if (pending.current) return;
    pending.current = true;
    setPendingPlan(planId);
    setError(null);
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.status === 401) {
        router.push(`/auth/signin?next=${encodeURIComponent(returnPath)}`);
        return;
      }
      if (!response.ok) throw new Error('auth_unavailable');
      const user = await response.json();
      if (user?.role !== 'STUDENT' && user?.role !== 'PARENT') {
        setError(
          fr
            ? 'Seuls les comptes Élève ou Parent peuvent acheter des séances.'
            : 'A student or parent account is required to purchase sessions.'
        );
        return;
      }
      const checkoutResponse = await fetch('/api/student/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planId }),
      });
      const checkout = await checkoutResponse.json();
      if (!checkoutResponse.ok || !checkout?.url)
        throw new Error('checkout_unavailable');
      window.location.assign(checkout.url);
    } catch {
      setError(
        fr
          ? 'Impossible de préparer le paiement. Réessayez dans quelques instants.'
          : 'Unable to prepare checkout. Please try again shortly.'
      );
    } finally {
      pending.current = false;
      setPendingPlan(null);
    }
  };
  return { startCheckout, pendingPlan, error };
}
