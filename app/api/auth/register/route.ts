import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/auth';
import { createApplicationUser } from '@/lib/user-management';
import {
  insertAdminNewStudentNotifications,
  insertStudentPasswordChangeNotification,
} from '@/lib/registration-emails';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : null;
    const role = body?.role === 'PARENT' ? 'PARENT' : 'STUDENT';

    if (!email || !firstName || !lastName || password.length < 8) {
      return NextResponse.json(
        { error: 'Nom, prénom, e-mail et mot de passe de 8 caractères minimum requis' },
        { status: 400 },
      );
    }

    const user = await createApplicationUser({ email, password, firstName, lastName, phone, role });

    if (role === 'STUDENT') {
      await insertStudentPasswordChangeNotification(supabaseAdmin, user.id, 'register_form');
      await insertAdminNewStudentNotifications(supabaseAdmin, user, {
        phone: phone || undefined,
        accountType: 'student',
      });
    }

    await signIn('credentials', { email, password, redirect: false });

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès.',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
      },
      supabaseCredentials: { email, password },
    });
  } catch (error: any) {
    const message = String(error?.message || '');
    if (/already|registered|exists|unique/i.test(message)) {
      return NextResponse.json({ error: 'Un compte avec cet e-mail existe déjà' }, { status: 409 });
    }
    console.error('[auth/register]', error);
    return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 });
  }
}
