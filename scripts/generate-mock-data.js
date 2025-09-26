const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Données fictives
const mockStudents = [
  { first_name: 'Emma', last_name: 'Dubois', email: 'emma.dubois@sikaschool.com', level: 'Terminale' },
  { first_name: 'Lucas', last_name: 'Martin', email: 'lucas.martin@sikaschool.com', level: 'Première' },
  { first_name: 'Chloé', last_name: 'Bernard', email: 'chloe.bernard@sikaschool.com', level: 'Seconde' },
  { first_name: 'Thomas', last_name: 'Petit', email: 'thomas.petit@sikaschool.com', level: '3ème' },
  { first_name: 'Léa', last_name: 'Robert', email: 'lea.robert@sikaschool.com', level: '2nde' },
  { first_name: 'Hugo', last_name: 'Richard', email: 'hugo.richard@sikaschool.com', level: '1ère' },
  { first_name: 'Manon', last_name: 'Durand', email: 'manon.durand@sikaschool.com', level: 'Terminale' },
  { first_name: 'Nathan', last_name: 'Moreau', email: 'nathan.moreau@sikaschool.com', level: 'Première' }
];

const mockTutors = [
  { first_name: 'Sophie', last_name: 'Leroy', email: 'sophie.leroy@sikaschool.com', subjects: ['Mathématiques', 'Physique'] },
  { first_name: 'Pierre', last_name: 'Simon', email: 'pierre.simon@sikaschool.com', subjects: ['Chimie', 'SVT'] },
  { first_name: 'Marie', last_name: 'Laurent', email: 'marie.laurent@sikaschool.com', subjects: ['Français', 'Histoire'] },
  { first_name: 'Antoine', last_name: 'Lefebvre', email: 'antoine.lefebvre@sikaschool.com', subjects: ['Anglais', 'Espagnol'] }
];

const subjects = ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Français', 'Histoire', 'Géographie', 'Anglais', 'Espagnol', 'Philosophie'];
const levels = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale', 'Post-bac'];
const sessionTypes = ['NOTA', 'AVA', 'TODA'];
const sessionStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

