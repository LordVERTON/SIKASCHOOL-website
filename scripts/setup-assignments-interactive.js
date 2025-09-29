#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupAssignmentsInteractive() {
  console.log('🚀 Configuration des attributions tuteur-étudiant');
  console.log('📊 Basée sur les sessions existantes dans la base de données');
  console.log('');

  try {
    // Demander les credentials Supabase
    const supabaseUrl = await askQuestion('🔗 URL Supabase (ex: https://votre-projet.supabase.co): ');
    const supabaseServiceKey = await askQuestion('🔑 Service Role Key: ');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('❌ URL et Service Role Key sont requis');
      process.exit(1);
    }

    console.log('');
    console.log('🔌 Connexion à Supabase...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test de connexion
    const { data: testData, error: testError } = await supabase
      .from('sessions')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Erreur de connexion à Supabase:', testError.message);
      process.exit(1);
    }

    console.log('✅ Connexion à Supabase réussie');
    console.log('');

    // Analyser les sessions existantes
    console.log('📊 Analyse des sessions existantes...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('tutor_id, student_id, started_at')
      .not('tutor_id', 'is', null)
      .not('student_id', 'is', null)
      .not('started_at', 'is', null);

    if (sessionsError) {
      console.log('❌ Erreur lors de l\'analyse des sessions:', sessionsError.message);
      return;
    }

    console.log(`📈 Sessions trouvées: ${sessions.length}`);

    if (sessions.length === 0) {
      console.log('⚠️  Aucune session trouvée. Aucune attribution ne sera créée.');
      return;
    }

    // Grouper par paire tuteur-étudiant
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

    // Vérifier les attributions existantes
    console.log('🔍 Vérification des attributions existantes...');
    const { data: existingAssignments, error: assignmentsError } = await supabase
      .from('tutor_student_assignments')
      .select('tutor_id, student_id')
      .eq('is_active', true);

    if (assignmentsError) {
      console.log('❌ Erreur lors de la vérification:', assignmentsError.message);
      return;
    }

    const existingPairs = new Set(
      existingAssignments.map(a => `${a.tutor_id}-${a.student_id}`)
    );

    const assignmentsToCreate = [];
    
    for (const [key, pair] of pairs) {
      if (!existingPairs.has(key)) {
        assignmentsToCreate.push({
          tutor_id: pair.tutor_id,
          student_id: pair.student_id,
          assigned_by: pair.tutor_id,
          notes: `Attribution automatique basée sur ${pair.sessions.length} session(s). Première: ${new Date(pair.firstSession).toLocaleDateString('fr-FR')}, Dernière: ${new Date(pair.lastSession).toLocaleDateString('fr-FR')}`,
          is_active: true,
          assigned_at: pair.firstSession
        });
      }
    }

    console.log(`📝 Nouvelles attributions à créer: ${assignmentsToCreate.length}`);
    console.log(`✅ Attributions déjà existantes: ${existingAssignments.length}`);

    if (assignmentsToCreate.length === 0) {
      console.log('🎉 Toutes les attributions existent déjà !');
      return;
    }

    // Afficher un aperçu
    console.log('\n👀 Aperçu des attributions à créer:');
    for (let i = 0; i < Math.min(5, assignmentsToCreate.length); i++) {
      const assignment = assignmentsToCreate[i];
      console.log(`   ${i + 1}. Tuteur ${assignment.tutor_id} → Étudiant ${assignment.student_id}`);
    }
    
    if (assignmentsToCreate.length > 5) {
      console.log(`   ... et ${assignmentsToCreate.length - 5} autres`);
    }

    // Demander confirmation
    const shouldProceed = await askQuestion('\n❓ Voulez-vous créer ces attributions ? (y/N): ');
    
    if (shouldProceed.toLowerCase() !== 'y' && shouldProceed.toLowerCase() !== 'yes') {
      console.log('❌ Opération annulée');
      return;
    }

    // Créer les attributions
    console.log('\n🔄 Création des attributions...');
    const { data: insertedAssignments, error: insertError } = await supabase
      .from('tutor_student_assignments')
      .insert(assignmentsToCreate)
      .select('id, tutor_id, student_id');

    if (insertError) {
      console.log('❌ Erreur lors de la création des attributions:', insertError.message);
      return;
    }

    console.log(`✅ Attributions créées avec succès: ${insertedAssignments.length}`);

    // Statistiques finales
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

    console.log('\n🎉 Configuration terminée avec succès !');
    console.log('💡 Les étudiants peuvent maintenant voir leurs tuteurs attribués sur /student/tutors');
    console.log('🔧 Pour gérer les attributions, utilisez les APIs admin:');
    console.log('   - POST /api/admin/assign-tutor (attribuer)');
    console.log('   - DELETE /api/admin/assign-tutor (désattribuer)');
    console.log('   - GET /api/admin/assignments (lister)');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    rl.close();
  }
}

setupAssignmentsInteractive();
