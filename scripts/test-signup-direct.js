const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testSignupDirect() {
  try {
    console.log('🧪 Test d\'inscription directe...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Données de test
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user.direct@sikaschool.com',
      password: 'testpassword123'
    };

    console.log('🔄 Test de création d\'utilisateur...');

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(testUser.password, 12);

    // Créer l'utilisateur
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: testUser.email,
        password_hash: hashedPassword,
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        role: 'STUDENT',
        is_active: true,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, email, first_name, last_name, role')
      .single();

    if (userError) {
      console.error('❌ Erreur lors de la création:', userError);
      return;
    }

    console.log('✅ Utilisateur créé avec succès:', newUser);

    // Nettoyer - supprimer l'utilisateur de test
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', newUser.id);

    if (deleteError) {
      console.warn('⚠️ Impossible de supprimer l\'utilisateur de test:', deleteError);
    } else {
      console.log('🧹 Utilisateur de test supprimé');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testSignupDirect();
