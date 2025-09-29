const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuration Supabase - Remplacez par vos vraies valeurs
const supabaseUrl = 'https://your-project.supabase.co'; // Remplacez par votre URL Supabase
const supabaseServiceKey = 'your-service-role-key-here'; // Remplacez par votre service role key

console.log('⚠️  ATTENTION: Veuillez d\'abord configurer les variables Supabase dans ce script');
console.log('📝 Éditez le fichier scripts/add-demo-users-direct.js et remplacez:');
console.log('   - supabaseUrl par votre URL Supabase');
console.log('   - supabaseServiceKey par votre service role key');
console.log('');

if (supabaseUrl === 'https://your-project.supabase.co' || supabaseServiceKey === 'your-service-role-key-here') {
  console.log('❌ Veuillez d\'abord configurer les credentials Supabase dans le script');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDemoUsers() {
  try {
    console.log('🚀 Ajout des utilisateurs de démonstration...');

    // Hash des mots de passe
    const tutorPasswordHash = bcrypt.hashSync('tutor123', 12);
    const studentPasswordHash = bcrypt.hashSync('student123', 12);

    console.log('📝 Création des utilisateurs...');

    // Créer l'utilisateur tuteur
    const { data: tutorUser, error: tutorError } = await supabase
      .from('users')
      .insert({
        email: 'tutor@sikaschool.com',
        first_name: 'Tuteur',
        last_name: 'Démonstration',
        role: 'TUTOR',
        is_active: true
      })
      .select('id')
      .single();

    if (tutorError) {
      console.error('❌ Erreur création tuteur:', tutorError);
      return;
    }

    console.log('✅ Tuteur créé:', tutorUser.id);

    // Créer l'utilisateur étudiant
    const { data: studentUser, error: studentError } = await supabase
      .from('users')
      .insert({
        email: 'student@sikaschool.com',
        first_name: 'Élève',
        last_name: 'Démonstration',
        role: 'STUDENT',
        is_active: true
      })
      .select('id')
      .single();

    if (studentError) {
      console.error('❌ Erreur création étudiant:', studentError);
      return;
    }

    console.log('✅ Étudiant créé:', studentUser.id);

    // Ajouter les credentials
    console.log('🔐 Ajout des credentials...');

    const { error: tutorCredError } = await supabase
      .from('user_credentials')
      .insert({
        user_id: tutorUser.id,
        credential_type: 'password',
        credential_value: tutorPasswordHash,
        is_active: true
      });

    if (tutorCredError) {
      console.error('❌ Erreur credentials tuteur:', tutorCredError);
      return;
    }

    const { error: studentCredError } = await supabase
      .from('user_credentials')
      .insert({
        user_id: studentUser.id,
        credential_type: 'password',
        credential_value: studentPasswordHash,
        is_active: true
      });

    if (studentCredError) {
      console.error('❌ Erreur credentials étudiant:', studentCredError);
      return;
    }

    console.log('✅ Credentials ajoutés');

    // Créer le profil tuteur
    console.log('👨‍🏫 Création du profil tuteur...');
    const { error: tutorProfileError } = await supabase
      .from('tutors')
      .insert({
        user_id: tutorUser.id,
        bio: 'Tuteur de démonstration pour les tests de la plateforme SikaSchool. Expert en mathématiques et sciences.',
        subjects: ['Mathématiques', 'Physique', 'Sciences'],
        experience_years: 5,
        hourly_rate_cents: 6000,
        is_available: true
      });

    if (tutorProfileError) {
      console.error('❌ Erreur profil tuteur:', tutorProfileError);
      return;
    }

    // Créer le profil étudiant
    console.log('👨‍🎓 Création du profil étudiant...');
    const { error: studentProfileError } = await supabase
      .from('students')
      .insert({
        user_id: studentUser.id,
        grade_level: 'Lycée',
        school_name: 'Lycée de démonstration',
        academic_goals: 'Améliorer les résultats en mathématiques et sciences'
      });

    if (studentProfileError) {
      console.error('❌ Erreur profil étudiant:', studentProfileError);
      return;
    }

    console.log('🎉 Utilisateurs de démonstration créés avec succès !');
    console.log('');
    console.log('📋 Credentials de connexion :');
    console.log('Tuteur:');
    console.log('  Email: tutor@sikaschool.com');
    console.log('  Mot de passe: tutor123');
    console.log('  Rôle: TUTOR');
    console.log('');
    console.log('Étudiant:');
    console.log('  Email: student@sikaschool.com');
    console.log('  Mot de passe: student123');
    console.log('  Rôle: STUDENT');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

addDemoUsers();
