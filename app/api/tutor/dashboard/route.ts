import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tutorId = user.id;

    const { data: sessions } = await supabaseAdmin
      .from('sessions')
      .select('id, student_id, subject, level, type, status, started_at, duration_minutes')
      .eq('tutor_id', tutorId)
      .order('started_at', { ascending: false });

    const totalCompleted = (sessions || []).filter((s: any) => s.status === 'COMPLETED').length;
    const totalHours = ((sessions || []).reduce((a: number, s: any) => a + (s.duration_minutes || 0), 0) / 60).toFixed(1);
    const activeStudents = new Set((sessions || []).map((s: any) => s.student_id)).size;

    const stats = [
      { label: 'Séances terminées', value: String(totalCompleted), color: 'text-blue-600', icon: '📚' },
      { label: 'Heures données', value: `${totalHours}h`, color: 'text-green-600', icon: '⏰' },
      { label: 'Élèves uniques', value: String(activeStudents), color: 'text-purple-600', icon: '👨‍🎓' },
      { label: 'À venir (7j)', value: String((sessions || []).filter((s: any) => new Date(s.started_at) > new Date() && new Date(s.started_at) < new Date(Date.now()+7*86400000)).length), color: 'text-yellow-600', icon: '📅' },
    ];

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = (sessions || []).filter((s: any) => new Date(s.started_at) >= now && new Date(s.started_at) <= nextWeek).slice(0, 4).map((s: any) => ({
      id: s.id,
      date: new Date(s.started_at).toLocaleDateString('fr-FR'),
      time: new Date(s.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      duration: s.duration_minutes || 60,
      type: s.type || 'INDIVIDUAL',
      participants: 'Élève',
    }));

    const recent = (sessions || []).filter((s: any) => new Date(s.started_at) <= now).slice(0, 4).map((s: any) => ({
      id: s.id,
      course: s.subject || 'Cours',
      type: s.type || 'INDIVIDUAL',
      date: new Date(s.started_at).toLocaleDateString('fr-FR'),
      time: new Date(s.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      duration: s.duration_minutes || 60,
      status: s.status,
      participants: ['Élève']
    }));

    const quickActions = [
      { title: 'Calendrier', description: 'Voir mes créneaux', action: '/tutor/calendar', icon: '📆', color: 'bg-blue-600 hover:bg-blue-700' },
      { title: 'Historique', description: 'Voir les séances', action: '/tutor/history', icon: '🗂️', color: 'bg-purple-600 hover:bg-purple-700' },
      { title: 'Mes élèves', description: 'Consulter', action: '/tutor/eleves', icon: '👨‍🎓', color: 'bg-green-600 hover:bg-green-700' },
      { title: 'Paiements', description: 'Voir mes gains', action: '/tutor/paiements', icon: '💶', color: 'bg-yellow-600 hover:bg-yellow-700' }
    ];

    return NextResponse.json({ stats, upcomingSessions: upcoming, recentSessions: recent, quickActions });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}


