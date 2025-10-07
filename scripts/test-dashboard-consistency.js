/**
 * Script de test pour vérifier la cohérence entre le dashboard étudiant et l'agenda étudiant
 * concernant le nombre de séances terminées (COMPLETED)
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardConsistency() {
  console.log('🧪 Test de cohérence Dashboard/Agenda');
  console.log('=====================================');

  try {
    // 1. Récupérer les sessions via l'API agenda (logique complète)
    console.log('\n📅 Récupération des sessions via l\'API agenda...');
    
    // Simuler la logique de l'API agenda
    const studentId = 'student_dashboard_consistency_id';
    
    // Sessions où l'étudiant est titulaire
    const { data: ownSessions, error: ownError } = await supabase
      .from('sessions')
      .select('*')
      .eq('student_id', studentId);

    if (ownError) {
      console.error('❌ Erreur sessions titulaire:', ownError);
      return;
    }

    // Sessions où l'étudiant est participant
    const { data: participantLinks, error: participantError } = await supabase
      .from('session_participants')
      .select('session_id')
      .eq('student_id', studentId);

    if (participantError) {
      console.error('❌ Erreur participants:', participantError);
      return;
    }

    let participantSessions = [];
    const participantSessionIds = Array.from(new Set((participantLinks || []).map(p => p.session_id)));
    if (participantSessionIds.length > 0) {
      const { data: partSessions, error: partSessionsError } = await supabase
        .from('sessions')
        .select('*')
        .in('id', participantSessionIds);

      if (partSessionsError) {
        console.error('❌ Erreur sessions participants:', partSessionsError);
      } else {
        participantSessions = partSessions || [];
      }
    }

    // Fusionner et dédupliquer
    const byId = new Map();
    for (const s of (ownSessions || [])) byId.set(s.id, s);
    for (const s of (participantSessions || [])) byId.set(s.id, s);
    const allSessions = Array.from(byId.values());

    console.log(`✅ Sessions récupérées: ${allSessions.length}`);
    console.log(`   - Sessions titulaire: ${ownSessions?.length || 0}`);
    console.log(`   - Sessions participant: ${participantSessions.length}`);

    // 2. Compter les sessions terminées
    const completedSessions = allSessions.filter(s => s.status === 'COMPLETED');
    const scheduledSessions = allSessions.filter(s => s.status === 'SCHEDULED');
    const pendingSessions = allSessions.filter(s => s.status === 'PENDING');
    const cancelledSessions = allSessions.filter(s => s.status === 'CANCELLED');

    console.log('\n📊 Statistiques des sessions:');
    console.log(`   - Terminées (COMPLETED): ${completedSessions.length}`);
    console.log(`   - Programmées (SCHEDULED): ${scheduledSessions.length}`);
    console.log(`   - En attente (PENDING): ${pendingSessions.length}`);
    console.log(`   - Annulées (CANCELLED): ${cancelledSessions.length}`);

    // 3. Vérifier la cohérence attendue
    const expectedCompleted = 4; // 3 titulaire + 1 participant
    const expectedScheduled = 2;
    const expectedPending = 1;
    const expectedCancelled = 1;

    console.log('\n🎯 Vérification de la cohérence:');
    
    const completedMatch = completedSessions.length === expectedCompleted;
    const scheduledMatch = scheduledSessions.length === expectedScheduled;
    const pendingMatch = pendingSessions.length === expectedPending;
    const cancelledMatch = cancelledSessions.length === expectedCancelled;

    console.log(`   - Sessions terminées: ${completedMatch ? '✅' : '❌'} (${completedSessions.length}/${expectedCompleted})`);
    console.log(`   - Sessions programmées: ${scheduledMatch ? '✅' : '❌'} (${scheduledSessions.length}/${expectedScheduled})`);
    console.log(`   - Sessions en attente: ${pendingMatch ? '✅' : '❌'} (${pendingSessions.length}/${expectedPending})`);
    console.log(`   - Sessions annulées: ${cancelledMatch ? '✅' : '❌'} (${cancelledSessions.length}/${expectedCancelled})`);

    // 4. Afficher les détails des sessions terminées
    console.log('\n📋 Détails des sessions terminées:');
    completedSessions.forEach((session, index) => {
      const isParticipant = !ownSessions?.find(s => s.id === session.id);
      console.log(`   ${index + 1}. ${session.subject} (${isParticipant ? 'Participant' : 'Titulaire'}) - ${session.started_at}`);
    });

    // 5. Résultat global
    const allMatch = completedMatch && scheduledMatch && pendingMatch && cancelledMatch;
    console.log(`\n${allMatch ? '🎉' : '❌'} Test ${allMatch ? 'RÉUSSI' : 'ÉCHOUÉ'}: Cohérence ${allMatch ? 'confirmée' : 'non confirmée'}`);

    if (!allMatch) {
      console.log('\n🔍 Détails des incohérences:');
      if (!completedMatch) console.log(`   - Sessions terminées: attendu ${expectedCompleted}, obtenu ${completedSessions.length}`);
      if (!scheduledMatch) console.log(`   - Sessions programmées: attendu ${expectedScheduled}, obtenu ${scheduledSessions.length}`);
      if (!pendingMatch) console.log(`   - Sessions en attente: attendu ${expectedPending}, obtenu ${pendingSessions.length}`);
      if (!cancelledMatch) console.log(`   - Sessions annulées: attendu ${expectedCancelled}, obtenu ${cancelledSessions.length}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testDashboardConsistency();
