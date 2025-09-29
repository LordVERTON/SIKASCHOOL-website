const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuration Supabase - Remplacez par vos vraies valeurs
const supabaseUrl = 'https://your-project.supabase.co'; // Remplacez par votre URL Supabase
const supabaseServiceKey = 'your-service-role-key-here'; // Remplacez par votre service role key

console.log('⚠️  ATTENTION: Veuillez d\'abord configurer les variables Supabase dans ce script');
console.log('📝 Éditez le fichier scripts/test-demo-login.js et remplacez:');
console.log('   - supabaseUrl par votre URL Supabase');
console.log('   - supabaseServiceKey par votre service role key');
console.log('');

if (supabaseUrl === 'https://your-project.supabase.co' || supabaseServiceKey === 'your-service-role-key-here') {
  console.log('❌ Veuillez d\'abord configurer les credentials Supabase dans le script');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLogin(email, password) {
  try {
    console.log(`🔐 Test de connexion pour: ${email}`);

    // Récupérer l'utilisateur depuis Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      console.log(`❌ Utilisateur non trouvé: ${email}`);
      return false;
    }

    console.log(`✅ Utilisateur trouvé: ${user.email} (${user.role})`);

    // Récupérer les credentials
    const { data: credentials, error: credError } = await supabase
      .from('user_credentials')
      .select('credential_value')
      .eq('user_id', user.id)
      .eq('credential_type', 'password')
      .eq('is_active', true)
      .single();

    if (credError || !credentials) {
      console.log(`❌ Credentials non trouvés pour: ${email}`);
      return false;
    }

    // Vérifier le mot de passe
    const isValidPassword = bcrypt.compare(password, credentials.credential_value);

    if (!isValidPassword) {
      console.log(`❌ Mot de passe incorrect pour: ${email}`);
      return false;
    }

    console.log(`🎉 Connexion réussie pour: ${email}`);
    return true;

  } catch (error) {
    console.error(`❌ Erreur lors du test de connexion pour ${email}:`, error);
    return false;
  }
}

async function testDemoUsers() {
  console.log('🧪 Test des utilisateurs de démonstration...');
  console.log('');

  const tests = [
    { email: 'tutor@sikaschool.com', password: 'tutor123', role: 'TUTOR' },
    { email: 'student@sikaschool.com', password: 'student123', role: 'STUDENT' }
  ];

  for (const test of tests) {
    console.log(`📋 Test: ${test.email} (${test.role})`);
    const success = await testLogin(test.email, test.password);
    console.log(`Résultat: ${success ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
    console.log('');
  }

  console.log('🏁 Tests terminés');
}

testDemoUsers();
