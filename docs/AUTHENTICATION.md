# Guide d'authentification - SikaSchool

## Configuration de l'authentification

### Variables d'environnement requises

Créez un fichier `.env.local` avec les variables suivantes :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-start

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

```

### Comptes de test disponibles

#### Compte Tuteur
- **Email** : `tutor@sikaschool.com`
- **Mot de passe** : `Daniel`
- **Rôle** : `TUTOR`
- **Accès** : Espace tuteur (`/tutor`)

#### Compte Étudiant (Credentials)
- **Email** : `student@sikaschool.com`
- **Mot de passe** : `Steve`
- **Rôle** : `STUDENT`
- **Accès** : Espace étudiant (`/student`)


## Types d'authentification supportés

### Authentification par credentials (Email/Mot de passe)

L'authentification par email et mot de passe est configurée avec NextAuth.js :

```typescript
// Configuration dans lib/auth.ts
Credentials({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Mot de passe", type: "password" }
  },
  async authorize(credentials) {
    // Vérification des identifiants
    // Support des mots de passe en dur pour les comptes de test
    // Support des mots de passe hashés pour la production
  }
})
```

## Gestion des rôles

### Rôles disponibles
- **ADMIN** : Accès complet à la plateforme
- **TUTOR** : Accès à l'espace tuteur
- **STUDENT** : Accès à l'espace étudiant

### Redirection automatique

Le middleware gère automatiquement la redirection selon le rôle :

```typescript
// Middleware dans middleware.ts
if (userRole === 'TUTOR') {
  return NextResponse.redirect(new URL('/tutor', request.url));
} else if (userRole === 'STUDENT') {
  return NextResponse.redirect(new URL('/student', request.url));
}
```

## Sécurité

### Row Level Security (RLS)

Supabase utilise RLS pour sécuriser les données :

```sql
-- Exemple de politique RLS
CREATE POLICY "Users can read own data" ON users 
FOR SELECT USING (auth.uid()::text = id::text);
```

### Protection des routes

Toutes les routes protégées sont vérifiées par le middleware :

- `/student/*` : Accessible uniquement aux utilisateurs avec le rôle `STUDENT`
- `/tutor/*` : Accessible uniquement aux utilisateurs avec le rôle `TUTOR`
- `/admin/*` : Accessible uniquement aux utilisateurs avec le rôle `ADMIN`

## Utilisation

### Connexion

1. Aller sur `/auth/signin`
2. Saisir l'email et le mot de passe
3. Cliquer sur "Se connecter"
4. Redirection automatique vers l'espace approprié

### Déconnexion

```typescript
import { signOut } from "next-auth/react";

const handleSignOut = () => {
  signOut({ callbackUrl: "/" });
};
```

## Développement

### Ajouter un nouveau compte de test

1. Ajouter l'utilisateur dans `supabase/seed.sql` :

```sql
INSERT INTO users (id, name, email, role, locale, timezone) VALUES
('new-uuid', 'Nom Utilisateur', 'email@test.com', 'ROLE', 'fr', 'Europe/Paris');
```

2. Configurer l'authentification dans `lib/auth.ts` si nécessaire

3. Redémarrer Supabase : `supabase db reset`

### Débogage

Pour déboguer l'authentification :

1. Vérifier les logs Supabase : `supabase logs`
2. Vérifier les variables d'environnement
3. Vérifier la configuration NextAuth dans `lib/auth.ts`

## Production

### Recommandations de sécurité

1. **Mots de passe** : Utiliser des mots de passe hashés avec bcrypt
2. **Secrets** : Utiliser des secrets forts pour `NEXTAUTH_SECRET`
3. **HTTPS** : Forcer HTTPS en production
4. **Rate limiting** : Implémenter une limitation de taux pour les tentatives de connexion

### Déploiement

1. Configurer les variables d'environnement sur Vercel
2. Tester l'authentification en production

## Comptes de test disponibles

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| Tuteur | tutor@sikaschool.com | Daniel | /tutor |
| Étudiant | student@sikaschool.com | Steve | /student |
