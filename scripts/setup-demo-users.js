#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
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

async function setupDemoUsers() {
  console.log('🚀 Configuration des utilisateurs de démonstration SikaSchool');
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
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Erreur de connexion à Supabase:', testError.message);
      process.exit(1);
    }

    console.log('✅ Connexion à Supabase réussie');
    console.log('');

    // Vérifier si les utilisateurs existent déjà
    console.log('🔍 Vérification des utilisateurs existants...');
    const { data: existingUsers } = await supabase
      .from('users')
      .select('email')
      .in('email', ['tutor@sikaschool.com', 'student@sikaschool.com']);

    if (existingUsers && existingUsers.length > 0) {
      console.log('⚠️  Des utilisateurs de démonstration existent déjà:');
      existingUsers.forEach(user => console.log(`   - ${user.email}`));
      
      const shouldDelete = await askQuestion('🗑️  Voulez-vous les supprimer et les recréer ? (y/N): ');
      
      if (shouldDelete.toLowerCase() === 'y' || shouldDelete.toLowerCase() === 'yes') {
        console.log('🗑️  Suppression des utilisateurs existants...');
        
        for (const user of existingUsers) {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();

          if (userData) {
            // Supprimer les credentials
            await supabase
              .from('user_credentials')
              .delete()
              .eq('user_id', userData.id);

            // Supprimer les profils
            await supabase
              .from('tutors')
              .delete()
              .eq('user_id', userData.id);

            await supabase
              .from('students')
              .delete()
              .eq('user_id', userData.id);

            // Supprimer l'utilisateur
            await supabase
              .from('users')
              .delete()
              .eq('id', userData.id);
          }
        }
        
        console.log('✅ Utilisateurs existants supprimés');
      } else {
        console.log('❌ Opération annulée');
        process.exit(0);
      }
    }

    console.log('');
    console.log('📝 Création des utilisateurs de démonstration...');

    // Hash des mots de passe
    const tutorPasswordHash = bcrypt.hashSync('tutor123', 12);
    const studentPasswordHash = bcrypt.hashSync('student123', 12);

    // Créer l'utilisateur tuteur
    console.log('👨‍🏫 Création du tuteur...');
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
      console.error('❌ Erreur création tuteur:', tutorError.message);
      return;
    }

    // Créer l'utilisateur étudiant
    console.log('👨‍🎓 Création de l\'étudiant...');
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
      console.error('❌ Erreur création étudiant:', studentError.message);
      return;
    }

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
      console.error('❌ Erreur credentials tuteur:', tutorCredError.message);
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
      console.error('❌ Erreur credentials étudiant:', studentCredError.message);
      return;
    }

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
      console.error('❌ Erreur profil tuteur:', tutorProfileError.message);
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
      console.error('❌ Erreur profil étudiant:', studentProfileError.message);
      return;
    }

    console.log('');
    console.log('🎉 Utilisateurs de démonstration créés avec succès !');
    console.log('');
    console.log('📋 Credentials de connexion :');
    console.log('');
    console.log('👨‍🏫 Tuteur:');
    console.log('   Email: tutor@sikaschool.com');
    console.log('   Mot de passe: tutor123');
    console.log('   Rôle: TUTOR');
    console.log('');
    console.log('👨‍🎓 Étudiant:');
    console.log('   Email: student@sikaschool.com');
    console.log('   Mot de passe: student123');
    console.log('   Rôle: STUDENT');
    console.log('');
    console.log('🌐 Vous pouvez maintenant vous connecter sur:');
    console.log('   http://localhost:3000/auth/signin');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    rl.close();
  }
}

setupDemoUsers();
