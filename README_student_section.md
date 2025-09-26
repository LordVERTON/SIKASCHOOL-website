# Espace Étudiant - Plateforme Soutien Pédagogique

## Vue d'ensemble

L'espace étudiant de SikaSchool est une plateforme complète de soutien pédagogique qui permet aux étudiants de gérer leur apprentissage, suivre leur progression et interagir avec leurs tuteurs.

## Fonctionnalités principales

### 🏠 Tableau de bord
- **Vue d'ensemble** : Statistiques de progression, heures d'étude, devoirs rendus
- **Prochaines activités** : Séances programmées, échéances importantes
- **Recommandations** : Contenu personnalisé basé sur la progression
- **Accès rapide** : Liens directs vers les cours en cours

### 📚 Mes cours
- **Grille de cours** : Vue d'ensemble de tous les cours avec progression
- **Navigation intuitive** : Accès direct aux leçons et chapitres
- **Suivi de progression** : Barres de progression et statistiques détaillées
- **Contenu interactif** : Leçons avec support multimédia

### 📝 Mes devoirs
- **Liste des devoirs** : Vue d'ensemble avec statuts et échéances
- **Soumission en ligne** : Upload de fichiers et rédaction directe
- **Suivi des notes** : Historique des évaluations et feedbacks
- **Alertes de retard** : Notifications pour les devoirs en retard

### 💬 Messages
- **Communication avec les tuteurs** : Messagerie intégrée
- **Threads organisés** : Conversations groupées par sujet
- **Notifications en temps réel** : Alertes pour nouveaux messages
- **Support de fichiers** : Partage de documents et images

### 📅 Calendrier
- **Vue mensuelle/hebdomadaire** : Planning complet des activités
- **Événements colorés** : Différenciation par type (cours, devoirs, évaluations)
- **Intégration des séances** : Réservation et suivi des cours
- **Export** : Synchronisation avec calendriers externes

### 🔔 Notifications
- **Centre de notifications** : Toutes les alertes centralisées
- **Types variés** : Devoirs, messages, notes, rappels, cours
- **Gestion des préférences** : Personnalisation des notifications
- **Marquage lu/non lu** : Suivi de l'état des notifications

### 👤 Mon profil
- **Informations personnelles** : Gestion du profil utilisateur
- **Préférences** : Langue, fuseau horaire, thème
- **Paramètres de notification** : Email, push, SMS
- **Sécurité** : Gestion du mot de passe et 2FA

## Architecture technique

### Stack technologique
- **Frontend** : Next.js 15 + TypeScript + Tailwind CSS
- **Backend** : Next.js API Routes + Supabase
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : NextAuth.js v5 + Supabase Auth
- **UI Components** : Composants personnalisés + Radix UI
- **Thème** : Support clair/sombre avec next-themes

### Structure des routes

```
/student
├── /dashboard          # Tableau de bord principal
├── /courses           # Liste des cours
│   └── /[courseId]    # Détail d'un cours
│       └── /lessons/[lessonId]  # Leçon individuelle
├── /assignments       # Devoirs et évaluations
├── /messages          # Messagerie
├── /calendar          # Calendrier et planning
├── /notifications     # Centre de notifications
└── /profile           # Profil utilisateur
```

### API Routes

```
/api/student
├── /dashboard         # Données du tableau de bord
├── /courses          # Gestion des cours
│   └── /[courseId]   # Détail d'un cours
│       └── /lessons/[lessonId]  # Gestion des leçons
├── /assignments      # Gestion des devoirs
│   └── /[id]/submit  # Soumission de devoirs
├── /messages         # Messagerie
│   └── /[threadId]   # Thread de conversation
├── /calendar         # Données du calendrier
└── /notifications    # Gestion des notifications
```

## Base de données

### Modèles principaux

```sql
-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'STUDENT',
    image TEXT,
    locale TEXT DEFAULT 'fr',
    timezone TEXT DEFAULT 'Europe/Paris',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    level course_level NOT NULL,
    tags TEXT[] DEFAULT '{}',
    tutor_id UUID NOT NULL REFERENCES users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id),
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    content_url TEXT,
    duration_min INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress table
CREATE TABLE progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    lesson_id UUID NOT NULL REFERENCES lessons(id),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    seconds_watched INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);
```

## Sécurité et authentification

