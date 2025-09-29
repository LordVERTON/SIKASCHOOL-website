const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - Remplacez par vos vraies valeurs
const supabaseUrl = 'https://your-project.supabase.co'; // Remplacez par votre URL Supabase
const supabaseServiceKey = 'your-service-role-key-here'; // Remplacez par votre service role key

console.log('⚠️  ATTENTION: Veuillez d\'abord configurer les variables Supabase dans ce script');
console.log('📝 Éditez le fichier scripts/populate-assignments-from-sessions.js et remplacez:');
console.log('   - supabaseUrl par votre URL Supabase');
console.log('   - supabaseServiceKey par votre service role key');
console.log('');

if (supabaseUrl === 'https://your-project.supabase.co' || supabaseServiceKey === 'your-service-role-key-here') {
  console.log('❌ Veuillez d\'abord configurer les credentials Supabase dans le script');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateAssignmentsFromSessions() {
  try {
    console.log('🚀 Analyse des sessions existantes...');

    // 1. Analyser les sessions existantes
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('tutor_id, student_id, started_at')
      .not('tutor_id', 'is', null)
      .not('student_id', 'is', null)
      .not('started_at', 'is', null)
      .lte('started_at', new Date().toISOString()); // Sessions passées uniquement

    if (sessionsError) {
      console.error('❌ Erreur lors de la récupération des sessions:', sessionsError);
      return;
    }

    console.log(`📊 Sessions trouvées: ${sessions.length}`);

    // 2. Grouper par paire tuteur-étudiant
    const pairs = new Map();
    
    for (const session of sessions) {
      const key = `${session.tutor_id}-${session.student_id}`;
      if (!pairs.has(key)) {
        pairs.set(key, {
          tutor_id: session.tutor_id,
          student_id: session.student_id,
          sessions: [],
          firstSession: session.started_at,
          lastSession: session.started_at
        });
      }
      
      const pair = pairs.get(key);
      pair.sessions.push(session);
      
      if (new Date(session.started_at) < new Date(pair.firstSession)) {
        pair.firstSession = session.started_at;
      }
      if (new Date(session.started_at) > new Date(pair.lastSession)) {
        pair.lastSession = session.started_at;
      }
    }

    console.log(`👥 Paires tuteur-étudiant uniques: ${pairs.size}`);

    // 3. Vérifier les attributions existantes
    const { data: existingAssignments, error: assignmentsError } = await supabase
      .from('tutor_student_assignments')
      .select('tutor_id, student_id')
      .eq('is_active', true);

    if (assignmentsError) {
      console.error('❌ Erreur lors de la vérification des attributions existantes:', assignmentsError);
      return;
    }

    const existingPairs = new Set(
      existingAssignments.map(a => `${a.tutor_id}-${a.student_id}`)
    );

    // 4. Créer les attributions manquantes
    const assignmentsToCreate = [];
    
    for (const [key, pair] of pairs) {
      if (!existingPairs.has(key)) {
        assignmentsToCreate.push({
          tutor_id: pair.tutor_id,
          student_id: pair.student_id,
          assigned_by: pair.tutor_id, // Auto-attribution
          notes: `Attribution automatique basée sur ${pair.sessions.length} session(s) existante(s). Première session: ${new Date(pair.firstSession).toLocaleDateString('fr-FR')}, Dernière session: ${new Date(pair.lastSession).toLocaleDateString('fr-FR')}`,
          is_active: true,
          assigned_at: pair.firstSession
        });
      }
    }

    console.log(`📝 Attributions à créer: ${assignmentsToCreate.length}`);

    if (assignmentsToCreate.length === 0) {
      console.log('✅ Toutes les attributions existent déjà');
      return;
    }

    // 5. Insérer les attributions
    const { data: insertedAssignments, error: insertError } = await supabase
      .from('tutor_student_assignments')
      .insert(assignmentsToCreate)
      .select('id, tutor_id, student_id');

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion des attributions:', insertError);
      return;
    }

    console.log(`✅ Attributions créées: ${insertedAssignments.length}`);

    // 6. Afficher les statistiques finales
    const { data: finalStats, error: statsError } = await supabase
      .from('tutor_student_assignments')
      .select('tutor_id, student_id, notes')
      .eq('is_active', true);

    if (!statsError && finalStats) {
      console.log('\n📊 Statistiques finales:');
      console.log(`   Total attributions actives: ${finalStats.length}`);
      
      const autoAssignments = finalStats.filter(a => a.notes.includes('Attribution automatique'));
      console.log(`   Attributions automatiques: ${autoAssignments.length}`);
    }

    // 7. Afficher quelques exemples
    console.log('\n👥 Exemples d\'attributions créées:');
    for (let i = 0; i < Math.min(3, insertedAssignments.length); i++) {
      const assignment = insertedAssignments[i];
      console.log(`   - Tuteur ${assignment.tutor_id} → Étudiant ${assignment.student_id}`);
    }

    console.log('\n🎉 Peuplement terminé avec succès !');
    console.log('💡 Les étudiants peuvent maintenant voir leurs tuteurs attribués sur /student/tutors');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

populateAssignmentsFromSessions();
