# SikaSchool — Plateforme Next.js

Plateforme éducative complète construite sur **Next.js 15 (App Router)** et **React 19**, avec cours particuliers en direct (LiveKit), messagerie, gestion administrative et **Sika AI**, un tuteur IA permanent intégré à l'espace élève (LangChain / LangGraph, vision multimodale).

- **URL de production** : [https://sikaschool.app](https://sikaschool.app)
- **Basé sur** : template Solid (design system conservé — Tailwind CSS, dark mode, animations)
- **Contenu inspiré de** : `https://www.sikaschool.com/`

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Sika AI — Tuteur permanent (LangChain / LangGraph)](#sika-ai--tuteur-permanent-langchain--langgraph)
- [Architecture technique](#architecture-technique)
- [Structure du projet](#structure-du-projet)
- [Démarrage](#démarrage)
- [Base de données et nouveau collaborateur](#base-de-données-et-nouveau-collaborateur)
- [Variables d'environnement](#variables-denvironnement)
- [Routes API](#routes-api)
- [Schéma base de données](#schéma-base-de-données)
- [Qualité & sécurité](#qualité--sécurité)
- [Roadmap](#roadmap)
- [Documentation](#documentation)
- [Scripts](#scripts)

---

## Fonctionnalités

### Portails
- **Espace élève** — tableau de bord, calendrier, historique, profil, messagerie, notifications temps réel, sélection/assignation de tuteurs, **chat avec Sika AI**.
- **Espace tuteur** — tableau de bord, agenda, fiches élèves (avec infos d'intake), sessions, paiements & commissions, messagerie, notifications.
- **Panel admin** (tuteurs privilégiés) — gestion utilisateurs (CRUD + reset mot de passe + statut actif), sessions, assignations tuteur↔élève, synchronisation de profils.

### Acquisition & authentification
- Capture de leads depuis la homepage avec **création automatique de compte élève** et mot de passe initial `<prenom>.<nom>12345`.
- Authentification maison sur Supabase, rôles `STUDENT` / `TUTOR` / `ADMIN`, sessions signées en cookie HttpOnly (HMAC-SHA256), hash `bcryptjs`.
- Mot de passe oublié avec reset et traçabilité.

### Temps réel
- **Notifications** (profil, assignations, sessions, messages, paiements) via Supabase Realtime — badge non-lus en sidebar, canal unique par montage pour éviter les re-subscriptions en StrictMode.
- **Messagerie** multi-participants (threads, participants, notifications contextuelles).
- **Vidéo live** via LiveKit (salles par session, tokens signés côté serveur).

### Conformité
- Page `donnees-personnelles` (RGPD), headers sécurité (CSP/XFO/XCTO/Referrer-Policy), consentement utilisateur.

---

## Sika AI — Tuteur permanent (LangChain / LangGraph)

Assistant IA pédagogique disponible **24/7** depuis la section Messages de l'espace élève. Construit avec un agent **LangGraph ReAct** multimodal (OpenAI GPT-4o par défaut).

### Capacités
- Répondre aux questions techniques (maths, physique, chimie, informatique, français, …).
- Aider à faire un devoir **étape par étape** avec justification des règles utilisées.
- **Corriger des photos d'exercices / d'examens** grâce à la vision multimodale du modèle (upload direct depuis l'UI).
- Générer des **fiches de révision** structurées (définitions, théorèmes, méthodes, exemples, pièges, quiz).
- Expliquer un concept en profondeur (intuition, définition formelle, exemple, confusions fréquentes, mini quiz).

### Architecture
```
┌─────────────────────────────┐        ┌────────────────────────────┐
│  Student UI (Next.js)       │        │  Route API (Node runtime)  │
│  /student/messages/ai-tutor │──POST─▶│  /api/student/ai-tutor/... │
│  - chat + upload images     │        │  - auth role STUDENT       │
│  - compression JPEG 1600px  │        │  - persiste user msg       │
└─────────────────────────────┘        │  - invoque l'agent         │
                                       │  - persiste réponse        │
                                       └────────────┬───────────────┘
                                                    │
                                                    ▼
                                      ┌─────────────────────────────┐
                                      │  lib/ai-tutor/agent.ts      │
                                      │  createReactAgent (LangGraph)│
                                      │  ChatOpenAI (vision)        │
                                      │  4 tools (zod-typed)        │
                                      └─────────────────────────────┘
                                                    │
                                                    ▼
                                      ┌─────────────────────────────┐
                                      │  Supabase                   │
                                      │  ai_tutor_conversations     │
                                      │  ai_tutor_messages (JSONB)  │
                                      └─────────────────────────────┘
```

### Outils cognitifs de l'agent
| Outil | Usage |
| --- | --- |
| `solve_homework_step_by_step` | Résolution pas-à-pas avec stratégie + vérification |
| `correct_student_work` | Correction commentée (texte ou photo) avec note et conseils |
| `generate_revision_sheet` | Fiche de révision dense et structurée |
| `explain_concept` | Explication intuition / définition / exemple / pièges / quiz |

Les photos envoyées par l'élève sont transmises comme `image_url` (data URL base64) au modèle multimodal, qui lit l'énoncé directement sans OCR externe. La compression est faite côté client (JPEG qualité 0.85, max 1600 px) pour limiter le payload et le coût.

Voir **[docs/SIKA_AI_TUTOR.md](docs/SIKA_AI_TUTOR.md)** pour le guide complet (installation, sécurité, coûts, pistes d'évolution).

---

## Architecture technique

### Frontend
- **Next.js 15** (App Router) + **React 19** + **TypeScript strict**
- **Tailwind CSS 4** (utility-first, dark mode)
- **Framer Motion** (animations), **Swiper** (carousels), **React Hot Toast**
- **LiveKit Components** pour les sessions vidéo

### Backend
- **Supabase** (PostgreSQL) — schéma, RLS, triggers, Realtime
- **Auth custom** — sessions signées HMAC-SHA256 + cookies HttpOnly + bcryptjs
- **API Routes Next.js** (App Router, runtime Node)
- **LiveKit** — infrastructure temps réel audio/vidéo

### IA
- **@langchain/langgraph** — `createReactAgent` (pattern ReAct)
- **@langchain/openai** — `ChatOpenAI` multimodal (GPT-4o / GPT-4o-mini)
- **@langchain/core** + **zod** — outils typés

### Qualité
- TypeScript strict + `moduleResolution: bundler`
- ESLint (plugin sécurité) + Prettier
- Headers sécurité dans `next.config.js`
- Row-Level Security côté base

---

## Structure du projet

```
app/
  (site)/                     Pages publiques (home, privacy, auth)
  api/
    auth/                     Login, logout, me, signup, forgot-password
    student/                  Routes espace élève
      ai-tutor/conversations/ Sika AI (GET/POST list, GET/POST/PATCH/DELETE item)
      messages/               Messagerie humain-humain
      ...
    tutor/                    Routes espace tuteur
    admin/                    Routes admin (users, sessions, assignments)
    livekit/token/            Génération de token vidéo
  student/
    dashboard|calendar|history|profile|tutors|notifications
    messages/
      page.tsx                Liste threads + carte Sika AI épinglée
      [threadId]/             Thread humain-humain
      ai-tutor/               Chat Sika AI
        page.tsx              Liste des discussions IA
        [conversationId]/     Interface de chat (texte + images)
  tutor/                      Espace tuteur + admin
  class|live/                 Salles de cours LiveKit

lib/
  ai-tutor/                   Agent LangGraph (prompts, tools, agent)
  auth-simple.ts              Auth custom (HMAC + bcryptjs)
  supabase.ts                 Clients Supabase (browser + admin)
  livekit*.ts                 Helpers LiveKit (token, egress, access)
  constants.ts                Rôles, routes, endpoints, messages
  ...

components/                   UI (Hero, Header, Pricing, Booking, Auth, ...)
hooks/                        useAuth, useUnreadNotifications, ...
supabase/                     Voir supabase/README.md
  migrations/                Schéma (`db reset` local / `db push` cloud)
  seed.sql                   Données de test (`db reset` uniquement en local)
docs/
  SIKA_AI_TUTOR.md            Documentation Sika AI
  LIVEKIT_SETUP.md            Setup LiveKit
  SUPABASE_SETUP.md           Renvoi README (Supabase / migrations)
```

---

## Démarrage

### Prérequis
- Node.js 18+
- Compte **Supabase** (projet + clés)
- Compte **LiveKit** (pour les sessions vidéo)
- Clé **OpenAI** (pour Sika AI — optionnel, l'app fonctionne sans mais l'agent IA sera désactivé)
- **Docker** (optionnel, pour tester les e-mails en local avec Mailpit)

### Installation

```bash
git clone https://github.com/LordVERTON/SIKASCHOOL-website.git
cd SIKASCHOOL-website
npm install --legacy-peer-deps
cp .env.example .env.local   # puis renseigner JWT_SECRET et les clés Supabase (voir ci-dessous)
```

### Workflow Supabase local (Docker)

Prérequis : **Docker** installé et démarré.

```bash
npm install --legacy-peer-deps
cp .env.example .env.local
npx supabase start
npx supabase db reset
npm run dev
```

Après `supabase start`, copier dans `.env.local` l’URL et les clés **`anon`** / **`service_role`** affichées par `npx supabase status` (elles remplacent les placeholders de `.env.example` pour le mode local). Définir aussi un **`JWT_SECRET`** suffisamment long pour signer les cookies de session.

- **`npx supabase start`** lance la stack Supabase locale (Postgres, Studio, Auth, etc.) dans Docker.
- **`npx supabase db reset`** recrée la base locale, applique tout ce qui est dans **`supabase/migrations/`**, puis exécute **`supabase/seed.sql`** (données de test uniquement — aucune création de table dans ce fichier).
- **`supabase/migrations/`** contient la **structure** versionnée (schéma actuel : une migration initiale `20260101120000_initial_schema.sql` ; les évolutions futures seront de nouveaux fichiers `YYYYMMDDHHMMSS_*.sql`).
- Pour repartir d’une base locale propre : relancer **`npx supabase db reset`** (données locales effacées).

#### Optionnel — appliquer le schéma sur un projet Supabase Cloud

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

En **production**, ne pas charger `seed.sql` sur le Cloud : uniquement **`db push`** (schéma). Les données viennent des utilisateurs réels et des flux métier.

> **Historique Cloud désynchronisé** (vieux `schema_migrations` vs fichiers actuels du dépôt) : voir [Nommage des migrations / réparation historique](#nommage-des-fichiers-de-migration-et-historique-cloud) et **`supabase/README.md`**.

### Configuration Supabase (résumé)

Pour créer ou reproduire la base sur **un nouveau projet Supabase** (nouveau collaborateur, environnement de staging, etc.), suivre la section **[Base de données et nouveau collaborateur](#base-de-données-et-nouveau-collaborateur)** : les fichiers dans **`supabase/migrations/`** sont la référence à jour ; **`supabase db push`** applique le schéma sur le projet lié.

Un court renvoi est conservé dans **[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)** ; le flux à suivre reste celui du README ci-dessus (migrations + CLI).

### Configuration LiveKit

Voir [docs/LIVEKIT_SETUP.md](docs/LIVEKIT_SETUP.md).

### Configuration Sika AI

Ajouter dans `.env.local` :
```env
OPENAI_API_KEY=sk-...
SIKA_AI_MODEL=gpt-4o-mini  # optionnel, défaut gpt-4o-mini
```

### Configuration e-mails (Resend ou Mailpit)

Le projet supporte maintenant deux modes d'envoi:
- **`MAIL_PROVIDER=resend`** (prod/recommandé)
- **`MAIL_PROVIDER=smtp`** (local/dev, idéal avec Mailpit)

Exemple `.env.local` pour Mailpit :
```env
MAIL_PROVIDER=smtp
MAIL_FROM_EMAIL="SikaSchool <noreply@localhost>"
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
```

`npm run dev` démarre automatiquement Mailpit (Docker) puis Next.js.

Si tu veux lancer Mailpit manuellement :
```bash
docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Puis ouvrir l'interface Mailpit : [http://localhost:8025](http://localhost:8025)

> En mode SMTP local, toutes les notifications e-mail de l'app (inscription, reset password, assignation, annulation, etc.) sont capturées dans Mailpit sans envoi réel vers Internet.

### Lancer

```bash
npm run dev        # démarre Mailpit + Next.js (http://localhost:3000)
npm run dev:mailpit:stop
npm run build
npm run start
```

---

## Base de données et nouveau collaborateur

Objectif : tout développeur peut partir d’un **nouveau projet PostgreSQL** (en pratique **Supabase**) et obtenir **le même schéma** que celui versionné dans le dépôt, sans dépendre d’un dump manuel non suivi.

### Principe

- Le schéma de référence est dans **`supabase/migrations/`** (fichiers `YYYYMMDDHHMMSS_description.sql`). Actuellement une migration initiale unique **`20260101120000_initial_schema.sql`** regroupe tables Stripe, messagerie (RLS + Realtime), Sika AI, etc.
- La commande **`npx supabase db push`** applique, sur le projet **lié**, toutes les migrations pas encore enregistrées côté Supabase.
- Éviter de créer des tables **uniquement** depuis le dashboard sans fichier de migration (sinon décalage prod ↔ Git).

### Nouveau projet Supabase (recommandé pour un collaborateur)

1. **Créer un projet** sur [supabase.com/dashboard](https://supabase.com/dashboard) (plan gratuit possible pour le dev).

2. **Récupérer les clés** : *Project Settings → API*  
   - `NEXT_PUBLIC_SUPABASE_URL`  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, uniquement serveur / CI)

3. **Les mettre dans `.env.local`** (voir aussi [Variables d'environnement](#variables-denvironnement)).

4. **Installer la CLI** (une fois) et **se connecter** :
   ```bash
   npx supabase login
   ```

5. **Lier ce dépôt au projet** (remplacer `<project-ref>` par l’identifiant dans l’URL du dashboard : `…/project/<project-ref>`) :
   ```bash
   npx supabase link --project-ref <project-ref> --yes
   ```
   Si la CLI signale une différence de **version Postgres**, aligner **`supabase/config.toml`** (`[db] major_version = …`) avec la version du projet (indiquée dans le message ou dans les paramètres du projet).

6. **Appliquer toutes les migrations** :
   ```bash
   npx supabase db push --yes
   ```

7. **Realtime** (pour badges notifications, calendrier, messagerie si vous utilisez `postgres_changes`) : dans le dashboard, **Database → Replication** (ou équivalent), activer les tables concernées (`notifications`, `sessions`, `messages`, `message_threads`, etc.) selon vos besoins.

8. **Données de démo** : en **local**, `npx supabase db reset` exécute `supabase/seed.sql` après les migrations. En **production** (Cloud), ne pas charger le seed automatiquement ; n’utiliser que les migrations + données métier réelles.

### Rattraper un schéma déjà modifié dans le dashboard

Si quelqu’un a changé la base **sans** fichier de migration :

```bash
npx supabase db pull nom_migration_descriptive
```

Relire le fichier généré sous `supabase/migrations/`, l’ajuster si besoin, committer, puis **`db push`** sur les autres environnements si une migration unique doit aussi s’appliquer ailleurs.

### Alternative locale (Docker)

Pour une stack Postgres **locale** identique à Supabase (Studio local, Auth, etc.) :

```bash
npx supabase start
npx supabase db reset   # applique migrations + seed.sql si configuré
```

Voir la [documentation officielle Supabase CLI](https://supabase.com/docs/guides/cli). Les URLs et clés locales diffèrent du cloud ; adapter `.env.local` en conséquence.

### Nommage des fichiers de migration et historique Cloud

#### Convention obligatoire (CLI Supabase)

Chaque fichier sous `supabase/migrations/` doit commencer par un **horodatage** reconnu par la CLI, au format **`YYYYMMDDHHMMSS`** (souvent **14 chiffres**), puis **`_`** et un nom descriptif :  
`20260101120000_initial_schema.sql`.

- Un fichier du type **`0001_initial_schema.sql`** ou **`initial_schema.sql`** sans préfixe date/heure est **hors convention** : il peut être **ignoré**, mal ordonné ou refusé selon la version de la CLI. Le dépôt utilise donc **`20260101120000_initial_schema.sql`** comme équivalent logique d’une « migration initiale » unique — le nombre `20260101120000` est un **timestamp figé** pour l’ordre d’application, pas la date de création réelle du projet.

- Les anciens noms du style `2026-04-20-001_*.sql` sans timestamp compact **14 chiffres** posent le même problème : à renommer si vous réintroduisez des fichiers dans ce format.

Documentation officielle : [Supabase CLI — migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations).

#### Historique Cloud désynchronisé (après fusion / renommage des migrations)

Si le projet distant enregistre encore des versions dans **`supabase_migrations.schema_migrations`** qui **ne correspondent plus** aux fichiers présents dans le dépôt (ex. anciennes migrations supprimées après fusion en un seul fichier), la CLI peut refuser `db pull`, `db push` ou afficher un décalage Local / Remote.

**Option recommandée pour un environnement de dev / staging** : créer un **nouveau projet Supabase vide**, `link`, puis `npx supabase db push` (schéma aligné sans ambiguïté).

**Option « même projet » (à faire avec prudence)** — sauvegarder la base avant toute manipulation :

1. Afficher l’état :  
   `npx supabase migration list --linked`
2. Pour chaque **version présente sur Remote** qui **n’a plus de fichier homologue** dans `supabase/migrations/`, retirer la ligne d’historique côté distant **sans exécuter de SQL** :  
   `npx supabase migration repair <version> --status reverted --linked --yes`  
   (`reverted` **supprime** l’entrée dans la table d’historique ; cela **ne annule pas** le schéma déjà appliqué.)
3. Ensuite, soit :
   - **`npx supabase db push --yes`** pour appliquer la migration locale encore non listée (ici `20260101120000`) — le SQL est majoritairement **idempotent** (`IF NOT EXISTS`, etc.), soit  
   - si vous êtes certain que le schéma distant **correspond déjà** au fichier fusionné :  
     `npx supabase migration repair 20260101120000 --status applied --linked --yes`  
     pour **enregistrer** la migration comme appliquée sans la rejouer.

Référence : [`supabase migration repair`](https://supabase.com/docs/reference/cli/supabase-migration-repair).

Le détail pas à pas et les cas limites sont aussi décrits dans **`supabase/README.md`**.

---

## Variables d'environnement

```env
# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# --- Auth / sessions ---
JWT_SECRET=your_hmac_secret          # obligatoire (signature cookie session)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=fallback_for_jwt     # fallback si JWT_SECRET absent

# --- LiveKit ---
NEXT_PUBLIC_LIVEKIT_SERVER_URL=wss://...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

# --- Sika AI (LangChain / LangGraph) ---
OPENAI_API_KEY=sk-...
SIKA_AI_MODEL=gpt-4o-mini            # optionnel

# --- Divers ---
NODE_ENV=development

# --- Email provider ---
# Choix: resend | smtp (Mailpit/local)
MAIL_PROVIDER=resend
# Expéditeur par défaut (fallback sur RESEND_FROM_EMAIL si absent)
MAIL_FROM_EMAIL="SikaSchool <noreply@sikaschool.app>"

# --- SMTP (Mailpit/local) ---
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
# SMTP_USER=
# SMTP_PASS=

# --- Resend (prod) ---
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="SikaSchool <noreply@sikaschool.app>"
```

> Sans `OPENAI_API_KEY`, les routes `/api/student/ai-tutor/*` renvoient une réponse de repli propre (`"le tuteur IA est momentanément indisponible"`) sans casser la conversation ni l'UI.

---

## Routes API

### Authentification
- `POST /api/auth/login` — connexion
- `POST /api/auth/logout` — déconnexion
- `GET  /api/auth/me` — session courante
- `POST /api/auth/signup` — inscription
- `POST /api/auth/forgot-password` — demande de reset

### Leads
- `POST /api/leads` — capture lead + création auto du compte élève (+ notifications admin)

### Espace élève
- `GET  /api/student/dashboard`
- `GET|PATCH /api/student/profile`
- `GET  /api/student/tutors`, `GET /api/student/assigned-tutors`
- `GET  /api/student/calendar`
- `GET|PATCH /api/student/notifications`
- `GET  /api/student/sessions`
- `GET  /api/student/messages`, `POST /api/student/messages`
- `GET|POST|PATCH|DELETE /api/student/messages/[threadId]`
- **Sika AI** :
  - `GET  /api/student/ai-tutor/conversations` — liste des discussions IA
  - `POST /api/student/ai-tutor/conversations` — créer une discussion
  - `GET  /api/student/ai-tutor/conversations/[id]` — récupérer messages
  - `POST /api/student/ai-tutor/conversations/[id]` — envoyer un message (texte + jusqu'à 6 images) et recevoir la réponse de l'agent
  - `PATCH /api/student/ai-tutor/conversations/[id]` — renommer / mettre à jour matière/niveau
  - `DELETE /api/student/ai-tutor/conversations/[id]` — supprimer

### Espace tuteur
- `GET  /api/tutor/dashboard`, `/students`, `/sessions`
- `GET|PATCH /api/tutor/notifications`
- `GET  /api/tutor/messages`, `POST /api/tutor/messages/[threadId]`
- `GET  /api/tutor/payments/*`

### Admin
- `GET|POST /api/admin/users`, `PUT|DELETE /api/admin/users/[userId]`
- `POST /api/admin/users/[userId]/reset-password`, `/toggle-status`
- `GET|POST /api/admin/sessions`, `PUT|DELETE /api/admin/sessions/[sessionId]`
- `GET /api/admin/assignments`, `POST /assign`, `DELETE /unassign`
- `POST /api/admin/sync-profiles`

### LiveKit
- `POST /api/livekit/token`

### Public
- `GET /api/faqs`, `/testimonials`, `/subjects`

---

## Schéma base de données

Tables principales (DDL : `supabase/migrations/20260101120000_initial_schema.sql`) :

| Table | Rôle |
| --- | --- |
| `users` | Comptes (auth, rôle STUDENT/TUTOR/ADMIN, is_active) |
| `students` | Profil élève + intake JSON |
| `tutors` | Profil tuteur (bio, matières, tarifs, commission) |
| `sessions` | Sessions de cours (statut, durée, type, notes) |
| `assignments` | Devoirs / cours (legacy LMS) |
| `tutor_student_assignments` | Attributions admin tuteur ↔ élève |
| `payments`, `student_credits`, `subscriptions`, `student_credit_ledger` | Stripe / crédits séances |
| `notifications` | Notifications temps réel (type, data JSONB, is_read) |
| `message_threads` | Fils de messagerie humain-humain |
| `message_thread_participants` | Participants d'un thread (N:N) |
| `messages` | Messages humain-humain |
| `session_payments` | Paiements et commissions |
| **`ai_tutor_conversations`** | **Discussions élève ↔ Sika AI** (titre, matière, niveau) |
| **`ai_tutor_messages`** | **Messages Sika AI** (role, contenu, images JSONB, metadata JSONB) |

Les tables Sika AI disposent d'un trigger `AFTER INSERT` qui met automatiquement à jour `updated_at` de la conversation à chaque nouveau message, ce qui simplifie le tri côté API.

---

## Qualité & sécurité

- ✅ TypeScript strict, `moduleResolution: bundler` (nécessaire pour les subpath exports des packages modernes type LangGraph)
- ✅ ESLint + `eslint-plugin-security`
- ✅ Hash de mot de passe **bcryptjs**
- ✅ Sessions signées **HMAC-SHA256** (cookie HttpOnly, SameSite)
- ✅ Validation d'input (zod côté outils IA, validation manuelle côté API)
- ✅ Headers sécurité (CSP, XFO, XCTO, Referrer-Policy)
- ✅ Toutes les routes `/api/student/ai-tutor/*` vérifient `getUserSession()` + rôle `STUDENT` + scope `user_id`
- ✅ Images IA compressées côté client (max 1600 px, JPEG 0.85) et limitées à 6 par message
- ✅ `recursionLimit: 12` sur l'agent LangGraph pour éviter les boucles d'outils infinies
- ✅ Fallback propre si `OPENAI_API_KEY` absente ou si l'agent échoue
- ✅ RLS et séparation client anon / service_role côté Supabase

---

## Roadmap

### ✅ Implémenté
- Authentification, rôles, sessions sécurisées
- Portails élève / tuteur / admin
- Messagerie humain-humain (threads, participants, notifications)
- Notifications temps réel (Supabase Realtime)
- LiveKit — salles de cours, tokens signés
- **Sika AI — tuteur IA permanent** (LangGraph agent, vision, fiches de révision, correction de photos)
- Capture de leads avec création auto de compte
- RGPD / Privacy policy

### 🔄 En cours
- UI LiveKit avancée (partage d'écran, tableau blanc, enregistrement)

### 📋 À venir (priorisé)
1. **Paiement Stripe** — packs mensuels, factures, wallet de crédits, remboursements
2. **Booking avancé** — timezones, récurrence, rappels, liste d'attente, reschedule
3. **Recherche & filtres tuteurs** — matière, niveau, disponibilité, notes/avis
4. **Contenu pédagogique** — dépôt de devoirs, corrections, suivi de progression, parcours
5. **Sika AI — évolutions** :
   - Streaming des réponses (Server-Sent Events)
   - RAG sur les cours SikaSchool via **Supabase pgvector**
   - Export PDF des fiches de révision générées
   - Quotas par élève + logs d'utilisation
6. **Observabilité** — Sentry, métriques produit, alertes
7. **i18n complet** — FR/EN
8. **App mobile** — React Native + push notifications
9. **Tests automatisés** — unitaires, intégration, e2e, pipeline CI

---

## Documentation

- [docs/SIKA_AI_TUTOR.md](docs/SIKA_AI_TUTOR.md) — **Guide Sika AI** (installation, architecture, sécurité, coûts)
- [docs/LIVEKIT_SETUP.md](docs/LIVEKIT_SETUP.md) — Setup vidéo LiveKit
- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) — Renvoi vers la section base de données du README
- [DEVELOPMENT.md](DEVELOPMENT.md) — Guide développeur
- [SECURITY.md](SECURITY.md) — Politique sécurité

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Démarre Mailpit (Docker) puis Next.js en dev |
| `npm run dev:mailpit:start` | Démarre/recrée le conteneur Mailpit |
| `npm run dev:mailpit:stop` | Arrête et supprime le conteneur Mailpit |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run lint` | ESLint (règles sécurité incluses) |
| `npm run lint:fix` | Auto-fix ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm run security:audit` | `npm audit` |
| `npm run security:check` | Exécute `npm audit` via `scripts/security-check.js` |
| `npm run db:types` | Génère `lib/database.types.ts` depuis Supabase |

---

## Déploiement

- **Production** : [https://sikaschool.app](https://sikaschool.app) (Vercel recommandé)
- Configurer toutes les variables d'environnement dans l'hébergeur (**dont `OPENAI_API_KEY`** pour activer Sika AI en prod).
- Instances Supabase & LiveKit de production distinctes.
- Domaine personnalisé + certificats SSL (gérés par Vercel par défaut).

---

## License

Ce repository part du template **Solid** de Next.js Templates. Les personnalisations SikaSchool sont utilisables librement dans le cadre du projet. Voir `LICENSE` pour la licence du template de base.

## Remerciements

- Template de base : **Solid** (Next.js Templates)
- Contenu & branding : [SikaSchool](https://www.sikaschool.com/)
- Infrastructure vidéo : [LiveKit](https://livekit.io/)
- Base de données & temps réel : [Supabase](https://supabase.com/)
- Agent IA : [LangChain](https://js.langchain.com/) / [LangGraph](https://langchain-ai.github.io/langgraphjs/) & [OpenAI](https://openai.com/)
