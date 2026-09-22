# Configuration LiveKit

## Développement local sans Internet

Le serveur LiveKit de développement est fourni par Docker et n'utilise aucun service Cloud.

1. Une seule fois, avec Internet, récupérer l'image épinglée :

   ```bash
   docker compose -f docker-compose.livekit.yml pull
   ```

2. Les valeurs locales LiveKit et Supabase sont fournies dans `.env.development.local`. Pour un nouveau clone, copiez d'abord `.env.development.local.example` vers ce fichier : aucune clé n'est à renseigner.

   ```bash
   NEXT_PUBLIC_LIVEKIT_SERVER_URL=ws://127.0.0.1:7880
   LIVEKIT_HTTP_URL=http://127.0.0.1:7880
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=secret
   ```

3. Démarrer le service et l'application :

   ```bash
   npm run livekit
   npm run dev
   ```

Les ports 7880 (signalisation/API), 7881 (ICE TCP) et 7882/UDP (WebRTC) sont publiés uniquement sur la boucle locale. L'image `livekit/livekit-server:v1.13.7` reste utilisable après `npm cache clean`; ne lancez pas `docker image prune -a` si vous souhaitez conserver les images hors ligne.

`npm run livekit:down` arrête le service. `npm run livekit:logs` affiche ses journaux.

Ces identifiants `devkey`/`secret` sont strictement réservés au développement local. La configuration Cloud de production demeure dans l'environnement de déploiement, et ne doit pas être remplacée par ces valeurs.

## Production

Utilisez une URL `wss://` et des clés LiveKit propres à l'environnement. Un déploiement public requiert TLS, des règles réseau adaptées pour WebRTC et, selon le contexte, TURN. Ne réutilisez jamais le fichier `livekit.local.yaml` en production.

## Variables d'environnement requises

Pour que LiveKit fonctionne correctement, vous devez configurer les variables d'environnement suivantes :

### Variables LiveKit
```bash
# URL du serveur LiveKit (WebSocket)
NEXT_PUBLIC_LIVEKIT_SERVER_URL=wss://your-livekit-server.com

# Clés API LiveKit
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# URL HTTP pour les appels API (optionnel, dérivé de SERVER_URL si non défini)
LIVEKIT_HTTP_URL=https://your-livekit-server.com
```

## Configuration du serveur LiveKit

### Option 1: LiveKit Cloud (Recommandé)
1. Créez un compte sur [LiveKit Cloud](https://cloud.livekit.io/)
2. Créez un nouveau projet
3. Récupérez les clés API depuis le dashboard
4. Utilisez l'URL WebSocket fournie

### Option 2: Serveur auto-hébergé
1. Déployez LiveKit sur votre infrastructure
2. Configurez les clés API dans votre serveur
3. Assurez-vous que les ports WebSocket et HTTP sont accessibles

## Vérification

Avec les variables renseignées dans `.env.local`, lancez l’app (`npm run dev`) et ouvrez une salle de cours (live) : la connexion WebSocket et le token signé côté API valident en pratique la configuration.

## Dépannage

### Erreur "room connection has timed out"
- Vérifiez que `NEXT_PUBLIC_LIVEKIT_SERVER_URL` est correct
- Vérifiez que le serveur LiveKit est accessible
- Vérifiez que les clés API sont valides
- Vérifiez la connectivité réseau

### Erreur "Invalid token"
- Vérifiez que `LIVEKIT_API_KEY` et `LIVEKIT_API_SECRET` sont corrects
- Vérifiez que le token n'a pas expiré (TTL par défaut: 2 heures)

### Problèmes de connexion
- Vérifiez les pare-feu et proxy
- Vérifiez que les ports WebSocket sont ouverts
- Testez la connectivité avec `curl` ou `wget`
