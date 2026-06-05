/**
 * POST /api/student/payments/portal
 *
 * Ouvre une session Stripe Customer Portal : la famille peut
 * - consulter/télécharger ses factures
 * - mettre à jour sa carte
 * - résilier son abonnement
 *
 * Response: { url: string }
 */

import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { stripe, assertStripeConfigured } from '@/lib/stripe';
import { getOrCreateStripeCustomer } from '@/lib/stripe-customer';
import { canAccessStudentFeatures } from '@/lib/student-access';

export async function POST() {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    assertStripeConfigured();

    const customerId = await getOrCreateStripeCustomer(user.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/student/paiements`,
      locale: 'fr',
    });

    return NextResponse.json({ url: portal.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[payments/portal] error', error);
    // Hint UX : le Customer Portal doit être activé une fois dans le Dashboard Stripe
    if (message.includes('No configuration provided')) {
      return NextResponse.json(
        {
          error:
            'Customer Portal non configuré. Active-le sur https://dashboard.stripe.com/test/settings/billing/portal',
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
