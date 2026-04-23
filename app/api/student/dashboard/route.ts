import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { formatHours } from '@/lib/time-utils';
import { logger } from '@/lib/logger';
import type {
  DashboardSession,
  SessionParticipantLink,
  DashboardUser,
} from '@/types/dashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const studentId = user.id;

    // Récupérer les données réelles de Supabase

    // 1. Récupérer les sessions de l'étudiant (même logique que l'agenda)
    // Sessions où l'étudiant est le titulaire (legacy)
    const { data: ownSessions, error: ownSessionsError } = await supabaseAdmin
      .from('sessions')
      .select(`
        id,
        student_id,
        tutor_id,
        subject,
        level,
        session_type,
        status,
        started_at,
        completed_at,
        duration_minutes,
        topics_covered,
        homework_assigned,
        student_rating,
        tutor_rating,
        created_at,
        updated_at
      `)
      .eq('student_id', studentId)
      .order('started_at', { ascending: false });

    if (ownSessionsError) {
      throw ownSessionsError;
    }

    // Sessions où l'étudiant est participant
    const { data: participantLinks, error: participantError } = await supabaseAdmin
      .from('session_participants')
      .select('session_id')
      .eq('student_id', studentId);

    if (participantError) {
      logger.error('Dashboard: participant links error', { error: participantError });
    }

    let participantSessions: DashboardSession[] = [];
    const participantSessionIds = Array.from(
      new Set((participantLinks || []).map((p: SessionParticipantLink) => p.session_id))
    );
    if (participantSessionIds.length > 0) {
      const { data: partSessions, error: partSessionsError } = await supabaseAdmin
        .from('sessions')
        .select(`
          id,
          student_id,
          tutor_id,
          subject,
          level,
          session_type,
          status,
          started_at,
          completed_at,
          duration_minutes,
          topics_covered,
          homework_assigned,
          student_rating,
          tutor_rating,
          created_at,
          updated_at
        `)
        .in('id', participantSessionIds)
        .order('started_at', { ascending: false });

      if (partSessionsError) {
        console.error('Erreur sessions participants:', partSessionsError);
      } else {
        participantSessions = partSessions || [];
      }
    }

    // Fusionner et dédupliquer les sessions
    const byId = new Map<string, DashboardSession>();
    for (const s of (ownSessions ?? []) as DashboardSession[]) byId.set(s.id, s);
    for (const s of participantSessions) byId.set(s.id, s);
    const sessions = Array.from(byId.values()).sort((a, b) =>
      (a.started_at ?? '') > (b.started_at ?? '') ? -1 : 1
    );

    // 2. Récupérer les informations des tuteurs
    const tutorIds = [...new Set(sessions.map((s) => s.tutor_id).filter(Boolean))];
    const tutorsMap = new Map<string, DashboardUser>();

    if (tutorIds.length > 0) {
      const { data: tutors, error: tutorsError } = await supabaseAdmin
        .from('users')
        .select('id, first_name, last_name, avatar_url, email')
        .in('id', tutorIds);

      if (!tutorsError && tutors) {
        for (const t of tutors as DashboardUser[]) {
          tutorsMap.set(t.id, t);
        }
      }
    }

    // 3. Récupérer les informations de l'étudiant
    const { data: studentProfile, error: studentError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        avatar_url,
        students(grade_level, academic_goals, created_at)
      `)
      .eq('id', studentId)
      .single();

    if (studentError) {
      console.error('Error fetching student profile:', studentError);
    }

    // Informations de l'étudiant pour le dashboard
    const studentInfo = studentProfile ? {
      id: (studentProfile as any).id,
      firstName: (studentProfile as any).first_name,
      lastName: (studentProfile as any).last_name,
      email: (studentProfile as any).email,
      avatarUrl: (studentProfile as any).avatar_url,
      gradeLevel: (studentProfile as any).students?.[0]?.grade_level || 'Non spécifié',
      academicGoals: (studentProfile as any).students?.[0]?.academic_goals || 'Non spécifiés',
      memberSince: (studentProfile as any).students?.[0]?.created_at || (studentProfile as any).created_at
    } : null;

    // 4. Récupérer des messages récents et notifications
    let messages: any[] = [];
    let notifications: any[] = [];
    
    try {
      // Messages récents
      const { data: messagesData, error: messagesError } = await supabaseAdmin
        .from('messages')
        .select('id, content, created_at, sender_id, thread_id, subject')
        .or(`sender_id.eq.${studentId}`)
        .order('created_at', { ascending: false })
        .limit(3);
      if (!messagesError && messagesData) {
        messages = messagesData as any[];
      }
      
      // Notifications récentes
      const { data: notificationsData, error: notificationsError } = await supabaseAdmin
        .from('notifications')
        .select('id, title, message, type, created_at, data')
        .eq('user_id', studentId)
        .order('created_at', { ascending: false })
        .limit(5);
      if (!notificationsError && notificationsData) {
        notifications = notificationsData as any[];
      }
    } catch {
      // ignorer les erreurs de messages/notifications pour ne pas bloquer le dashboard
    }

    // Calculer les statistiques détaillées
    const _totalSessions = (sessions as any)?.length || 0;
    const completedSessions = (sessions as any)?.filter((s: any) => s.status === 'COMPLETED').length || 0;
    const pendingSessions = (sessions as any)?.filter((s: any) => s.status === 'PENDING').length || 0;
    const scheduledSessions = (sessions as any)?.filter((s: any) => s.status === 'SCHEDULED').length || 0;
    const _cancelledSessions = (sessions as any)?.filter((s: any) => s.status === 'CANCELLED').length || 0;
    
    // Calculer les heures totales (seulement les sessions terminées)
    const totalHours = (sessions as any)?.filter((s: any) => s.status === 'COMPLETED')
      .reduce((acc: number, s: any) => acc + (s.duration_minutes || 0), 0) / 60 || 0;
    
    // Calculer la note moyenne (sessions notées par l'étudiant)
    const ratedSessions = (sessions as any)?.filter((s: any) => s.student_rating && s.student_rating > 0) || [];
    const averageRating = ratedSessions.length > 0 
      ? (ratedSessions.reduce((acc: number, s: any) => acc + s.student_rating, 0) / ratedSessions.length).toFixed(1)
      : 'N/A';

    // Tuteurs uniques
    const uniqueTutors = new Set((sessions as any)?.map((s: any) => s.tutor_id).filter(Boolean) || []);
    const _activeTutors = uniqueTutors.size;

    // Sessions en cours (IN_PROGRESS)
    const _inProgressSessions = (sessions as any)?.filter((s: any) => s.status === 'IN_PROGRESS').length || 0;

    // Séances à venir (prochaines 7 jours) - inclure PENDING et SCHEDULED
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingSessions = (sessions as any)?.filter((s: any) => {
      const sessionDate = new Date(s.started_at);
      return sessionDate >= now && sessionDate <= nextWeek && 
             (s.status === 'SCHEDULED' || s.status === 'PENDING' || s.status === 'IN_PROGRESS');
    })
    .sort((a: any, b: any) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
    .slice(0, 5) || [];

    // Séances récentes (dernières 5) — uniquement les séances terminées
    const recentSessions = (sessions as any)?.filter((s: any) => {
      const sessionDate = new Date(s.started_at);
      return sessionDate <= now && s.status === 'COMPLETED'; // séance passée et terminée
    })
    .sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .slice(0, 5) || [];

    // Messages récents et notifications
    const recentMessages = (messages as any)?.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      date: new Date(msg.created_at).toLocaleDateString('fr-FR'),
      time: new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      sender: 'Vous',
      subject: msg.subject || 'Message'
    })) || [];

    // Notifications récentes
    const recentNotifications = (notifications as any)?.map((notif: any) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      date: new Date(notif.created_at).toLocaleDateString('fr-FR'),
      time: new Date(notif.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      data: notif.data
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
      studentInfo: studentInfo,
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
          label: 'Séances à venir',
          value: (scheduledSessions + pendingSessions).toString(),
          color: 'text-purple-600',
          icon: '📅'
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
          type: session.session_type || session.type || 'INDIVIDUAL',
          tutor: tutor ? `${tutor.first_name} ${tutor.last_name}` : 'Tuteur',
          tutorAvatar: tutor?.avatar_url || '/images/user/user-01.png',
          date: new Date(session.started_at).toLocaleDateString('fr-FR'),
          time: new Date(session.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          duration: session.duration_minutes || 60,
          meetingUrl: `/live/${session.id}`, // Lien vers la session en direct
          notes: session.tutor_notes || '',
          status: session.status
        };
      }),
      recentSessions: recentSessions.map((session: any) => {
        const tutor = tutorsMap.get(session.tutor_id);
        return {
          id: session.id,
          course: session.subject || 'Cours',
          type: session.session_type || session.type || 'INDIVIDUAL',
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
          tutorRating: session.tutor_rating || 0
        };
      }),
      recentMessages: recentMessages,
      recentNotifications: recentNotifications,
      tutorStats: {
        totalSessions: completedSessions,
        totalHours: totalHours,
        averageRating: averageRating,
        mainTutor: mainTutor ? `${mainTutor.first_name || ''} ${mainTutor.last_name || ''}`.trim() : 'Aucun'
      }
    };

    // Données du dashboard prêtes

    return NextResponse.json(dashboardData, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' },
    });

      } catch (error) {
    console.error('❌ Erreur API dashboard étudiant:', error);
    
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
          label: 'Séances à venir',
          value: '0',
          color: 'text-purple-600',
          icon: '📅'
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
    
    return NextResponse.json(fallbackData, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' },
    });
  }
}