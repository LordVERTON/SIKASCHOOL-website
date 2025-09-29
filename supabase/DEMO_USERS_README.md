# Utilisateurs de Démonstration SikaSchool

Ce guide explique comment ajouter et tester les utilisateurs de démonstration pour la plateforme SikaSchool.

## Utilisateurs de Démonstration

### Tuteur de Démonstration
- **Email**: `tutor@sikaschool.com`
- **Mot de passe**: `tutor123`
- **Rôle**: `TUTOR`
- **Profil**: Expert en mathématiques et sciences

### Étudiant de Démonstration
- **Email**: `student@sikaschool.com`
- **Mot de passe**: `student123`
- **Rôle**: `STUDENT`
- **Profil**: Élève de lycée souhaitant améliorer ses résultats

## Méthodes d'Ajout

### Méthode 1: Script SQL (Recommandée)

1. Ouvrez votre projet Supabase dans le dashboard
2. Allez dans l'éditeur SQL
3. Copiez et exécutez le contenu du fichier `supabase/add-demo-users.sql`
4. Vérifiez que les utilisateurs ont été créés avec succès

### Méthode 2: Script Node.js

1. Configurez vos credentials Supabase dans `scripts/add-demo-users-direct.js`:
   ```javascript
   const supabaseUrl = 'https://votre-projet.supabase.co';
   const supabaseServiceKey = 'votre-service-role-key';
   ```

2. Exécutez le script:
   ```bash
   node scripts/add-demo-users-direct.js
   ```

### Méthode 3: Script avec Variables d'Environnement

1. Créez un fichier `.env.local` avec vos credentials Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
   ```

2. Exécutez le script:
   ```bash
   node scripts/add-demo-users.js
   ```

## Test des Credentials

Pour vérifier que les utilisateurs fonctionnent correctement:

1. Configurez vos credentials Supabase dans `scripts/test-demo-login.js`
2. Exécutez le script de test:
   ```bash
   node scripts/test-demo-login.js
   ```

## Vérification Manuelle

Vous pouvez également vérifier manuellement dans Supabase:

1. **Table `users`**: Vérifiez que les deux utilisateurs sont présents
2. **Table `user_credentials`**: Vérifiez que les mots de passe sont hashés
3. **Table `tutors`**: Vérifiez le profil du tuteur
4. **Table `students`**: Vérifiez le profil de l'étudiant

## Utilisation dans l'Application

Une fois les utilisateurs créés, vous pouvez:

1. Aller sur `/auth/signin`
2. Se connecter avec les credentials de démonstration
3. Tester les fonctionnalités selon le rôle:
   - **Tuteur**: Accès au dashboard tuteur, calendrier, élèves, etc.
   - **Étudiant**: Accès au dashboard étudiant, cours, calendrier, etc.

## Sécurité

⚠️ **Important**: Ces utilisateurs sont uniquement pour la démonstration et les tests. En production:

1. Changez les mots de passe par défaut
2. Utilisez des mots de passe forts
3. Ne partagez pas ces credentials en production
4. Considérez supprimer ces utilisateurs en production

## Dépannage

### Erreur "Utilisateur non trouvé"
- Vérifiez que les utilisateurs ont été créés dans la table `users`
- Vérifiez que `is_active = true`

### Erreur "Credentials non trouvés"
- Vérifiez que les credentials existent dans la table `user_credentials`
- Vérifiez que `credential_type = 'password'`
- Vérifiez que `is_active = true`

### Erreur "Mot de passe incorrect"
- Vérifiez que le hash du mot de passe est correct
- Les mots de passe sont hashés avec bcrypt (salt rounds: 12)

## Support

Si vous rencontrez des problèmes, vérifiez:

1. La configuration de votre base de données Supabase
2. Les permissions de votre service role key
3. La structure des tables (schéma correct)
4. Les logs de l'application pour plus de détails
