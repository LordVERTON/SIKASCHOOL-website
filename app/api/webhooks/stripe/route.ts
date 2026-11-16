import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { processStripeEvent } from '@/lib/stripe-webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: 'Webhook unavailable' }, { status: 503 });
  }
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  let event;
  try {
    // Signature verification must use the unmodified request body.
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  try {
    await processStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch {
    console.error('[stripe] processing failed', { eventId: event.id, type: event.type });
    return NextResponse.json({ received: false, error: 'Processing failed' }, { status: 500 });
  }
}
