const fs = require('fs');
const path = require('path');

function setupEnvironment() {
  console.log('🔧 Configuration des variables d\'environnement Supabase\n');

  const envPath = path.join(__dirname, '..', '.env.local');
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  // Vérifier si .env.local existe déjà
  if (fs.existsSync(envPath)) {
    console.log('✅ Fichier .env.local existe déjà');
    
    // Lire le contenu actuel
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Vérifier si les variables Supabase sont configurées
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=') && 
                          !envContent.includes('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
    const hasSupabaseAnonKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && 
                              !envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
    const hasServiceRoleKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY=') && 
                             !envContent.includes('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here');

    if (hasSupabaseUrl && hasSupabaseAnonKey && hasServiceRoleKey) {
      console.log('✅ Variables Supabase déjà configurées');
      console.log('📝 Contenu actuel du fichier .env.local :');
      console.log('='.repeat(50));
      console.log(envContent);
      console.log('='.repeat(50));
      return;
    } else {
      console.log('⚠️  Variables Supabase partiellement configurées');
      console.log('📝 Variables manquantes :');
      if (!hasSupabaseUrl) console.log('   - NEXT_PUBLIC_SUPABASE_URL');
      if (!hasSupabaseAnonKey) console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
      if (!hasServiceRoleKey) console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    }
  } else {
    console.log('📝 Création du fichier .env.local...');
    
    // Créer le contenu du fichier .env.local
    const envContent = `# Configuration Supabase
# Remplacez ces valeurs par vos vraies credentials Supabase

# URL de votre projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Clé anonyme (publique) de votre projet Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Clé de service (privée) de votre projet Supabase
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Autres variables d'environnement
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
`;

    // Écrire le fichier
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env.local créé');
  }

  console.log('\n📋 Instructions pour configurer Supabase :');
  console.log('='.repeat(60));
  console.log('1. Allez sur https://supabase.com');
  console.log('2. Connectez-vous à votre compte');
  console.log('3. Sélectionnez votre projet (ou créez-en un)');
  console.log('4. Allez dans Settings > API');
  console.log('5. Copiez les valeurs suivantes :');
  console.log('   - Project URL → NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   - service_role → SUPABASE_SERVICE_ROLE_KEY');
  console.log('6. Remplacez les valeurs dans le fichier .env.local');
  console.log('7. Redémarrez votre serveur de développement');
  
  console.log('\n💡 Exemple de configuration :');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  
  console.log('\n🔍 Pour vérifier votre configuration :');
  console.log('   node scripts/test-supabase-auth.js');
  
  console.log('\n⚠️  Important :');
  console.log('   - Ne partagez jamais vos clés publiquement');
  console.log('   - Le fichier .env.local est dans .gitignore');
  console.log('   - Redémarrez le serveur après modification');
}

setupEnvironment();
