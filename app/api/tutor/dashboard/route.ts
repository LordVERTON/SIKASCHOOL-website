import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tutorId = user.id;

    // Récupérer les sessions avec les informations des étudiants
    const { data: sessions } = await (supabaseAdmin as any)
      .from('sessions')
      .select(`
        id, 
        student_id, 
        subject, 
        level, 
        session_type, 
        status, 
        started_at, 
        duration_minutes,
        completed_at,
        student_rating,
        topics_covered,
        homework_assigned
      `)
      .eq('tutor_id', tutorId)
      .order('started_at', { ascending: false });

    // Récupérer les informations des étudiants
    const studentIds = [...new Set((sessions || []).map((s: any) => s.student_id))];
    const { data: students } = await (supabaseAdmin as any)
      .from('users')
      .select('id, first_name, last_name, email')
      .in('id', studentIds);

    const studentsMap = new Map();
    if (students) {
      students.forEach((s: any) => studentsMap.set(s.id, s));
    }

    // Récupérer les informations du tuteur
    const { data: tutorInfo } = await (supabaseAdmin as any)
      .from('users')
      .select('first_name, last_name, email, created_at')
      .eq('id', tutorId)
      .single();

    // Calculer les statistiques
    const totalCompleted = (sessions || []).filter((s: any) => s.status === 'COMPLETED').length;
    const totalHours = ((sessions || []).filter((s: any) => s.status === 'COMPLETED').reduce((a: number, s: any) => a + (s.duration_minutes || 0), 0) / 60).toFixed(1);
    const activeStudents = new Set((sessions || []).map((s: any) => s.student_id)).size;
    const upcomingThisWeek = (sessions || []).filter((s: any) => {
      const sessionDate = new Date(s.started_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Début de la journée
      const sessionDateOnly = new Date(sessionDate);
      sessionDateOnly.setHours(0, 0, 0, 0); // Début de la journée pour la session
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const isInDateRange = sessionDateOnly >= today && sessionDateOnly <= nextWeek;
      const hasValidStatus = s.status === 'SCHEDULED' || s.status === 'PENDING' || s.status === 'IN_PROGRESS';
      
      return isInDateRange && hasValidStatus;
    }).length;
    
    // Calculer la note moyenne
    const completedSessions = (sessions || []).filter((s: any) => s.status === 'COMPLETED' && s.student_rating);
    const averageRating = completedSessions.length > 0 
      ? (completedSessions.reduce((sum: number, s: any) => sum + (s.student_rating || 0), 0) / completedSessions.length).toFixed(1)
      : '0.0';

    const stats = [
      { label: 'Séances terminées', value: String(totalCompleted), color: 'text-blue-600', icon: '📚' },
      { label: 'Heures données', value: `${totalHours}h`, color: 'text-green-600', icon: '⏰' },
      { label: 'Élèves uniques', value: String(activeStudents), color: 'text-purple-600', icon: '👨‍🎓' },
      { label: 'Note moyenne', value: `${averageRating}/5`, color: 'text-yellow-600', icon: '⭐' },
      { label: 'À venir (7j)', value: String(upcomingThisWeek), color: 'text-orange-600', icon: '📅' },
    ];

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Sessions à venir avec informations des étudiants (aujourd'hui et jours suivants)
    const upcoming = (sessions || [])
      .filter((s: any) => {
        const sessionDate = new Date(s.started_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Début de la journée
        const sessionDateOnly = new Date(sessionDate);
        sessionDateOnly.setHours(0, 0, 0, 0); // Début de la journée pour la session
        
        // Inclure les sessions d'aujourd'hui et des 7 prochains jours
        const isInDateRange = sessionDateOnly >= today && sessionDateOnly <= nextWeek;
        const hasValidStatus = s.status === 'SCHEDULED' || s.status === 'PENDING' || s.status === 'IN_PROGRESS';
        
        return isInDateRange && hasValidStatus;
      })
      .sort((a: any, b: any) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()) // Tri chronologique
      .slice(0, 4)
      .map((s: any) => {
        const student = studentsMap.get(s.student_id);
        const studentName = student ? `${student.first_name} ${student.last_name}` : 'Élève';
        return {
          id: s.id,
          date: new Date(s.started_at).toLocaleDateString('fr-FR'),
          time: new Date(s.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          duration: s.duration_minutes || 60,
          type: s.session_type || 'INDIVIDUAL',
          participants: studentName,
          subject: s.subject || 'Cours',
          status: s.status
        };
      });

    // Sessions récentes avec informations des étudiants (passées uniquement)
    const recent = (sessions || [])
      .filter((s: any) => {
        const sessionDate = new Date(s.started_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Début de la journée
        return sessionDate < today && (s.status === 'COMPLETED' || s.status === 'CANCELLED');
      })
      .sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()) // Tri chronologique inverse (plus récentes en premier)
      .slice(0, 4)
      .map((s: any) => {
        const student = studentsMap.get(s.student_id);
        const studentName = student ? `${student.first_name} ${student.last_name}` : 'Élève';
        return {
          id: s.id,
          course: s.subject || 'Cours',
          type: s.session_type || 'INDIVIDUAL',
          date: new Date(s.started_at).toLocaleDateString('fr-FR'),
          time: new Date(s.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          duration: s.duration_minutes || 60,
          status: s.status,
          participants: [studentName],
          rating: s.student_rating || null,
          topics: s.topics_covered || null,
          homework: s.homework_assigned || null
        };
      });

    const quickActions = [
      { title: 'Calendrier', description: 'Voir mes créneaux', action: '/tutor/calendar', icon: '📆', color: 'bg-blue-600 hover:bg-blue-700' },
      { title: 'Historique', description: 'Voir les séances', action: '/tutor/history', icon: '🗂️', color: 'bg-purple-600 hover:bg-purple-700' },
      { title: 'Mes élèves', description: 'Consulter', action: '/tutor/eleves', icon: '👨‍🎓', color: 'bg-green-600 hover:bg-green-700' },
      { title: 'Paiements', description: 'Voir mes gains', action: '/tutor/paiements', icon: '💶', color: 'bg-yellow-600 hover:bg-yellow-700' }
    ];

    // Informations du tuteur
    const tutorData = tutorInfo ? {
      name: `${tutorInfo.first_name} ${tutorInfo.last_name}`,
      email: tutorInfo.email,
      memberSince: new Date(tutorInfo.created_at).toLocaleDateString('fr-FR')
    } : null;

    return NextResponse.json({ 
      stats, 
      upcomingSessions: upcoming, 
      recentSessions: recent, 
      quickActions,
      tutorInfo: tutorData
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}


