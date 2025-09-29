const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateUserPasswords() {
  try {
    console.log('🔄 Migration des mots de passe des utilisateurs...');

    // Récupérer tous les utilisateurs qui n'ont pas de password_hash
    const { data: usersWithoutPassword, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .is('password_hash', null);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    if (!usersWithoutPassword || usersWithoutPassword.length === 0) {
      console.log('✅ Aucun utilisateur à migrer');
      return;
    }

    console.log(`📊 ${usersWithoutPassword.length} utilisateurs à migrer`);

    for (const user of usersWithoutPassword) {
      console.log(`🔄 Migration de ${user.email}...`);

      // Récupérer le mot de passe hashé depuis user_credentials
      const { data: credentials, error: credError } = await supabase
        .from('user_credentials')
        .select('credential_value')
        .eq('user_id', user.id)
        .eq('credential_type', 'password')
        .eq('is_active', true)
        .single();

      if (credError || !credentials) {
        console.warn(`⚠️  Pas de credentials trouvés pour ${user.email}`);
        continue;
      }

      // Mettre à jour l'utilisateur avec le password_hash
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: credentials.credential_value })
        .eq('id', user.id);

      if (updateError) {
        console.error(`❌ Erreur lors de la mise à jour de ${user.email}:`, updateError);
        continue;
      }

      console.log(`✅ ${user.email} migré avec succès`);
    }

    console.log('🎉 Migration terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

migrateUserPasswords();
