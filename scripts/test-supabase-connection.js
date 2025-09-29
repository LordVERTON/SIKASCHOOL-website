const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  try {
    console.log('🧪 Test de connexion Supabase...');

    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('📋 Variables d\'environnement:');
    console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Définie' : '❌ Manquante');
    console.log('- SERVICE_ROLE_KEY:', serviceKey ? '✅ Définie' : '❌ Manquante');

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }

    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, serviceKey);

    // Tester la connexion en récupérant un utilisateur
    console.log('🔄 Test de connexion à la base de données...');
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);

    if (error) {
      console.error('❌ Erreur de connexion Supabase:', error);
      return;
    }

    console.log('✅ Connexion Supabase réussie !');
    console.log('📊 Données récupérées:', data?.length || 0, 'utilisateur(s)');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testSupabaseConnection();
