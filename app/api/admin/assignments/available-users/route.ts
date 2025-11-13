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

    if (role === 'TUTOR') {
      // Pour les tuteurs, inclure les tuteurs normaux + les admins qui peuvent être tuteurs
      // On récupère d'abord tous les tuteurs, puis on ajoute les admins spécifiques
      const { data: tutors, error: tutorsError } = await supabase
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
        .eq('role', 'TUTOR')
        .eq('is_active', true)
        .order('first_name', { ascending: true });

      if (tutorsError) {
        console.error('Erreur lors de la récupération des tuteurs:', tutorsError);
        return NextResponse.json({ error: 'Erreur lors de la récupération des tuteurs' }, { status: 500 });
      }

      // Récupérer les admins spécifiques qui peuvent être tuteurs
      const adminEmails = ['daniel.verton@sikaschool.com', 'ruudy.mbouza-bayonne@sikaschool.com'];
      const { data: adminTutors, error: adminTutorsError } = await supabase
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
        .eq('role', 'ADMIN')
        .in('email', adminEmails)
        .eq('is_active', true)
        .order('first_name', { ascending: true });

      if (adminTutorsError) {
        console.error('Erreur lors de la récupération des admins tuteurs:', adminTutorsError);
        // On continue même si cette requête échoue
      }

      // Combiner et dédupliquer par email
      const allTutors = [...(tutors || []), ...(adminTutors || [])];
      const tutorsMap = new Map<string, any>();
      allTutors.forEach(tutor => {
        if (tutor && tutor.email) {
          tutorsMap.set(tutor.email.toLowerCase(), tutor);
        }
      });
      const uniqueTutors = Array.from(tutorsMap.values());

      return NextResponse.json({
        users: uniqueTutors,
        count: uniqueTutors.length
      });
    } else {
      // Pour les étudiants, garder la logique normale
      const { data: users, error } = await supabase
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

      if (error) {
        console.error(`Erreur lors de la récupération des ${role.toLowerCase()}s:`, error);
        return NextResponse.json({ error: `Erreur lors de la récupération des ${role.toLowerCase()}s` }, { status: 500 });
      }

      return NextResponse.json({
        users: users || [],
        count: users?.length || 0
      });
    }

  } catch (error) {
    console.error('Erreur dans GET /api/admin/assignments/available-users:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
