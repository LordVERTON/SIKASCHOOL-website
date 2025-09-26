# Configuration des Credentials des Tuteurs

Ce document explique comment créer et gérer les credentials des tuteurs SikaSchool dans Supabase.

## 📋 Résumé des Tuteurs Créés

### 👨‍🏫 Tuteurs SikaSchool

| Nom | Email | Mot de passe | Spécialisations |
|-----|-------|--------------|-----------------|
| **Alix Martin** | `alix.martin@sikaschool.com` | `wTCvyb5*jAuD` | Français, Méthodologie, Droits |
| **Nolwen Dubois** | `nolwen.dubois@sikaschool.com` | `2HAt&DsC^%d5` | Mathématiques, Mécanique |
| **Ruudy Moreau** | `ruudy.moreau@sikaschool.com` | `VeE*I2Cp&%1&` | Mécanique des fluides, Physique, Mathématiques |
| **Daniel Bernard** | `daniel.bernard@sikaschool.com` | `N9SUOYn@fFsw` | Mathématiques, Physique, Informatique, Sciences de l'ingénieur |
| **Walid Petit** | `walid.petit@sikaschool.com` | `gT1tHFSg@nfr` | Mathématiques, Informatique, Physique |

## 🚀 Méthodes d'Insertion

### Méthode 1: Script Automatique (Recommandé)

1. **Configurez vos credentials Supabase** dans `scripts/insert-tutors-manual.js` :
   ```javascript
   const supabaseUrl = 'https://votre-projet.supabase.co';
   const supabaseServiceKey = 'votre-clé-service-role';
   ```

2. **Exécutez le script** :
   ```bash
   node scripts/insert-tutors-manual.js
   ```

### Méthode 2: Requêtes SQL Directes

1. **Ouvrez votre dashboard Supabase**
2. **Allez dans l'éditeur SQL**
3. **Copiez et exécutez le contenu de** `supabase/tutor-credentials.sql`

### Méthode 3: Via l'Interface Supabase

1. **Table `users`** : Insérez les utilisateurs tuteurs
2. **Table `user_credentials`** : Insérez les mots de passe hashés
3. **Table `tutors`** : Insérez les profils détaillés

## 🔐 Sécurité des Mots de Passe

### Caractéristiques des Mots de Passe
- **Longueur** : 12 caractères
- **Complexité** : Majuscules, minuscules, chiffres, symboles
- **Hachage** : bcrypt avec salt rounds = 12
- **Format** : `$2a$12$...`

### Exemple de Génération
```javascript
// Mot de passe en clair
const plainPassword = 'wTCvyb5*jAuD';

// Mot de passe hashé
const hashedPassword = '$2a$12$t4Phh8uhFKHFa1zO4ftoe.X.srA.My5zAjvhpHEiObLSw8bgaFIke';
```

## 📊 Structure des Données

### Table `users`
```sql
INSERT INTO users (email, first_name, last_name, role, is_active) VALUES
  ('alix.martin@sikaschool.com', 'Alix', 'Martin', 'TUTOR', true);
```

### Table `user_credentials`
```sql
INSERT INTO user_credentials (user_id, credential_type, credential_value, is_active) VALUES
  ((SELECT id FROM users WHERE email = 'alix.martin@sikaschool.com'), 'password', '$2a$12$...', true);
```

### Table `tutors`
```sql
INSERT INTO tutors (user_id, bio, subjects, experience_years, hourly_rate_cents, is_available) VALUES
  ((SELECT id FROM users WHERE email = 'alix.martin@sikaschool.com'), 'Bio...', ARRAY['Français', 'Méthodologie'], 7, 6000, true);
```

## 🔧 Scripts Disponibles

### `scripts/create-tutor-credentials.js`
- Génère des mots de passe aléatoires sécurisés
- Hashe les mots de passe avec bcrypt
- Affiche les requêtes SQL prêtes à exécuter

### `scripts/insert-tutors-manual.js`
- Insère automatiquement les tuteurs dans Supabase
- Nécessite la configuration des credentials Supabase
- Teste la connexion avant insertion

### `supabase/tutor-credentials.sql`
- Fichier SQL avec toutes les requêtes d'insertion
- Peut être exécuté directement dans l'éditeur SQL Supabase
- Inclut les commentaires et la documentation

## 🛡️ Bonnes Pratiques de Sécurité

### ✅ À Faire
- Conserver les mots de passe en lieu sûr
- Utiliser des mots de passe forts et uniques
- Hasher tous les mots de passe avant stockage
- Limiter l'accès aux credentials de service

### ❌ À Éviter
- Stocker les mots de passe en clair
- Partager les credentials par email non sécurisé
- Utiliser des mots de passe faibles
- Exposer les clés de service dans le code client

## 🔄 Mise à Jour des Credentials

### Changer un Mot de Passe
1. **Générer un nouveau mot de passe** avec le script
2. **Hasher le nouveau mot de passe**
3. **Mettre à jour** la table `user_credentials`
4. **Notifier le tuteur** du nouveau mot de passe

### Ajouter un Nouveau Tuteur
1. **Créer l'utilisateur** dans la table `users`
2. **Générer et hasher** le mot de passe
3. **Insérer les credentials** dans `user_credentials`
4. **Créer le profil** dans la table `tutors`

## 📞 Support

En cas de problème :
1. Vérifiez la connexion à Supabase
2. Vérifiez les permissions des tables
3. Consultez les logs d'erreur
4. Contactez l'administrateur système

---

**⚠️ Important** : Conservez ces credentials en sécurité et ne les partagez que par des canaux sécurisés.
