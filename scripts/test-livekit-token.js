const { createClient } = require('@supabase/supabase-js');
const { AccessToken } = require('livekit-server-sdk');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLiveKitToken() {
  console.log('🔍 Test de token LiveKit...\n');

  try {
    // Récupérer un utilisateur de test
    console.log('👤 Récupération d\'un utilisateur de test...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role')
      .limit(1);

    if (usersError) {
      console.log(`❌ Erreur lors de la récupération des utilisateurs: ${usersError.message}`);
      return;
    }

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('💡 Créez d\'abord un utilisateur via l\'interface d\'inscription');
      return;
    }

    const user = users[0];
    console.log(`✅ Utilisateur trouvé: ${user.first_name} ${user.last_name} (${user.role})`);

    // Générer un token LiveKit
    console.log('\n🔑 Génération du token LiveKit...');
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.log('❌ LIVEKIT_API_KEY ou LIVEKIT_API_SECRET manquants');
      return;
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: `${user.first_name} ${user.last_name}`,
      ttl: 3600, // 1 heure
    });

    token.addGrant({
      roomJoin: true,
      room: 'test-room',
      roomAdmin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();
    console.log('✅ Token généré avec succès');
    console.log(`   Longueur: ${jwt ? jwt.length : 'undefined'} caractères`);
    console.log(`   Utilisateur: ${user.first_name} ${user.last_name}`);
    console.log(`   Room: test-room`);

    // Tester la validité du token
    console.log('\n🧪 Test de validité du token...');
    try {
      if (jwt && typeof jwt === 'string' && jwt.includes('.')) {
        // Décoder le token pour vérifier sa structure
        const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
        console.log('✅ Token valide');
        console.log(`   Expiration: ${new Date(payload.exp * 1000).toLocaleString()}`);
        console.log(`   Identity: ${payload.identity}`);
        console.log(`   Room: ${payload.video?.room}`);
      } else {
        console.log('❌ Token n\'est pas une chaîne JWT valide');
        console.log(`   Type: ${typeof jwt}`);
        console.log(`   Valeur: ${jwt}`);
      }
    } catch (error) {
      console.log(`❌ Token invalide: ${error.message}`);
    }

    // Tester l'API de token de l'application
    console.log('\n🌐 Test de l\'API de token de l\'application...');
    try {
      const response = await fetch('http://localhost:3000/api/livekit/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: 'test-class-id'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API de token fonctionne');
        console.log(`   Token reçu: ${data.token ? 'Oui' : 'Non'}`);
        console.log(`   Role: ${data.role || 'Non défini'}`);
        console.log(`   Room: ${data.roomName || 'Non défini'}`);
      } else {
        const errorData = await response.json();
        console.log(`❌ API de token échouée: ${response.status}`);
        console.log(`   Erreur: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.log(`❌ Erreur lors du test de l'API: ${error.message}`);
      console.log('💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)');
    }

    console.log('\n✅ Test de token LiveKit terminé');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testLiveKitToken();
