const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseLiveKitIssues() {
  console.log('🔍 Diagnostic des problèmes LiveKit...\n');

  try {
    // 1. Vérifier les variables d'environnement
    console.log('📋 Variables d\'environnement:');
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL;
    const livekitApiKey = process.env.LIVEKIT_API_KEY;
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitHttpUrl = process.env.LIVEKIT_HTTP_URL;

    console.log(`   NEXT_PUBLIC_LIVEKIT_SERVER_URL: ${livekitUrl || '❌ Non définie'}`);
    console.log(`   LIVEKIT_API_KEY: ${livekitApiKey ? '✅ Définie' : '❌ Non définie'}`);
    console.log(`   LIVEKIT_API_SECRET: ${livekitApiSecret ? '✅ Définie' : '❌ Non définie'}`);
    console.log(`   LIVEKIT_HTTP_URL: ${livekitHttpUrl || '❌ Non définie'}\n`);

    if (!livekitUrl) {
      console.log('❌ NEXT_PUBLIC_LIVEKIT_SERVER_URL est requise');
      console.log('💡 Configurez un serveur LiveKit (cloud ou auto-hébergé)');
      return;
    }

    // 2. Tester la connectivité réseau
    console.log('🌐 Test de connectivité réseau...');
    try {
      // Extraire l'URL HTTP à partir de l'URL WebSocket
      const httpUrl = livekitHttpUrl || livekitUrl.replace('wss://', 'https://').replace('ws://', 'http://');
      console.log(`   Test de l'URL: ${httpUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
      
      const response = await fetch(`${httpUrl}/twirp/livekit.RoomService/ListRooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Serveur LiveKit accessible');
      } else {
        console.log(`⚠️ Serveur répond avec le code: ${response.status}`);
        console.log(`   Réponse: ${await response.text()}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('❌ Timeout de connexion (10s)');
        console.log('💡 Vérifiez que le serveur LiveKit est démarré et accessible');
      } else {
        console.log(`❌ Erreur de connexion: ${error.message}`);
        console.log('💡 Vérifiez l\'URL du serveur et la connectivité réseau');
      }
    }

    // 3. Tester la génération de token
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
      console.log('💡 Vérifiez que LIVEKIT_API_KEY et LIVEKIT_API_SECRET sont corrects');
    }

    // 4. Vérifier les bookings existants
    console.log('\n📊 Bookings existants:');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, student_id, tutor_id, status, created_at')
      .limit(5);

    if (bookingsError) {
      console.log(`❌ Erreur lors de la récupération des bookings: ${bookingsError.message}`);
    } else {
      console.log(`✅ ${bookings.length} bookings trouvés`);
      bookings.forEach(booking => {
        console.log(`   - Booking ${booking.id}: ${booking.status} (${booking.created_at})`);
      });
    }

    // 5. Recommandations
    console.log('\n💡 Recommandations:');
    if (!livekitUrl) {
      console.log('   1. Configurez NEXT_PUBLIC_LIVEKIT_SERVER_URL');
    }
    if (!livekitApiKey || !livekitApiSecret) {
      console.log('   2. Configurez LIVEKIT_API_KEY et LIVEKIT_API_SECRET');
    }
    console.log('   3. Utilisez LiveKit Cloud pour un déploiement rapide');
    console.log('   4. Vérifiez la documentation: https://docs.livekit.io/');

    console.log('\n✅ Diagnostic terminé');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
  }
}

diagnoseLiveKitIssues();
