import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserSession } from '@/lib/auth-simple';
import { resolveLiveClassMembership } from '@/lib/livekit-access';
import { stopRecording } from '@/lib/livekit-egress';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({ classId: z.string().min(1), egressId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const membership = await resolveLiveClassMembership(user.id, parsed.data.classId);
    if (!membership || membership.role !== 'instructor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await stopRecording(parsed.data.egressId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Stop recording error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


