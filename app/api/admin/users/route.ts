import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { createApplicationUser } from '@/lib/user-management';
import type { UserRole } from '@/lib/constants';

export async function GET() {
  const admin = await getUserSession();
  if (!admin || !canAccessAdminFeatures(admin)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, first_name, last_name, role, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Impossible de récupérer les utilisateurs' }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const admin = await getUserSession();
  if (!admin || !canAccessAdminFeatures(admin)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const allowedRoles: UserRole[] = ['ADMIN', 'TUTOR', 'STUDENT', 'PARENT'];
    const role = allowedRoles.includes(body.role) ? body.role : 'STUDENT';
    const temporaryPassword = `Sika-${randomBytes(9).toString('base64url')}!`;
    const created = await createApplicationUser({
      email: String(body.email || ''),
      password: temporaryPassword,
      firstName: String(body.first_name || ''),
      lastName: String(body.last_name || ''),
      role,
    });

    if (body.is_active === false) {
      const { setUserActive } = await import('@/lib/user-management');
      await setUserActive(created.id, false);
      created.is_active = false;
    }

    return NextResponse.json({
      user: created,
      tempPassword: temporaryPassword,
      message: 'Utilisateur créé dans Supabase Auth',
    });
  } catch (error: any) {
    console.error('[admin/users]', error);
    const status = /already|registered|exists|unique/i.test(String(error?.message || '')) ? 409 : 500;
    return NextResponse.json({ error: 'Impossible de créer l’utilisateur' }, { status });
  }
}
