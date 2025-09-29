const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLiveKitConnection() {
  console.log('🔍 Test de connexion LiveKit...\n');

  try {
    // Vérifier les variables d'environnement LiveKit
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL;
    const livekitApiKey = process.env.LIVEKIT_API_KEY;
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

    console.log('📋 Configuration LiveKit:');
    console.log(`   URL: ${livekitUrl ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`   API Key: ${livekitApiKey ? '✅ Définie' : '❌ Manquante'}`);
    console.log(`   API Secret: ${livekitApiSecret ? '✅ Définie' : '❌ Manquante'}\n`);

    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
      console.error('❌ Configuration LiveKit incomplète');
      return;
    }

    // Tester la connexion au serveur LiveKit
    console.log('🌐 Test de connectivité au serveur LiveKit...');
    try {
      const response = await fetch(`${livekitUrl}/twirp/livekit.RoomService/ListRooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        console.log('✅ Serveur LiveKit accessible');
      } else {
        console.log(`⚠️ Serveur LiveKit répond avec le code: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Impossible de joindre le serveur LiveKit: ${error.message}`);
    }

    // Tester la génération de token
    console.log('\n🔑 Test de génération de token...');
    try {
      const { AccessToken } = require('livekit-server-sdk');
      const token = new AccessToken(livekitApiKey, livekitApiSecret, {
        identity: 'test-user',
        name: 'Test User',
        ttl: 3600,
      });

      token.addGrant({
        roomJoin: true,
        room: 'test-room',
        roomAdmin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      const jwt = token.toJwt();
      console.log('✅ Token généré avec succès');
      console.log(`   Longueur: ${jwt.length} caractères`);
    } catch (error) {
      console.log(`❌ Erreur de génération de token: ${error.message}`);
    }

    // Vérifier les sessions existantes
    console.log('\n📊 Sessions existantes:');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, booking_id, status, created_at')
      .limit(5);

    if (sessionsError) {
      console.log(`❌ Erreur lors de la récupération des sessions: ${sessionsError.message}`);
    } else {
      console.log(`✅ ${sessions.length} sessions trouvées`);
      sessions.forEach(session => {
        console.log(`   - Session ${session.id}: ${session.status} (${session.created_at})`);
      });
    }

    console.log('\n✅ Test de connexion LiveKit terminé');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testLiveKitConnection();
