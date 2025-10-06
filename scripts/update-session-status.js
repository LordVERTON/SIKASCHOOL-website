// Script pour mettre à jour automatiquement les statuts des sessions
// À exécuter périodiquement (cron job) pour maintenir les statuts à jour

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSessionStatuses() {
  try {
    console.log('🔄 Starting session status update...');
    const now = new Date();
    
    // 1. Marquer comme "IN_PROGRESS" les sessions qui devraient être en cours
    const { data: sessionsToStart, error: fetchError } = await supabase
      .from('sessions')
      .select('id, started_at, duration_minutes, status')
      .in('status', ['SCHEDULED', 'PENDING'])
      .lte('started_at', now.toISOString());

    if (fetchError) {
      console.error('❌ Error fetching sessions:', fetchError);
      return;
    }

    if (sessionsToStart && sessionsToStart.length > 0) {
      // Filtrer les sessions qui sont vraiment en cours
      const sessionsInProgress = sessionsToStart.filter(session => {
        const startTime = new Date(session.started_at);
        const endTime = new Date(startTime.getTime() + (session.duration_minutes || 60) * 60000);
        return now >= startTime && now <= endTime;
      });

      if (sessionsInProgress.length > 0) {
        const sessionIds = sessionsInProgress.map(s => s.id);
        const { error: updateError } = await supabase
          .from('sessions')
          .update({ 
            status: 'IN_PROGRESS',
            updated_at: now.toISOString()
          })
          .in('id', sessionIds);

        if (updateError) {
          console.error('❌ Error updating sessions to IN_PROGRESS:', updateError);
        } else {
          console.log(`✅ Updated ${sessionsInProgress.length} sessions to IN_PROGRESS`);
        }
      }
    }

    // 2. Marquer comme "COMPLETED" les sessions qui sont terminées
    const { data: allSessions, error: allSessionsError } = await supabase
      .from('sessions')
      .select('id, started_at, duration_minutes, status')
      .in('status', ['IN_PROGRESS']);

    if (allSessionsError) {
      console.error('❌ Error fetching all sessions:', allSessionsError);
    } else if (allSessions && allSessions.length > 0) {
      const sessionsToComplete = allSessions.filter(session => {
        const startTime = new Date(session.started_at);
        const endTime = new Date(startTime.getTime() + (session.duration_minutes || 60) * 60000);
        return now > endTime;
      });

      if (sessionsToComplete.length > 0) {
        const completedSessionIds = sessionsToComplete.map(s => s.id);
        const { error: completeError } = await supabase
          .from('sessions')
          .update({ 
            status: 'COMPLETED',
            completed_at: now.toISOString(),
            updated_at: now.toISOString()
          })
          .in('id', completedSessionIds);

        if (completeError) {
          console.error('❌ Error completing sessions:', completeError);
        } else {
          console.log(`✅ Completed ${sessionsToComplete.length} sessions`);
        }
      }
    }

    // 3. Nettoyer les sessions passées qui ne devraient pas être SCHEDULED ou IN_PROGRESS
    const { data: pastSessions, error: pastSessionsError } = await supabase
      .from('sessions')
      .select('id, started_at, duration_minutes, status')
      .in('status', ['SCHEDULED', 'IN_PROGRESS', 'PENDING'])
      .lt('started_at', now.toISOString());

    if (pastSessionsError) {
      console.error('❌ Error fetching past sessions:', pastSessionsError);
    } else if (pastSessions && pastSessions.length > 0) {
      const pastSessionIds = pastSessions.map(s => s.id);
      const { error: cleanupError } = await supabase
        .from('sessions')
        .update({ 
          status: 'COMPLETED',
          completed_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .in('id', pastSessionIds);

      if (cleanupError) {
        console.error('❌ Error cleaning up past sessions:', cleanupError);
      } else {
        console.log(`✅ Cleaned up ${pastSessionIds.length} past sessions`);
      }
    }

    console.log('✅ Session status update completed');
  } catch (error) {
    console.error('❌ Error in updateSessionStatuses:', error);
  }
}

// Exécuter le script
updateSessionStatuses();
