# SikaSchool

Plateforme de cours particuliers (**Next.js 16.3.4**, **React 19**, **TypeScript**) : portails élève / tuteur / admin, vidéo (**LiveKit**), messagerie temps réel (**Supabase**), **Sika AI** (assistant élève via LangChain / LangGraph). Production : [sikaschool.app](https://sikaschool.app).

---

## Fonctionnalités (résumé)

| Zone            | Contenu                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **Élève**       | Dashboard, agenda, historique, profil, messagerie, notifications realtime, tuteurs assignés, chat **Sika AI** |
| **Tuteur**      | Dashboard, élèves, séances, paiements / commissions, messagerie                                               |
| **Admin**       | Utilisateurs (statut, reset MDP), séances, assignations tuteur ↔ élève                                        |
| **Acquisition** | Leads homepage → compte Supabase Auth + lien sécurisé pour définir le mot de passe                            |
| **Auth**        | Supabase Auth (`auth.users`) + sessions Auth.js HttpOnly, rôles métier dans `public.profiles`                 |
| **Temps réel**  | Mercure (notifications, messagerie, calendrier), LiveKit pour les séances vidéo                               |

---

## Stack

- **Front** : Next.js App Router, Tailwind 4, Framer Motion, LiveKit Components
- **Données** : Supabase (PostgreSQL, RLS, triggers, Realtime) ; routes API servies avec **`SUPABASE_SERVICE_ROLE_KEY`** là où il faut contourner la RLS
- **IA** : LangGraph (`createReactAgent`), OpenAI (vision pour photos de copies). Détail : [docs/architecture.md#11-sika-ai](docs/architecture.md#11-sika-ai)
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
  auth.ts          Helpers de session Auth.js
  user-management.ts  Création et sécurité des comptes Supabase Auth
  supabase.ts      Clients anon + service role
supabase/
  migrations/      Schéma versionné (voir supabase/README.md)
  seed.sql         Données de démo (local uniquement, via db reset)
docs/              Six références produit, architecture, règles, design, tâches et mémoire
```

---

## Prérequis

- Node.js 24.x (voir `.nvmrc` et `package.json`)
- **Docker** (Supabase local ou Mailpit pour les emails de dev)
- Comptes / clés selon usage : **Supabase**, **LiveKit**, **OpenAI** (optionnel pour Sika AI)

---

## Installation & dev local

```bash
git clone https://github.com/LordVERTON/SIKASCHOOL-website.git
cd SIKASCHOOL-website
npm install --legacy-peer-deps
cp .env.development.local.example .env.development.local
```

Renseigner au minimum **`AUTH_SECRET`** (ou `NEXTAUTH_SECRET`), **`NEXT_PUBLIC_SUPABASE_*`**, **`SUPABASE_SERVICE_ROLE_KEY`** (voir [configuration locale](docs/architecture.md#developpement-local)).

### Supabase en local

```bash
npm run supabase:start
npm run supabase:reset    # migrations + seed.sql
```

Le modèle `.env.development.local.example` vise Supabase local. Après copie, vérifier URL et clés contre `npm run supabase:status` ; un nouveau clone ne possède pas nécessairement le fichier local. Redémarrer **`npm run dev`** après modification des `.env`.

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
ADMIN_NEW_STUDENT_NOTIFY_EMAILS=<adresses-administration>
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
MERCURE_JWT_SECRET=<secret-local-non-production>
```

Le hub local autorise les abonnements anonymes ; les signaux contiennent des identifiants, sans contenu de messages. Le Compose autorise actuellement l'origine HTTP localhost alors que Next démarre en HTTPS : voir OPS-002 dans [tasks](docs/tasks.md). En production, utilisez un secret fort et exposez `NEXT_PUBLIC_MERCURE_URL` vers votre hub HTTPS.

Supabase local expose aussi une UI mail sur un port dedie (`supabase status`).

### Emails en prod (Resend)

En production, l'app utilise Resend par defaut. Variables attendues :

```bash
MAIL_FROM_EMAIL="SikaSchool <noreply@sikaschool.app>"
RESEND_API_KEY=...
ADMIN_NEW_STUDENT_NOTIFY_EMAILS=<adresses-administration>
```

### Lancer l’app

```bash
npm run dev          # https://localhost:3000
npm run build && npm run start   # prod locale
```

Le script `dev` utilise HTTPS avec des chemins explicites vers `certificates/localhost-key.pem` et `certificates/localhost.pem`. Fournir ces certificats locaux avant le démarrage ; leur génération automatique n'est pas assurée par ce script. Voir le [runbook local](docs/architecture.md#developpement-local).

Avec un certificat auto-signe, le navigateur peut afficher un avertissement de securite au premier acces. C'est normal en developpement local.

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

Chercher l'adresse IPv4 de la carte **Wi-Fi**. Utiliser l'adresse actuelle de votre poste :

```text
<IPv4-Wi-Fi-du-PC>
```

Ne pas utiliser :

- `10.2.0.2` : adresse ProtonVPN ;
- `172.31.144.1` : adresse WSL / Hyper-V.

4. Sur le telephone, ouvrir dans le navigateur :

```text
https://<IPv4-Wi-Fi-du-PC>:3000
```

Si la page ne charge pas :

- verifier que le PC et le telephone sont bien sur le meme Wi-Fi ;
- accepter l'autorisation du pare-feu Windows pour Node.js / Next.js ;
- couper temporairement le VPN si le telephone n'arrive pas a joindre le PC ;
- verifier que l'adresse `Network` affichee par `npm run dev` correspond bien a la carte Wi-Fi, ici `https://<IPv4-Wi-Fi-du-PC>:3000` ;
- eviter les reseaux invites ou partages de connexion qui bloquent parfois les appareils entre eux.

---

## Variables d’environnement

Modèle complet : [configuration des variables](docs/architecture.md#developpement-local). En bref :

| Zone     | Variables typiques                                                                            |
| -------- | --------------------------------------------------------------------------------------------- |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`      |
| Session  | `AUTH_SECRET` ou `NEXTAUTH_SECRET`                                                            |
| LiveKit  | `NEXT_PUBLIC_LIVEKIT_SERVER_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`                     |
| Sika AI  | `OPENAI_API_KEY`, `SIKA_AI_MODEL` (optionnel)                                                 |
| Email    | `MAIL_PROVIDER`, `MAIL_FROM_EMAIL`, `ADMIN_NEW_STUDENT_NOTIFY_EMAILS`, Resend ou SMTP/Mailpit |

Sans `OPENAI_API_KEY`, l’UI Sika AI reste chargée mais l’API renvoie un message d’indisponibilité contrôlé.

---

## Schéma base de données

Définition : **`supabase/migrations/`** (baseline `20260101120000_initial_schema.sql` + migrations suivantes).  
Tables centrales : `auth.users`, `profiles`, `students`, `tutors`, `sessions`, `notifications`, `message_threads` / `messages`, paiements / crédits Stripe, `ai_tutor_conversations` / `ai_tutor_messages`.

---

## Scripts npm

| Commande                                   | Rôle                                             |
| ------------------------------------------ | ------------------------------------------------ |
| `npm run dev`                              | Next.js en développement                         |
| `npm run mailpit`                          | Démarre Mailpit (Docker Compose) pour SMTP local |
| `npm run mailpit:down`                     | Arrête Mailpit (Docker Compose)                  |
| `npm run mercure` / `npm run mercure:down` | Démarre / arrête le hub Mercure local            |
| `npm run lint` / `npm run type-check`      | Qualité                                          |
| `npm run supabase:types`                   | Génère les types TS depuis Supabase local        |
| `npm run security:check`                   | Audit npm via script                             |

---

## Documentation

La documentation canonique contient exactement six fichiers :

- [Produit et parcours](docs/PRD.md)
- [Architecture et installation](docs/architecture.md)
- [Règles de développement et protocole agent](docs/Rules.md)
- [Design et proposition frontend V2](docs/design.md)
- [Roadmap et tâches](docs/tasks.md)
- [Mémoire, décisions et reprise](docs/memory.md)

Lire Rules → memory → tasks avant intervention. La V2 est spécifiée et planifiée, non implémentée. Présence de code ne signifie pas recette en production ; les limites critiques sont documentées dans l'architecture.

Guides extérieurs conservés : [Supabase et migrations](supabase/README.md), [sécurité](SECURITY.md).

---

## Déploiement

Variables d’environnement à reporter sur l’hébergeur (ex. Vercel). Instances Supabase et LiveKit **production** distinctes du local. Domaine + HTTPS gérés par l’hébergeur.

---

## Licence & crédits

Template de base **Solid** (Next.js Templates) ; personnalisations SikaSchool — voir `LICENSE`. Remerciements : [SikaSchool](https://www.sikaschool.com/), [LiveKit](https://livekit.io/), [Supabase](https://supabase.com/), [LangChain](https://js.langchain.com/) / [OpenAI](https://openai.com/).
