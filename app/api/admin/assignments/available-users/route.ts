import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserSession } from '@/lib/auth-simple';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'TUTOR' ou 'STUDENT'

    if (!role || !['TUTOR', 'STUDENT'].includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide. Utilisez TUTOR ou STUDENT' }, { status: 400 });
    }

    let query;
    
    if (role === 'TUTOR') {
      // Pour les tuteurs, inclure les tuteurs normaux + Daniel Verton spécifiquement
      query = supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          is_active,
          created_at
        `)
        .or('role.eq.TUTOR,and(email.eq.daniel.verton@sikaschool.com,role.eq.ADMIN)')
        .eq('is_active', true)
        .order('first_name', { ascending: true });
    } else {
      // Pour les étudiants, garder la logique normale
      query = supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          is_active,
          created_at
        `)
        .eq('role', role)
        .eq('is_active', true)
        .order('first_name', { ascending: true });
    }

    const { data: users, error } = await query;

    if (error) {
      console.error(`Erreur lors de la récupération des ${role.toLowerCase()}s:`, error);
      return NextResponse.json({ error: `Erreur lors de la récupération des ${role.toLowerCase()}s` }, { status: 500 });
    }

    return NextResponse.json({
      users: users || [],
      count: users?.length || 0
    });

  } catch (error) {
    console.error('Erreur dans GET /api/admin/assignments/available-users:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
