# Configuration LiveKit

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

## Test de la configuration

Exécutez le script de test pour vérifier votre configuration :

```bash
node scripts/test-livekit-connection.js
```

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