### Protection des routes
- **Middleware** : Vérification automatique des rôles
- **RBAC** : Contrôle d'accès basé sur les rôles (STUDENT, TUTOR, ADMIN)
- **Sessions** : Gestion sécurisée avec NextAuth.js
- **API Protection** : Validation des permissions sur chaque endpoint

### Rôles et permissions
```typescript
enum Role {
  ADMIN    // Accès complet à la plateforme
  TUTOR    // Gestion des cours et étudiants
  STUDENT  // Accès à l'espace étudiant uniquement
}
```

## Composants UI

### Composants réutilisables
- **StudentSidebar** : Navigation latérale responsive
- **StatsCards** : Cartes de statistiques avec icônes
- **CourseCard** : Carte de cours avec progression
- **ProgressBar** : Barre de progression personnalisable
- **AssignmentTable** : Tableau des devoirs avec actions
- **EmptyState** : États vides avec actions
- **Skeleton** : Chargement avec squelettes

### Design System
- **Cohérence visuelle** : Aligné sur le style de l'espace tuteur
- **Responsive** : Adaptation mobile/desktop
- **Accessibilité** : Support ARIA, navigation clavier
- **Thème** : Support clair/sombre

## Données de démonstration

### Utilisateurs de test
- **Étudiant** : marie.dupont@email.com (Marie Dupont)
- **Tuteurs** : 
  - dupont@sikaschool.com (M. Dupont - Mathématiques)
  - martin@sikaschool.com (Mme Martin - Physique)
  - leroy@sikaschool.com (M. Leroy - Français)

### Contenu de démonstration
- **3 cours** : Mathématiques, Physique, Français (Terminale)
- **15+ leçons** : Contenu structuré avec progression
- **Devoirs** : Assignments avec soumissions et notes
- **Messages** : Conversations avec les tuteurs
- **Notifications** : Alertes variées
- **Plans** : Packs et séances à l'unité

## Installation et démarrage

### Prérequis
```bash
# Supabase CLI
npm install -g supabase

# Node.js 18+
# npm ou yarn
```

### Installation
```bash
# Cloner le projet
git clone <repository>
cd SIKASCHOOL-website

# Installer les dépendances
npm install

# Configuration Supabase
cp .env.example .env.local
# Éditer .env.local avec vos paramètres Supabase

# Initialiser Supabase localement
supabase init

# Démarrer Supabase localement
supabase start

# Appliquer le schéma de base de données
supabase db reset

# Démarrer le serveur de développement
npm run dev
```

### Scripts disponibles
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run db:types     # Générer les types TypeScript depuis Supabase
```

### Scripts Supabase
```bash
supabase start       # Démarrer Supabase localement
supabase stop        # Arrêter Supabase localement
supabase status      # Vérifier le statut
supabase db reset    # Réinitialiser la base de données
supabase gen types typescript --local > lib/database.types.ts  # Générer les types
```

## Tests et qualité

### Tests unitaires
```bash
npm run test         # Tests avec Vitest
npm run test:watch   # Mode watch
```

### Tests E2E
```bash
npm run test:e2e     # Tests avec Playwright
```

### Qualité du code
```bash
npm run lint         # ESLint
npm run type-check   # Vérification TypeScript
npm run format       # Prettier
```

## Déploiement

### Variables d'environnement
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.com"

# OAuth (optionnel)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Déploiement Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_SECRET
```

## Roadmap

### Fonctionnalités futures
- [ ] **Mode hors ligne** : Synchronisation des leçons
- [ ] **Gamification** : Badges et récompenses
- [ ] **Analytics** : Tableaux de bord détaillés
- [ ] **Mobile App** : Application native
- [ ] **IA** : Recommandations personnalisées
- [ ] **Collaboration** : Travail en groupe
- [ ] **Intégrations** : Zoom, Google Classroom
- [ ] **Multilingue** : Support i18n complet

### Améliorations techniques
- [ ] **Performance** : Optimisation des requêtes
- [ ] **Cache** : Redis pour les sessions
- [ ] **CDN** : Distribution des assets
- [ ] **Monitoring** : Sentry, LogRocket
- [ ] **Tests** : Couverture complète
- [ ] **CI/CD** : Pipeline automatisé

## Support et contribution

### Documentation
- [Documentation API](./docs/api.md)
- [Guide de contribution](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

### Contact
- **Email** : support@sikaschool.com
- **Discord** : [Serveur communautaire](https://discord.gg/sikaschool)
- **GitHub** : [Issues et discussions](https://github.com/sikaschool/platform/issues)

---

*Dernière mise à jour : Septembre 2024*
