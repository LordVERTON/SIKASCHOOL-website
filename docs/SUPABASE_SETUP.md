# Configuration de Supabase - Guide Étape par Étape

## 🚀 Configuration de la Base de Données

### Étape 1: Ouvrir le Dashboard Supabase

1. **Allez sur** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Connectez-vous** à votre compte
3. **Sélectionnez votre projet** SikaSchool

### Étape 2: Créer le Schéma de Base de Données

1. **Cliquez sur "SQL Editor"** dans le menu de gauche
2. **Cliquez sur "New query"**
3. **Copiez tout le contenu** du fichier `supabase/schema.sql`
4. **Collez-le** dans l'éditeur SQL
5. **Cliquez sur "Run"** pour exécuter le schéma

### Étape 3: Vérifier les Tables Créées

1. **Allez dans "Table Editor"** dans le menu de gauche
2. **Vérifiez que les tables suivantes existent** :
   - ✅ `users`
   - ✅ `user_credentials`
   - ✅ `tutors`
   - ✅ `students`
   - ✅ `courses`
   - ✅ `lessons`
   - ✅ `enrollments`
   - ✅ `progress`
   - ✅ `assignments`
   - ✅ `submissions`
   - ✅ `message_threads`
   - ✅ `messages`
   - ✅ `notifications`
   - ✅ `plans`
   - ✅ `purchases`
   - ✅ `bookings`
   - ✅ `availabilities`
   - ✅ `reviews`
   - ✅ `sessions`
   - ✅ `session_payments`
   - ✅ `pricing_rules`

### Étape 4: Insérer les Données de Test

1. **Retournez dans "SQL Editor"**
2. **Copiez le contenu** du fichier `supabase/seed.sql`
3. **Collez-le** dans l'éditeur SQL
4. **Cliquez sur "Run"** pour insérer les données de test

### Étape 5: Insérer les Credentials des Tuteurs

1. **Dans "SQL Editor"**
2. **Copiez le contenu** du fichier `supabase/tutor-credentials.sql`
3. **Collez-le** dans l'éditeur SQL
4. **Cliquez sur "Run"** pour créer les tuteurs

## 🔧 Configuration des Variables d'Environnement

### Fichier `.env.local`

Créez ou modifiez le fichier `.env.local` avec vos credentials Supabase :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication
JWT_SECRET=votre-clé-jwt-secrète-très-longue-et-aléatoire

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-nextauth

# Development
NODE_ENV=development
```

### Où Trouver vos Credentials

1. **Dans votre dashboard Supabase**
2. **Allez dans "Settings" > "API"**
3. **Copiez** :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

## 🧪 Test de la Configuration

### Vérifier la Connexion

```bash
node scripts/insert-tutor-credentials.js
```

### Résultat Attendu

```
✅ Connexion à Supabase réussie
📝 Traitement de Alix Martin...
✅ Utilisateur créé avec l'ID: [UUID]
✅ Credentials créés pour Alix
✅ Profil tuteur créé pour Alix
...
🎉 Tous les tuteurs ont été créés avec succès !
```

## 📋 Credentials des Tuteurs Créés

| Tuteur | Email | Mot de Passe |
|--------|-------|--------------|
| Alix Martin | `alix.martin@sikaschool.com` | `wTCvyb5*jAuD` |
| Nolwen Dubois | `nolwen.dubois@sikaschool.com` | `2HAt&DsC^%d5` |
| Ruudy Moreau | `ruudy.moreau@sikaschool.com` | `VeE*I2Cp&%1&` |
| Daniel Bernard | `daniel.bernard@sikaschool.com` | `N9SUOYn@fFsw` |
| Walid Petit | `walid.petit@sikaschool.com` | `gT1tHFSg@nfr` |

## 🔍 Vérification Finale

### Dans Supabase Dashboard

1. **Table Editor** > **users** → Vérifiez que les 5 tuteurs sont créés
2. **Table Editor** > **user_credentials** → Vérifiez les mots de passe hashés
3. **Table Editor** > **tutors** → Vérifiez les profils détaillés

### Dans l'Application

1. **Démarrez l'application** : `npm run dev`
2. **Allez sur** `/auth/signin`
3. **Testez la connexion** avec un des tuteurs

## 🚨 Dépannage

### Erreur "Could not find the table"

- ✅ Vérifiez que le schéma a été exécuté correctement
- ✅ Vérifiez que les tables existent dans "Table Editor"

### Erreur "Invalid credentials"

- ✅ Vérifiez vos variables d'environnement
- ✅ Vérifiez que les clés Supabase sont correctes

### Erreur "Permission denied"

- ✅ Vérifiez que vous utilisez la clé `service_role`
- ✅ Vérifiez les politiques RLS dans Supabase

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** dans la console
2. **Consultez la documentation** Supabase
3. **Vérifiez les permissions** des tables
4. **Contactez l'administrateur** système

---

**🎉 Une fois terminé, vous devriez avoir une base de données Supabase complètement configurée avec tous les tuteurs SikaSchool !**
