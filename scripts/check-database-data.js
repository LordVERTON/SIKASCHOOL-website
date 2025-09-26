const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseData() {
  console.log('🔍 Vérification des données dans la base de données\n');

  try {
    // 1. Vérifier les utilisateurs
    console.log('👥 Utilisateurs:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, is_active')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.log('❌ Erreur utilisateurs:', usersError.message);
    } else {
      console.log(`✅ ${users.length} utilisateurs trouvés`);
      users.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role} - ${user.is_active ? 'Actif' : 'Inactif'}`);
      });
    }

    // 2. Vérifier les sessions
    console.log('\n📚 Sessions:');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, subject, level, type, status, student_id, tutor_id, created_at')
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.log('❌ Erreur sessions:', sessionsError.message);
    } else {
      console.log(`✅ ${sessions.length} sessions trouvées`);
      sessions.forEach(session => {
        console.log(`   - ${session.subject} (${session.level}) - ${session.type} - ${session.status}`);
      });
    }

    // 3. Vérifier les paiements
    console.log('\n💰 Paiements:');
    const { data: payments, error: paymentsError } = await supabase
      .from('session_payments')
      .select('id, amount_cents, status, student_id, tutor_id, created_at')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.log('❌ Erreur paiements:', paymentsError.message);
    } else {
      console.log(`✅ ${payments.length} paiements trouvés`);
      payments.forEach(payment => {
        console.log(`   - ${(payment.amount_cents / 100).toFixed(2)}€ - ${payment.status}`);
      });
    }

    // 4. Vérifier les relations sessions-utilisateurs
    console.log('\n🔗 Relations sessions-utilisateurs:');
    const { data: sessionsWithUsers, error: sessionsUsersError } = await supabase
      .from('sessions')
      .select(`
        id,
        subject,
        level,
        type,
        status,
        student:student_id (
          first_name,
          last_name
        ),
        tutor:tutor_id (
          first_name,
          last_name
        )
      `)
      .limit(5);

    if (sessionsUsersError) {
      console.log('❌ Erreur relations sessions:', sessionsUsersError.message);
    } else {
      console.log(`✅ ${sessionsWithUsers.length} sessions avec relations trouvées`);
      sessionsWithUsers.forEach(session => {
        const studentName = session.student ? `${session.student.first_name} ${session.student.last_name}` : 'N/A';
        const tutorName = session.tutor ? `${session.tutor.first_name} ${session.tutor.last_name}` : 'N/A';
        console.log(`   - ${studentName} avec ${tutorName} - ${session.subject} (${session.level})`);
      });
    }

    // 5. Vérifier les relations paiements-utilisateurs
    console.log('\n🔗 Relations paiements-utilisateurs:');
    const { data: paymentsWithUsers, error: paymentsUsersError } = await supabase
      .from('session_payments')
      .select(`
        id,
        amount_cents,
        status,
        student:student_id (
          first_name,
          last_name
        ),
        tutor:tutor_id (
          first_name,
          last_name
        )
      `)
      .limit(5);

    if (paymentsUsersError) {
      console.log('❌ Erreur relations paiements:', paymentsUsersError.message);
    } else {
      console.log(`✅ ${paymentsWithUsers.length} paiements avec relations trouvés`);
      paymentsWithUsers.forEach(payment => {
        const studentName = payment.student ? `${payment.student.first_name} ${payment.student.last_name}` : 'N/A';
        const tutorName = payment.tutor ? `${payment.tutor.first_name} ${payment.tutor.last_name}` : 'N/A';
        console.log(`   - ${studentName} → ${tutorName} - ${(payment.amount_cents / 100).toFixed(2)}€ - ${payment.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

checkDatabaseData();