async function generateMockData() {
  console.log('🎭 Génération de données fictives pour la base de données\n');

  try {
    // 1. Créer des étudiants supplémentaires
    console.log('👥 Création des étudiants supplémentaires...');
    const studentIds = [];
    
    for (const student of mockStudents) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Créer l'utilisateur
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          role: 'STUDENT',
          is_active: true,
          email_verified: false
        })
        .select()
        .single();

      if (userError) {
        console.log(`⚠️  Étudiant ${student.email} déjà existant ou erreur:`, userError.message);
        // Récupérer l'ID de l'utilisateur existant
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', student.email)
          .single();
        if (existingUser) {
          studentIds.push(existingUser.id);
        }
        continue;
      }

      // Créer les credentials
      const { error: credError } = await supabase
        .from('user_credentials')
        .insert({
          user_id: newUser.id,
          credential_type: 'password',
          credential_value: hashedPassword,
          is_active: true
        });

      if (credError) {
        console.log(`⚠️  Erreur credentials pour ${student.email}:`, credError.message);
      }

      // Créer le profil étudiant
      const { error: profileError } = await supabase
        .from('students')
        .insert({
          user_id: newUser.id,
          grade_level: student.level,
          academic_goals: `Réussir en ${student.level}`
        });

      if (profileError) {
        console.log(`⚠️  Erreur profil pour ${student.email}:`, profileError.message);
      }

      studentIds.push(newUser.id);
      console.log(`✅ Étudiant créé: ${student.first_name} ${student.last_name} (${student.email}) - Mot de passe: ${tempPassword}`);
    }

    // 2. Créer des tuteurs supplémentaires
    console.log('\n👨‍🏫 Création des tuteurs supplémentaires...');
    const tutorIds = [];
    
    for (const tutor of mockTutors) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Créer l'utilisateur
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          first_name: tutor.first_name,
          last_name: tutor.last_name,
          email: tutor.email,
          role: 'TUTOR',
          is_active: true,
          email_verified: false
        })
        .select()
        .single();

      if (userError) {
        console.log(`⚠️  Tuteur ${tutor.email} déjà existant ou erreur:`, userError.message);
        // Récupérer l'ID de l'utilisateur existant
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', tutor.email)
          .single();
        if (existingUser) {
          tutorIds.push(existingUser.id);
        }
        continue;
      }

      // Créer les credentials
      const { error: credError } = await supabase
        .from('user_credentials')
        .insert({
          user_id: newUser.id,
          credential_type: 'password',
          credential_value: hashedPassword,
          is_active: true
        });

      if (credError) {
        console.log(`⚠️  Erreur credentials pour ${tutor.email}:`, credError.message);
      }

      // Créer le profil tuteur
      const { error: profileError } = await supabase
        .from('tutors')
        .insert({
          user_id: newUser.id,
          bio: `Tuteur expérimenté en ${tutor.subjects.join(', ')}`,
          experience_years: Math.floor(Math.random() * 10) + 2,
          subjects: tutor.subjects,
          is_available: true,
          total_sessions: 0
        });

      if (profileError) {
        console.log(`⚠️  Erreur profil pour ${tutor.email}:`, profileError.message);
      }

      tutorIds.push(newUser.id);
      console.log(`✅ Tuteur créé: ${tutor.first_name} ${tutor.last_name} (${tutor.email}) - Mot de passe: ${tempPassword}`);
    }

    // 3. Récupérer tous les utilisateurs existants
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, role, first_name, last_name');

    const allStudents = allUsers?.filter(u => u.role === 'STUDENT') || [];
    const allTutors = allUsers?.filter(u => u.role === 'TUTOR') || [];

    console.log(`\n📊 Utilisateurs disponibles: ${allStudents.length} étudiants, ${allTutors.length} tuteurs`);

    // 4. Créer des sessions fictives
    console.log('\n📚 Création des sessions fictives...');
    const sessionIds = [];
    
    for (let i = 0; i < 20; i++) {
      const student = allStudents[Math.floor(Math.random() * allStudents.length)];
      const tutor = allTutors[Math.floor(Math.random() * allTutors.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const type = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
      const status = sessionStatuses[Math.floor(Math.random() * sessionStatuses.length)];
      const duration = [30, 45, 60, 90][Math.floor(Math.random() * 4)];
      const rating = status === 'COMPLETED' ? Math.floor(Math.random() * 5) + 1 : null;

      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          student_id: student.id,
          tutor_id: tutor.id,
          subject,
          level,
          type,
          status,
          duration_minutes: duration,
          student_rating: rating,
          started_at: status === 'COMPLETED' || status === 'IN_PROGRESS' ? new Date().toISOString() : null,
          completed_at: status === 'COMPLETED' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (sessionError) {
        console.log(`⚠️  Erreur session ${i + 1}:`, sessionError.message);
        continue;
      }

      sessionIds.push(newSession.id);
      console.log(`✅ Session créée: ${student.first_name} ${student.last_name} avec ${tutor.first_name} ${tutor.last_name} - ${subject} (${level}) - ${status}`);
    }

    // 5. Créer des paiements fictifs
    console.log('\n💰 Création des paiements fictifs...');
    
    for (let i = 0; i < 15; i++) {
      const session = sessionIds[Math.floor(Math.random() * sessionIds.length)];
      const amount = Math.floor(Math.random() * 5000) + 2000; // 20€ à 70€
      const tutorCommission = Math.floor(amount * 0.8); // 80%
      const platformCommission = amount - tutorCommission; // 20%
      const status = ['PENDING', 'PAID', 'FAILED'][Math.floor(Math.random() * 3)];
      const paidAt = status === 'PAID' ? new Date().toISOString() : null;

      const { error: paymentError } = await supabase
        .from('session_payments')
        .insert({
          session_id: session,
          student_id: allStudents[Math.floor(Math.random() * allStudents.length)].id,
          tutor_id: allTutors[Math.floor(Math.random() * allTutors.length)].id,
          amount_cents: amount,
          tutor_commission_cents: tutorCommission,
          platform_commission_cents: platformCommission,
          status,
          paid_at: paidAt
        });

      if (paymentError) {
        console.log(`⚠️  Erreur paiement ${i + 1}:`, paymentError.message);
        continue;
      }

      console.log(`✅ Paiement créé: ${(amount / 100).toFixed(2)}€ - ${status}`);
    }

    console.log('\n🎉 Génération de données fictives terminée !');
    console.log('\n📋 Résumé:');
    console.log(`   - ${allStudents.length} étudiants au total`);
    console.log(`   - ${allTutors.length} tuteurs au total`);
    console.log(`   - ${sessionIds.length} sessions créées`);
    console.log(`   - 15 paiements créés`);

    console.log('\n💡 Pour tester:');
    console.log('   1. Connectez-vous avec un compte tuteur admin');
    console.log('   2. Accédez à la section Administration');
    console.log('   3. Explorez les onglets Utilisateurs, Sessions et Paiements');

  } catch (error) {
    console.error('❌ Erreur lors de la génération des données:', error);
  }
}

generateMockData();
