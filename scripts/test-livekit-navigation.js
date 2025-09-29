const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLiveKitNavigation() {
  console.log('🔍 Test de navigation LiveKit...\n');

  try {
    // Récupérer des utilisateurs avec différents rôles
    console.log('👥 Récupération des utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role')
      .in('role', ['STUDENT', 'TUTOR']);

    if (usersError) {
      console.log(`❌ Erreur lors de la récupération des utilisateurs: ${usersError.message}`);
      return;
    }

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    console.log(`✅ ${users.length} utilisateurs trouvés`);

    // Tester la logique de navigation
    console.log('\n🧭 Test de la logique de navigation...');
    
    users.forEach(user => {
      const expectedPath = user.role === 'TUTOR' ? '/tutor/calendar' : '/student/calendar';
      console.log(`   ${user.first_name} ${user.last_name} (${user.role}) → ${expectedPath}`);
    });

    // Tester l'API de token avec différents utilisateurs
    console.log('\n🔑 Test de l\'API de token...');
    
    for (const user of users.slice(0, 2)) { // Tester avec les 2 premiers utilisateurs
      console.log(`\n   Test avec ${user.first_name} ${user.last_name} (${user.role})...`);
      
      try {
        // Simuler une requête avec l'ID de l'utilisateur
        const response = await fetch('http://localhost:3000/api/livekit/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `user-id=${user.id}` // Simuler l'authentification
          },
          body: JSON.stringify({
            classId: 'test-class-id'
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`     ✅ Token reçu`);
          console.log(`     📍 Chemin de retour: ${user.role === 'TUTOR' ? '/tutor/calendar' : '/student/calendar'}`);
        } else {
          const errorData = await response.json();
          console.log(`     ❌ Erreur ${response.status}: ${errorData.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        console.log(`     ❌ Erreur de requête: ${error.message}`);
      }
    }

    // Vérifier les routes de navigation
    console.log('\n🗺️ Routes de navigation disponibles:');
    const routes = [
      { path: '/student/calendar', description: 'Calendrier étudiant' },
      { path: '/tutor/calendar', description: 'Calendrier tuteur' },
      { path: '/student/dashboard', description: 'Dashboard étudiant' },
      { path: '/tutor/dashboard', description: 'Dashboard tuteur' }
    ];

    routes.forEach(route => {
      console.log(`   ${route.path} - ${route.description}`);
    });

    console.log('\n✅ Test de navigation LiveKit terminé');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testLiveKitNavigation();
