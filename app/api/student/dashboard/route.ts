import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { formatHours } from '@/lib/time-utils';

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const studentId = user.id;

    // Récupérer les données réelles de Supabase

    // 1. Récupérer les sessions de l'étudiant
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select(`
        id,
        student_id,
        tutor_id,
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
        created_at,
        updated_at
      `)
      .eq('student_id', studentId)
      .order('started_at', { ascending: false });

    if (sessionsError) {
      throw sessionsError;
    }

    // 2. Récupérer les informations des tuteurs
    const tutorIds = [...new Set((sessions as any)?.map((s: any) => s.tutor_id).filter(Boolean) || [])];
    let tutorsMap = new Map();
    
    if (tutorIds.length > 0) {
      const { data: tutors, error: tutorsError } = await supabaseAdmin
        .from('users')
        .select('id, first_name, last_name, avatar_url')
        .in('id', tutorIds);
      
      if (!tutorsError && tutors) {
        tutorsMap = new Map((tutors as any).map((tutor: any) => [tutor.id, tutor]));
      }
    }

    // 3. Récupérer des messages récents (fallback simple basé sur l'expéditeur)
    let messages: any[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('id, content, created_at, sender_id, thread_id')
        .or(`sender_id.eq.${studentId}`)
        .order('created_at', { ascending: false })
        .limit(3);
      if (!error && data) {
        messages = data as any[];
      }
    } catch {
      // ignorer les erreurs de messages pour ne pas bloquer le dashboard
    }

    // Calculer les statistiques
    const _totalSessions = (sessions as any)?.length || 0;
    const completedSessions = (sessions as any)?.filter((s: any) => s.status === 'COMPLETED').length || 0;
    const totalHours = (sessions as any)?.reduce((acc: number, s: any) => acc + (s.duration_minutes || 0), 0) / 60 || 0;
    // Statistiques calculées
    
    // Calculer la note moyenne
    const ratedSessions = (sessions as any)?.filter((s: any) => s.student_rating && s.student_rating > 0) || [];
    const averageRating = ratedSessions.length > 0 
      ? (ratedSessions.reduce((acc: number, s: any) => acc + s.student_rating, 0) / ratedSessions.length).toFixed(1)
      : 'N/A';

    // Tuteurs uniques
    const uniqueTutors = new Set((sessions as any)?.map((s: any) => s.tutor_id).filter(Boolean) || []);
    const activeTutors = uniqueTutors.size;

    // Séances à venir (prochaines 7 jours)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingSessions = (sessions as any)?.filter((s: any) => {
      const sessionDate = new Date(s.started_at);
      return sessionDate >= now && sessionDate <= nextWeek && s.status === 'SCHEDULED';
    }).slice(0, 3) || [];

    // Séances récentes (dernières 3) — uniquement les séances passées pour cet élève
    const recentSessions = (sessions as any)?.filter((s: any) => {
      const sessionDate = new Date(s.started_at);
      return sessionDate <= now; // séance passée
    })
    .sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .slice(0, 3) || [];

    // Messages récents
    const recentMessages = (messages as any)?.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      date: new Date(msg.created_at).toLocaleDateString('fr-FR'),
      time: new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sender: 'Vous',
      subject: msg.subject || 'Message'
    })) || [];

    // Tuteur principal (celui avec le plus de séances)
    const tutorStats = (sessions as any)?.reduce((acc: any, session: any) => {
      if (session.tutor_id) {
        acc[session.tutor_id] = (acc[session.tutor_id] || 0) + 1;
      }
      return acc;
    }, {}) || {};
    
    const mainTutorId = Object.keys(tutorStats).reduce((a, b) => tutorStats[a] > tutorStats[b] ? a : b, '');
    const mainTutor = tutorsMap.get(mainTutorId);

    // Load assessments and compute learning metrics
    const { data: assessments } = await supabaseAdmin
      .from('session_assessments')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    function average(arr: number[]) {
      if (!arr || arr.length === 0) return 0;
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    const assessmentsList = (assessments ?? []) as any[];
    const metrics = {
      concentration: average(assessmentsList.map((a: any) => Number(a.concentration) || 0)),
      participation: average(assessmentsList.map((a: any) => Number(a.participation) || 0)),
      preparation: average(assessmentsList.map((a: any) => Number(a.preparation) || 0)),
      improvement: average(assessmentsList.map((a: any) => Number(a.improvement) || 0)),
      retention: average(assessmentsList.map((a: any) => Number(a.retention) || 0)),
      comprehension: average(assessmentsList.map((a: any) => Number(a.comprehension) || 0)),
      time_management: average(assessmentsList.map((a: any) => Number(a.time_management) || 0)),
      collaboration: average(assessmentsList.map((a: any) => Number(a.collaboration) || 0))
    };

    const last = assessmentsList[0] as any | undefined;
    const prev = assessmentsList[1] as any | undefined;
    const deltas = last && prev ? {
      improvement: (Number(last?.improvement) || 0) - (Number(prev?.improvement) || 0),
      retention: (Number(last?.retention) || 0) - (Number(prev?.retention) || 0)
    } : { improvement: 0, retention: 0 };

    const dashboardData = {
      stats: [
        {
          label: 'Séances terminées',
          value: completedSessions.toString(),
          color: 'text-blue-600',
          icon: '📚'
        },
        {
          label: 'Heures de cours',
          value: formatHours(totalHours),
          color: 'text-green-600',
          icon: '⏰'
        },
        {
          label: 'Tuteur(s) actif(s)',
          value: activeTutors.toString(),
          color: 'text-purple-600',
          icon: '👨‍🏫'
        },
        {
          label: 'Note moyenne',
          value: averageRating,
          color: 'text-yellow-600',
          icon: '⭐'
        }
      ],
      learningMetrics: {
        averages: metrics,
        deltas
      },
      quickActions: [
        {
          title: 'Réserver une séance',
          description: 'Planifier un nouveau cours',
          action: 'booking',
          icon: '📅',
          color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
          title: 'Mes tuteurs',
          description: 'Voir tous les tuteurs',
          action: 'tutors',
          icon: '👨‍🏫',
          color: 'bg-green-600 hover:bg-green-700'
        },
        {
          title: 'Historique',
          description: 'Séances passées',
          action: 'history',
          icon: '📋',
          color: 'bg-purple-600 hover:bg-purple-700'
        },
        {
          title: 'Messages',
          description: 'Communiquer',
          action: 'messages',
          icon: '💬',
          color: 'bg-orange-600 hover:bg-orange-700'
        }
      ],
      upcomingSessions: upcomingSessions.map((session: any) => {
        const tutor = tutorsMap.get(session.tutor_id);
        return {
          id: session.id,
          course: session.subject || 'Cours',
          type: session.type || 'INDIVIDUAL',
          tutor: tutor ? `${tutor.first_name} ${tutor.last_name}` : 'Tuteur',
          tutorAvatar: tutor?.avatar_url || '/images/user/user-01.png',
          date: new Date(session.started_at).toLocaleDateString('fr-FR'),
          time: new Date(session.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          duration: session.duration_minutes || 60,
          meetingUrl: '#', // À implémenter si nécessaire
          notes: session.tutor_notes || ''
        };
      }),
      recentSessions: recentSessions.map((session: any) => {
        const tutor = tutorsMap.get(session.tutor_id);
        return {
          id: session.id,
          course: session.subject || 'Cours',
          type: session.type || 'INDIVIDUAL',
          level: session.level || 'Niveau',
          tutor: tutor ? `${tutor.first_name} ${tutor.last_name}` : 'Tuteur',
          tutorAvatar: tutor?.avatar_url || '/images/user/user-01.png',
          date: new Date(session.started_at).toLocaleDateString('fr-FR'),
          time: new Date(session.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          duration: session.duration_minutes || 60,
          status: session.status || 'COMPLETED',
          topics: Array.isArray(session.topics_covered)
            ? session.topics_covered
            : (session.topics_covered ? String(session.topics_covered).split(',').map((t: string) => t.trim()) : []),
          homework: session.homework_assigned || '',
          studentRating: session.student_rating || 0,
          tutorRating: 0
        };
      }),
      recentMessages: recentMessages,
      tutorStats: {
        totalSessions: completedSessions,
        totalHours: totalHours,
        averageRating: averageRating,
        mainTutor: mainTutor ? `${mainTutor.first_name || ''} ${mainTutor.last_name || ''}`.trim() : 'Aucun'
      }
    };

    // Données du dashboard prêtes

    return NextResponse.json(dashboardData);

      } catch {
    
    // Retourner des données par défaut en cas d'erreur pour éviter un écran vide
    const fallbackData = {
      stats: [
        {
          label: 'Séances terminées',
          value: '0',
          color: 'text-blue-600',
          icon: '📚'
        },
        {
          label: 'Heures de cours',
          value: '0h',
          color: 'text-green-600',
          icon: '⏰'
        },
        {
          label: 'Tuteurs actifs',
          value: '0',
          color: 'text-purple-600',
          icon: '👨‍🏫'
        },
        {
          label: 'Note moyenne',
          value: 'N/A',
          color: 'text-yellow-600',
          icon: '⭐'
        }
      ],
      quickActions: [
        {
          title: 'Réserver une séance',
          description: 'Planifier un nouveau cours',
          action: 'booking',
          icon: '📅',
          color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
          title: 'Mes tuteurs',
          description: 'Voir tous les tuteurs',
          action: 'tutors',
          icon: '👨‍🏫',
          color: 'bg-green-600 hover:bg-green-700'
        },
        {
          title: 'Historique',
          description: 'Séances passées',
          action: 'history',
          icon: '📋',
          color: 'bg-purple-600 hover:bg-purple-700'
        },
        {
          title: 'Messages',
          description: 'Communiquer',
          action: 'messages',
          icon: '💬',
          color: 'bg-orange-600 hover:bg-orange-700'
        }
      ],
      upcomingSessions: [],
      recentSessions: [],
      recentMessages: [],
      tutorStats: {
        totalSessions: 0,
        totalHours: 0,
        averageRating: 'N/A',
        mainTutor: 'Aucun'
      }
    };
    
    return NextResponse.json(fallbackData);
  }
}