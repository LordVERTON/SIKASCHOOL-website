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
supabase/                     Scripts SQL (schéma + migrations + seed)
  create-ai-tutor-tables.sql  Tables Sika AI
  create-message-thread-participants.sql
  schema-*.sql, add-*.sql, fix-*.sql, seed-*.sql
docs/
  SIKA_AI_TUTOR.md            Documentation Sika AI
  LIVEKIT_SETUP.md            Setup LiveKit
  SUPABASE_SETUP.md           Setup Supabase
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
cp .env.example .env.local   # ou créer manuellement (voir ci-dessous)
```

### Configuration Supabase

1. Créer un projet Supabase.
2. Exécuter dans l'éditeur SQL de Supabase (ou via la CLI) :
   - `supabase/schema-fixed.sql` (ou `schema-simple.sql`) — schéma principal
   - `supabase/create-message-thread-participants.sql` — messagerie multi-participants
   - `supabase/create-ai-tutor-tables.sql` — **tables du tuteur IA**
   - Tout autre `add-*.sql` / `fix-*.sql` pertinent selon votre état
3. Activer Realtime sur `notifications`, `messages`, `ai_tutor_messages`.

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

Tables principales (voir `supabase/` pour les scripts SQL exacts) :

| Table | Rôle |
| --- | --- |
| `users` | Comptes (auth, rôle STUDENT/TUTOR/ADMIN, is_active) |
| `students` | Profil élève + intake JSON |
| `tutors` | Profil tuteur (bio, matières, tarifs, commission) |
| `sessions` | Sessions de cours (statut, durée, type, notes) |
| `assignments` | Liens tuteur ↔ élève (actifs/historique) |
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
- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) — Setup Supabase
- [DEVELOPMENT.md](DEVELOPMENT.md) — Guide développeur
- [SECURITY.md](SECURITY.md) — Politique sécurité
- [README_student_section.md](README_student_section.md) — Portail élève en détail

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
| `npm run security:check` | Script maison `scripts/security-check.js` |
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
