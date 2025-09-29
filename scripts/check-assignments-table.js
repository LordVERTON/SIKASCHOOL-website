const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - Remplacez par vos vraies valeurs
const supabaseUrl = 'https://your-project.supabase.co'; // Remplacez par votre URL Supabase
const supabaseServiceKey = 'your-service-role-key-here'; // Remplacez par votre service role key

console.log('🔍 Vérification de la table tutor_student_assignments');
console.log('');

if (supabaseUrl === 'https://your-project.supabase.co' || supabaseServiceKey === 'your-service-role-key-here') {
  console.log('❌ Veuillez d\'abord configurer les credentials Supabase dans le script');
  console.log('📝 Éditez le fichier scripts/check-assignments-table.js et remplacez:');
  console.log('   - supabaseUrl par votre URL Supabase');
  console.log('   - supabaseServiceKey par votre service role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAssignmentsTable() {
  try {
    console.log('🔌 Connexion à Supabase...');
    
    // Test de connexion
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Erreur de connexion à Supabase:', testError.message);
      return;
    }

    console.log('✅ Connexion à Supabase réussie');
    console.log('');

    // Vérifier si la table tutor_student_assignments existe
    console.log('🔍 Vérification de la table tutor_student_assignments...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('tutor_student_assignments')
      .select('count')
      .limit(1);

    if (tableError) {
      if (tableError.code === 'PGRST116') {
        console.log('❌ La table tutor_student_assignments n\'existe pas');
        console.log('');
        console.log('📋 Pour créer la table, exécutez le script SQL suivant dans Supabase :');
        console.log('');
        console.log('1. Allez dans votre projet Supabase');
        console.log('2. Ouvrez l\'éditeur SQL');
        console.log('3. Copiez et exécutez le contenu de supabase/add-tutor-student-assignments.sql');
        console.log('');
        console.log('🔗 Ou utilisez le script interactif :');
        console.log('   node scripts/setup-assignments-interactive.js');
        return;
      } else {
        console.log('❌ Erreur lors de la vérification de la table:', tableError.message);
        return;
      }
    }

    console.log('✅ La table tutor_student_assignments existe');
    console.log('');

    // Vérifier le contenu de la table
    console.log('📊 Contenu de la table :');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('tutor_student_assignments')
      .select('id, tutor_id, student_id, is_active, assigned_at')
      .limit(10);

    if (assignmentsError) {
      console.log('❌ Erreur lors de la récupération des attributions:', assignmentsError.message);
      return;
    }

    console.log(`   Total attributions: ${assignments?.length || 0}`);
    
    if (assignments && assignments.length > 0) {
      console.log('   Dernières attributions :');
      assignments.slice(0, 3).forEach((assignment, index) => {
        console.log(`   ${index + 1}. Tuteur: ${assignment.tutor_id}, Étudiant: ${assignment.student_id}, Actif: ${assignment.is_active}`);
      });
    } else {
      console.log('   Aucune attribution trouvée');
      console.log('');
      console.log('💡 Pour peupler la table avec les sessions existantes :');
      console.log('   - Exécutez supabase/populate-assignments-from-sessions.sql');
      console.log('   - Ou utilisez node scripts/setup-assignments-interactive.js');
    }

    console.log('');
    console.log('🎉 Vérification terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

checkAssignmentsTable();
