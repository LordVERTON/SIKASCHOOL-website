import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      // zip, // unused
      level,
      subject,
      goal,
      goalOther,
      contest
    } = body || {};

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // Check existing user
    const { data: existing, error: existingErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing && !existingErr) {
      // Already exists: return success (idempotent)
      return NextResponse.json({ success: true, alreadyExists: true });
    }

    if (existingErr && existingErr.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Erreur vérification utilisateur' }, { status: 500 });
    }

    const rawPassword = `${firstName}123`;
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const { data: newUser, error: userErr } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        role: 'STUDENT',
        is_active: true
      })
      .select('id')
      .single();

    if (userErr || !newUser) {
      return NextResponse.json({ error: 'Erreur création utilisateur' }, { status: 500 });
    }

    // Prepare academic goals text
    const goalsText = goal === 'Autre' ? (goalOther || '') : (goal || '');

    // Create student profile (best-effort)
    await supabase
      .from('students')
      .insert({
        user_id: newUser.id,
        grade_level: level || 'Non spécifié',
        academic_goals: [subject, contest].filter(Boolean).length > 0
          ? `${goalsText}${goalsText ? ' — ' : ''}${[subject, contest].filter(Boolean).join(' / ')}`
          : (goalsText || 'Non spécifié')
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead create error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


