# SikaSchool

Plateforme de cours particuliers (**Next.js 15**, **React 19**, **TypeScript**) : portails élève / tuteur / admin, vidéo (**LiveKit**), messagerie temps réel (**Supabase**), **Sika AI** (assistant élève via LangChain / LangGraph). Production : [sikaschool.app](https://sikaschool.app).

---

## Fonctionnalités (résumé)

| Zone | Contenu |
|------|---------|
| **Élève** | Dashboard, agenda, historique, profil, messagerie, notifications realtime, tuteurs assignés, chat **Sika AI** |
| **Tuteur** | Dashboard, élèves, séances, paiements / commissions, messagerie |
| **Admin** | Utilisateurs (statut, reset MDP), séances, assignations tuteur ↔ élève |
| **Acquisition** | Leads homepage → création compte élève + MDP initial type `prenom.nom12345` |
| **Auth** | Sessions cookie HttpOnly (HMAC), `bcrypt`, rôles `STUDENT` / `TUTOR` / `ADMIN` |
| **Temps réel** | Mercure (notifications, messagerie, calendrier), LiveKit pour les séances vidéo |

---

## Stack

- **Front** : Next.js App Router, Tailwind 4, Framer Motion, LiveKit Components  
- **Données** : Supabase (PostgreSQL, RLS, triggers, Realtime) ; routes API servies avec **`SUPABASE_SERVICE_ROLE_KEY`** là où il faut contourner la RLS  
- **IA** : LangGraph (`createReactAgent`), OpenAI (vision pour photos de copies). Détail : [docs/SIKA_AI_TUTOR.md](docs/SIKA_AI_TUTOR.md)  
- **Qualité** : ESLint (+ sécurité), Prettier, `tsc --noEmit`

---

## Arborescence utile

```
app/
  (site)/          Site public, auth
  api/             REST (auth, student, tutor, admin, livekit, …)
  student/ | tutor/   Espaces connectés
lib/
  ai-tutor/        Agent Sika AI
  auth-simple.ts   Session HMAC + login
  supabase.ts      Clients anon + service role
supabase/
  migrations/      Schéma versionné (voir supabase/README.md)
  seed.sql         Données de démo (local uniquement, via db reset)
docs/              LiveKit, Sika AI, Supabase (résumés)
```

---

## Prérequis

- Node.js 18+
- **Docker** (Supabase local ou Mailpit pour les emails de dev)
- Comptes / clés selon usage : **Supabase**, **LiveKit**, **OpenAI** (optionnel pour Sika AI)

---

## Installation & dev local

```bash
git clone https://github.com/LordVERTON/SIKASCHOOL-website.git
cd SIKASCHOOL-website
npm install --legacy-peer-deps
cp .env.example .env.local
```

Renseigner au minimum **`JWT_SECRET`**, **`NEXT_PUBLIC_SUPABASE_*`**, **`SUPABASE_SERVICE_ROLE_KEY`** (voir `.env.example`).

### Supabase en local

```bash
npx supabase start
npx supabase db reset    # migrations + seed.sql
```

Copier dans `.env.local` l’URL et les clés affichées par **`npx supabase status`** (URL du type `http://127.0.0.1:54321`). Redémarrer **`npm run dev`** après modification des `.env`.

Détails migrations, `db push` cloud, dépannage : **[supabase/README.md](supabase/README.md)**.

### Emails en dev (Mailpit)

Le projet **ne** lance **pas** Mailpit avec `npm run dev`. À part :

```bash
npm run mailpit
npm run mailpit:down
```

Par defaut en developpement, l'app utilise SMTP/Mailpit (`127.0.0.1:1025`) meme si une cle Resend existe. Configurez au besoin :

```bash
MAIL_PROVIDER=smtp
MAIL_FROM_EMAIL="SikaSchool <noreply@sikaschool.app>"
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
ADMIN_NEW_STUDENT_NOTIFY_EMAILS=sikaschoolservice@gmail.com,mbouza.ruudy@gmail.com,dan.verton@pm.me
```

### Temps reel en dev (Mercure)

Le projet publie des evenements Mercure apres les changements de messages, notifications et seances. En local :

```bash
npm run mercure
```

Variables a ajouter dans `.env.local` :

```bash
NEXT_PUBLIC_MERCURE_URL=http://localhost:3001/.well-known/mercure
MERCURE_URL=http://localhost:3001/.well-known/mercure
MERCURE_JWT_SECRET=dev-mercure-secret
```

Le hub local est configure en abonnements anonymes et les payloads ne contiennent que des signaux de rafraichissement. En production, utilisez un secret fort et exposez `NEXT_PUBLIC_MERCURE_URL` vers votre hub HTTPS.

Supabase local expose aussi une UI mail sur un port dedie (`supabase status`).

### Emails en prod (Resend)

En production, l'app utilise Resend par defaut. Variables attendues :

```bash
MAIL_FROM_EMAIL="SikaSchool <noreply@sikaschool.app>"
RESEND_API_KEY=...
ADMIN_NEW_STUDENT_NOTIFY_EMAILS=sikaschoolservice@gmail.com,mbouza.ruudy@gmail.com,dan.verton@pm.me
```

### Lancer l’app

```bash
npm run dev          # http://localhost:3000
npm run build && npm run start   # prod locale
```

### Ouvrir le localhost sur un telephone mobile

Le telephone ne peut pas ouvrir `localhost`, car `localhost` pointe vers le telephone lui-meme. Il faut utiliser l'adresse IP locale du PC.

1. Connecter le PC et le telephone au meme reseau Wi-Fi.
2. Lancer Next.js en mode accessible sur le reseau :

```bash
npm run dev -- -H 0.0.0.0
```

3. Recuperer l'adresse IP locale du PC :

```powershell
ipconfig
```

Chercher l'adresse IPv4 de la carte **Wi-Fi**. Sur ce poste, l'adresse a utiliser est :

```text
172.20.10.3
```

Ne pas utiliser :

- `10.2.0.2` : adresse ProtonVPN ;
- `172.31.144.1` : adresse WSL / Hyper-V.

4. Sur le telephone, ouvrir dans le navigateur :

```text
http://172.20.10.3:3000
```

Si la page ne charge pas :

- verifier que le PC et le telephone sont bien sur le meme Wi-Fi ;
- accepter l'autorisation du pare-feu Windows pour Node.js / Next.js ;
- couper temporairement le VPN si le telephone n'arrive pas a joindre le PC ;
- verifier que l'adresse `Network` affichee par `npm run dev` correspond bien a la carte Wi-Fi, ici `http://172.20.10.3:3000` ;
- eviter les reseaux invites ou partages de connexion qui bloquent parfois les appareils entre eux.

---

## Variables d’environnement

Modèle complet : **`.env.example`**. En bref :

| Zone | Variables typiques |
|------|-------------------|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Session | `JWT_SECRET` (obligatoire) |
| LiveKit | `NEXT_PUBLIC_LIVEKIT_SERVER_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` |
| Sika AI | `OPENAI_API_KEY`, `SIKA_AI_MODEL` (optionnel) |
| Email | `MAIL_PROVIDER`, `MAIL_FROM_EMAIL`, `ADMIN_NEW_STUDENT_NOTIFY_EMAILS`, Resend ou SMTP/Mailpit |

Sans `OPENAI_API_KEY`, l’UI Sika AI reste chargée mais l’API renvoie un message d’indisponibilité contrôlé.

---

## Schéma base de données

Définition : **`supabase/migrations/`** (baseline `20260101120000_initial_schema.sql` + migrations suivantes).  
Tables centrales : `users`, `students`, `tutors`, `sessions`, `notifications`, `message_threads` / `messages`, paiements / crédits Stripe, `ai_tutor_conversations` / `ai_tutor_messages`.

---

## Scripts npm

| Commande | Rôle |
|----------|------|
| `npm run dev` | Next.js en développement |
| `npm run mailpit` | Démarre Mailpit (Docker Compose) pour SMTP local |
| `npm run mailpit:down` | Arrête Mailpit (Docker Compose) |
| `npm run mercure` / `npm run mercure:down` | Démarre / arrête le hub Mercure local |
| `npm run lint` / `npm run type-check` | Qualité |
| `npm run db:types` | Génère les types TS depuis Supabase local |
| `npm run security:check` | Audit npm via script |

---

## Documentation

- [docs/SIKA_AI_TUTOR.md](docs/SIKA_AI_TUTOR.md) — Sika AI  
- [docs/LIVEKIT_SETUP.md](docs/LIVEKIT_SETUP.md) — LiveKit  
- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) — Pointeur Supabase  
- [supabase/README.md](supabase/README.md) — Migrations, `db reset`, cloud  
- [SECURITY.md](SECURITY.md)

---

## Déploiement

Variables d’environnement à reporter sur l’hébergeur (ex. Vercel). Instances Supabase et LiveKit **production** distinctes du local. Domaine + HTTPS gérés par l’hébergeur.

---

## Licence & crédits

Template de base **Solid** (Next.js Templates) ; personnalisations SikaSchool — voir `LICENSE`. Remerciements : [SikaSchool](https://www.sikaschool.com/), [LiveKit](https://livekit.io/), [Supabase](https://supabase.com/), [LangChain](https://js.langchain.com/) / [OpenAI](https://openai.com/).
