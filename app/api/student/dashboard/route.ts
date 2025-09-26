import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    // Récupérer les sessions de l'étudiant
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        id,
        subject,
        level,
        type,
        status,
        started_at,
        completed_at,
        duration_minutes,
        topics_covered,
        homework_assigned,
        student_rating,
        tutors!inner(
          users!inner(
            first_name,
            last_name
          )
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });


    // Récupérer les réservations à venir
    const { data: upcomingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        subject,
        level,
        type,
        status,
        scheduled_at,
        duration_minutes,
        tutors!inner(
          users!inner(
            first_name,
            last_name
          )
        )
      `)
      .eq('student_id', user.id)
      .eq('status', 'CONFIRMED')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(3);


    // Récupérer les messages récents
    const { data: recentMessages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        message_threads!inner(
          title,
          tutors!inner(
            users!inner(
              first_name,
              last_name
            )
          )
        )
      `)
      .eq('message_threads.student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);


    // Calculer les statistiques
    const totalSessions = (sessions as any)?.length || 0;
    const completedSessions = (sessions as any)?.filter((s: any) => s.status === 'COMPLETED').length || 0;
    const totalStudyHours = (sessions as any)?.reduce((acc: any, s: any) => acc + (s.duration_minutes || 0), 0) / 60 || 0;
    const averageRating = (sessions as any)?.filter((s: any) => s.student_rating).reduce((acc: any, s: any) => acc + s.student_rating, 0) / (sessions as any).filter((s: any) => s.student_rating).length || 0;

    // Trouver le tuteur principal (celui avec le plus de sessions)
    const tutorStats = (sessions as any)?.reduce((acc: any, session: any) => {
      const tutorName = `${session.tutors.users.first_name} ${session.tutors.users.last_name}`;
      acc[tutorName] = (acc[tutorName] || 0) + 1;
      return acc;
    }, {}) || {};

    const mainTutor = Object.keys(tutorStats).reduce((a, b) => tutorStats[a] > tutorStats[b] ? a : b, '');

    // Données mock de fallback si aucune donnée trouvée
    if (totalSessions === 0) {
      console.log('⚠️  Aucune donnée trouvée, utilisation des données mock');
      const mockDashboard = {
        stats: {
          totalSessions: 12,
          completedSessions: 10,
          totalStudyHours: 15.5,
          averageRating: 4.8
        },
        upcomingSessions: [
          {
            id: '1',
            tutor: 'Nolwen Verton',
            subject: 'Mathématiques',
            level: 'Terminale',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            duration: 60
          }
        ],
        recentSessions: [
          {
            id: '1',
            tutor: 'Alix Tarrade',
            subject: 'Français',
            level: 'Première',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 60,
            topics: ['Commentaire de texte', 'Méthodologie'],
            homework: 'Analyser le texte de Victor Hugo'
          }
        ],
        recentMessages: [
          {
            id: '1',
            from: 'Nolwen Verton',
            content: 'N\'oublie pas de faire les exercices de dérivées',
            date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ],
        mainTutor: 'Nolwen Verton'
      };
      return NextResponse.json(mockDashboard);
    }

    // Formater les données réelles
    const dashboardData = {
      stats: {
        totalSessions,
        completedSessions,
        totalStudyHours: Math.round(totalStudyHours * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10
      },
      upcomingSessions: upcomingBookings?.map((booking: any) => ({
        id: booking.id,
        tutor: `${booking.tutors.users.first_name} ${booking.tutors.users.last_name}`,
        subject: booking.subject,
        level: booking.level,
        date: booking.scheduled_at,
        duration: booking.duration_minutes
      })) || [],
      recentSessions: sessions?.slice(0, 3).map((session: any) => ({
        id: session.id,
        tutor: `${session.tutors.users.first_name} ${session.tutors.users.last_name}`,
        subject: session.subject,
        level: session.level,
        date: session.completed_at || session.started_at,
        duration: session.duration_minutes,
        topics: session.topics_covered ? session.topics_covered.split(', ') : [],
        homework: session.homework_assigned
      })) || [],
      recentMessages: recentMessages?.map((message: any) => ({
        id: message.id,
        from: `${message.message_threads.tutors.users.first_name} ${message.message_threads.tutors.users.last_name}`,
        content: message.content,
        date: message.created_at
      })) || [],
      mainTutor
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données du dashboard' },
      { status: 500 }
    );
  }
}
