const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSupabaseConnection() {
  console.log('🔍 Vérification de la connexion Supabase...\n');

  // Vérifier les variables d'environnement
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL manquante dans .env.local');
    return;
  }

  if (!supabaseKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
    return;
  }

  console.log('✅ Variables d\'environnement trouvées');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

  try {
    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Client Supabase créé');

    // Tester la connexion avec une requête simple
    console.log('\n🔍 Test de connexion...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      
      if (error.message.includes('Failed to fetch')) {
        console.log('\n💡 Solutions possibles :');
        console.log('   1. Vérifiez votre connexion internet');
        console.log('   2. Vérifiez que votre projet Supabase est actif');
        console.log('   3. Vérifiez que l\'URL et la clé sont correctes');
        console.log('   4. Essayez de vous reconnecter à Supabase');
      }
    } else {
      console.log('✅ Connexion Supabase réussie !');
      console.log('✅ La table users est accessible');
    }

    // Vérifier les tables existantes
    console.log('\n📊 Vérification des tables existantes...');
    const tables = [
      'users',
      'tutors', 
      'students',
      'subjects',
      'courses',
      'assignments',
      'notifications',
      'reviews',
      'faqs',
      'messages',
      'message_threads',
      'tutor_availability',
      'bookings',
      'sessions',
      'session_payments',
      'pricing_rules',
      'user_credentials'
    ];

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        if (tableError) {
          console.log(`   ❌ Table ${table}: ${tableError.message}`);
        } else {
          console.log(`   ✅ Table ${table}: OK`);
        }
      } catch (err) {
        console.log(`   ❌ Table ${table}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

checkSupabaseConnection();
