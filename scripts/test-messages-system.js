const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMessagesSystem() {
  console.log('🧪 Test du système de messages...\n');

  try {
    // 1. Vérifier les utilisateurs de test
    console.log('1. Vérification des utilisateurs de test...');
    const { data: testUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .or('email.like.test.student.message%,email.like.test.tutor.message%')
      .order('email');

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    console.log(`✅ ${testUsers.length} utilisateurs de test trouvés:`);
    testUsers.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`);
    });

    // 2. Vérifier les assignations tuteur-étudiant
    console.log('\n2. Vérification des assignations...');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('tutor_student_assignments')
      .select(`
        id,
        tutor_id,
        student_id,
        is_active,
        assigned_at,
        tutors:tutor_id (first_name, last_name),
        students:student_id (first_name, last_name)
      `)
      .in('tutor_id', testUsers.filter(u => u.role === 'TUTOR').map(u => u.id))
      .in('student_id', testUsers.filter(u => u.role === 'STUDENT').map(u => u.id));

    if (assignmentsError) {
      console.error('❌ Erreur lors de la récupération des assignations:', assignmentsError);
      return;
    }

    console.log(`✅ ${assignments.length} assignations trouvées:`);
    assignments.forEach(assignment => {
      const tutor = assignment.tutors;
      const student = assignment.students;
      console.log(`   - ${tutor.first_name} ${tutor.last_name} → ${student.first_name} ${student.last_name}`);
    });

    // 3. Vérifier les threads de messages
    console.log('\n3. Vérification des threads de messages...');
    const { data: threads, error: threadsError } = await supabase
      .from('message_threads')
      .select(`
        id,
        subject,
        student_id,
        tutor_id,
        created_at,
        updated_at,
        tutors:student_id (first_name, last_name),
        students:tutor_id (first_name, last_name)
      `)
      .like('subject', 'Test Message%')
      .order('created_at', { ascending: false });

    if (threadsError) {
      console.error('❌ Erreur lors de la récupération des threads:', threadsError);
      return;
    }

    console.log(`✅ ${threads.length} threads de messages trouvés:`);
    threads.forEach(thread => {
      const tutor = thread.tutors || thread.students;
      const student = thread.students || thread.tutors;
      console.log(`   - "${thread.subject}"`);
      console.log(`     ${student.first_name} ${student.last_name} ↔ ${tutor.first_name} ${tutor.last_name}`);
      console.log(`     Créé: ${new Date(thread.created_at).toLocaleString('fr-FR')}`);
    });

    // 4. Vérifier les messages
    console.log('\n4. Vérification des messages...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        thread_id,
        sender_id,
        content,
        is_read,
        created_at,
        threads:thread_id (subject),
        senders:sender_id (first_name, last_name, role)
      `)
      .in('thread_id', threads.map(t => t.id))
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('❌ Erreur lors de la récupération des messages:', messagesError);
      return;
    }

    console.log(`✅ ${messages.length} messages trouvés:`);
    
    // Grouper les messages par thread
    const messagesByThread = {};
    messages.forEach(message => {
      if (!messagesByThread[message.thread_id]) {
        messagesByThread[message.thread_id] = [];
      }
      messagesByThread[message.thread_id].push(message);
    });

    Object.entries(messagesByThread).forEach(([threadId, threadMessages]) => {
      const thread = threads.find(t => t.id === threadId);
      console.log(`\n   📧 Thread: "${thread.subject}"`);
      threadMessages.forEach((message, index) => {
        const sender = message.senders;
        const isRead = message.is_read ? '✅' : '❌';
        const time = new Date(message.created_at).toLocaleTimeString('fr-FR');
        console.log(`     ${index + 1}. [${time}] ${sender.first_name} ${sender.last_name} (${sender.role}): "${message.content.substring(0, 50)}..." ${isRead}`);
      });
    });

    // 5. Vérifier les notifications
    console.log('\n5. Vérification des notifications...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, message, created_at, data')
      .eq('type', 'MESSAGE')
      .order('created_at', { ascending: false })
      .limit(10);

    if (notificationsError) {
      console.error('❌ Erreur lors de la récupération des notifications:', notificationsError);
      return;
    }

    console.log(`✅ ${notifications.length} notifications de messages trouvées:`);
    notifications.forEach(notif => {
      console.log(`   - ${notif.title}: "${notif.message}"`);
      console.log(`     Créée: ${new Date(notif.created_at).toLocaleString('fr-FR')}`);
    });

    // 6. Test de l'API des messages
    console.log('\n6. Test de l\'API des messages...');
    
    // Simuler une requête pour récupérer les threads d'un étudiant
    const testStudent = testUsers.find(u => u.role === 'STUDENT');
    if (testStudent) {
      console.log(`   Test avec l'étudiant: ${testStudent.first_name} ${testStudent.last_name}`);
      
      // Récupérer les threads de cet étudiant
      const { data: studentThreads, error: studentThreadsError } = await supabase
        .from('message_threads')
        .select(`
          id,
          subject,
          created_at,
          updated_at,
          student_id,
          tutor_id,
          tutors:student_id (first_name, last_name, avatar_url),
          students:tutor_id (first_name, last_name, avatar_url)
        `)
        .or(`student_id.eq.${testStudent.id},tutor_id.eq.${testStudent.id}`)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (studentThreadsError) {
        console.error('❌ Erreur lors de la récupération des threads de l\'étudiant:', studentThreadsError);
      } else {
        console.log(`   ✅ ${studentThreads.length} threads trouvés pour ${testStudent.first_name}`);
        studentThreads.forEach(thread => {
          const isStudentThread = thread.student_id === testStudent.id;
          const tutor = isStudentThread ? thread.tutors : thread.students;
          console.log(`     - "${thread.subject}" avec ${tutor.first_name} ${tutor.last_name}`);
        });
      }
    }

    console.log('\n🎉 Test du système de messages terminé avec succès !');
    console.log('\n📋 Résumé:');
    console.log(`   - ${testUsers.length} utilisateurs de test`);
    console.log(`   - ${assignments.length} assignations tuteur-étudiant`);
    console.log(`   - ${threads.length} threads de messages`);
    console.log(`   - ${messages.length} messages échangés`);
    console.log(`   - ${notifications.length} notifications créées`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testMessagesSystem();
