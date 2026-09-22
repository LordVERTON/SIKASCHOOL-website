# Base Supabase SikaSchool

## Fichiers versionnés

| Fichier / dossier | Rôle |
|-------------------|------|
| `migrations/20260101120000_initial_schema.sql` | **Schéma complet** : enums, tables, index, FK, fonctions, triggers, RLS messagerie / FAQ / témoignages, publication Realtime (messages), tables Stripe (`payments`, `student_credits`, …), Sika AI (`ai_tutor_*`). |
| `migrations/20260912143000_move_users_to_supabase_auth.sql` | Migre les comptes historiques vers `auth.users`, transforme `public.users` en `public.profiles` et supprime les secrets d’authentification du schéma public. |
| `seed.sql` | **Données de test uniquement** (comptes démo, profils, FAQ, etc.). Aucun DDL. |
| `config.toml` | Configuration CLI locale (version Postgres, seed, …). |

## Nom du fichier de migration (`20260101120000` et pas `0001`)

La CLI Supabase identifie chaque migration par un préfixe **`YYYYMMDDHHMMSS`** (souvent **14 chiffres**). Les fichiers du type **`0001_initial_schema.sql`** ne suivent pas cette convention et peuvent être **ignorés ou mal ordonnés**.

Ici, **`20260101120000_initial_schema.sql`** est la **migration initiale unique** du dépôt : le préfixe est un **identifiant d’ordre** stable dans Git, pas nécessairement la date réelle de création du projet.

Référence : [Database migrations (CLI)](https://supabase.com/docs/guides/cli/local-development#database-migrations).

## Développeur — stack locale

```bash
npm run supabase:start
npm run supabase:reset
```

`supabase:reset` cible explicitement la base locale : il applique les migrations puis `seed.sql` (voir `[db.seed]` dans `config.toml`). Les données distantes ne sont jamais modifiées.

`.env.development.local` pointe déjà vers l'API locale (`http://127.0.0.1:54321`) et fournit les clés correspondantes ; aucune configuration Supabase manuelle n'est requise. Contrôler les services avec `npm run supabase:status`, les arrêter avec `npm run supabase:stop` et ouvrir Studio sur `http://127.0.0.1:54323`.

## Jeu de données de démonstration

`npm run supabase:reset` charge un seed déterministe et exclusivement local. Les dates des séances sont calculées par rapport à `NOW()` : les écrans conservent donc toujours des exemples passés, en cours et à venir après un reset.

Comptes principaux :

| Rôle | E-mail | Mot de passe | Particularité |
|---|---|---|---|
| Admin | `admin@sikaschool.com` | `admin123` | Administration complète |
| Tuteur | `tutor@sikaschool.com` | `tutor123` | Mathématiques, physique, statistiques |
| Tuteur | `sophie@sikaschool.com` | `tutor123` | Français, philosophie, histoire-géographie |
| Tuteur | `karim@sikaschool.com` | `tutor123` | Informatique, algorithmique, économie |
| Tuteur | `ana@sikaschool.com` | `tutor123` | Anglais, espagnol |
| Tuteur | `hugo@sikaschool.com` | `tutor123` | SVT, chimie ; marqué indisponible |
| Élève | `student@sikaschool.com` | `student123` | Terminale, historique pédagogique et financier complet |
| Élève | `camille@sikaschool.com` | `student123` | Seconde, abonnement en essai |
| Élève | `ines@sikaschool.com` | `student123` | Licence 1, parcours supérieur |
| Parent | `parent@sikaschool.com` | `parent123` | Parent de l'élève démo |
| Parent | `claire@sikaschool.com` | `parent123` | Parent de trois élèves |

Les autres comptes sont listés en tête de [`seed.sql`](./seed.sql). Le compte `inactive@sikaschool.com` est volontairement désactivé afin de tester les filtres et le refus de connexion.

Le jeu couvre notamment :

- les quatre rôles, les profils complets, les préférences et les liens parent-enfant ;
- des tuteurs multi-matières disponibles et indisponibles, avec affectations actives et inactive ;
- les niveaux `COLLEGE`, `LYCEE`, `SUPERIEUR` et les offres `NOTA`, `AVA`, `TODA` ;
- les cinq statuts de séance, les séances individuelles et multi-élèves, les notes, devoirs et bilans pédagogiques ;
- les paiements de séances et Stripe avec les statuts payé, en attente, échoué, remboursé et annulé ;
- les crédits et leur ledger équilibré, ainsi que plusieurs états d'abonnement ;
- la messagerie, les notifications, les témoignages publiés ou modérés, les FAQ et Sika AI.

Toutes les références Stripe, URLs de reçus et contenus IA du seed sont fictifs.

## Cloud (`db push`) et historique désynchronisé

### Déploiement de la migration Auth en production

La migration est conçue pour reprendre les UUID et les hashes bcrypt existants : les utilisateurs conservent donc leurs mots de passe. Elle s’arrête volontairement si un e-mail existe déjà dans `auth.users` avec un UUID différent de celui de `public.users`, car fusionner automatiquement ces comptes pourrait casser les clés étrangères.

Avant le déploiement :

1. sauvegarder la base de production ;
2. vérifier et résoudre tout doublon d’e-mail entre `public.users` et `auth.users` ;
3. définir `AUTH_SECRET` dans l’environnement Next.js de production avec une valeur longue et aléatoire ;
4. déployer le code et exécuter `npx supabase db push --linked` dans la même fenêtre de maintenance ;
5. contrôler les nombres de lignes de `auth.users` et `public.profiles`, puis tester une connexion pour chaque rôle.

Le fichier `seed.sql` reste exclusivement local et n’est pas appliqué par `db push`.

### Cas nominal — projet vide ou jamais migré avec l’ancienne arborescence

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push
```

### Cas problématique — Remote contient des versions absentes du dépôt

Après une **fusion** des migrations en un seul fichier, la table distante **`supabase_migrations.schema_migrations`** peut encore lister d’anciennes versions (`20240601000000`, `20251007110000`, …) alors que le dépôt ne contient plus que **`20260101120000_initial_schema.sql`**. La CLI signale alors un décalage entre Local et Remote.

**Recommandation** : pour du dev/staging, créer un **nouveau projet Supabase**, `link`, puis `db push`.

**Sinon, sur le projet existant** (production ou non) :

1. **Sauvegarder** la base (dashboard Supabase ou dump).
2. Contrôler :  
   `npx supabase migration list --linked`
3. Pour **chaque version affichée sur Remote** qui **n’a pas** de fichier correspondant dans `supabase/migrations/` :  
   `npx supabase migration repair <version> --status reverted --linked --yes`  
   → supprime l’entrée d’historique **sans** rollback SQL (le schéma existant reste en place).
4. Puis au choix :
   - **`npx supabase db push --yes`** — applique la migration locale `20260101120000` (DDL largement idempotent), ou  
   - **`npx supabase migration repair 20260101120000 --status applied --linked --yes`** — enregistre cette version comme déjà appliquée **sans** rejouer le fichier (uniquement si le schéma distant est déjà identique au fichier fusionné).

Référence : [`supabase migration repair`](https://supabase.com/docs/reference/cli/supabase-migration-repair).

## Workflow dev vs prod

| Environnement | Commandes typiques |
|---------------|-------------------|
| **Développement local** | `npm run supabase:start` → `npm run supabase:reset` (migrations + `seed.sql`) → Next.js charge automatiquement l’URL et les clés locales. |
| **Production** | Projet Supabase Cloud : `npx supabase link` + `npx supabase db push` — **sans** seed ; données réelles uniquement. |

## `db pull`

Nécessite **`SUPABASE_DB_PASSWORD`** (mot de passe Postgres du projet, dashboard → Database).

```powershell
$env:SUPABASE_DB_PASSWORD = "<mot_de_passe_postgres>"
npx supabase db pull nom_migration_descriptive --linked --yes
```

Sans cette variable : erreur d’authentification (`cli_login_postgres`). La commande utilise Docker (shadow DB) pour comparer le schéma issu des migrations au schéma réel du projet lié.

### Petits désaccords Local / Remote (une version)

```bash
npx supabase migration list --linked
npx supabase migration repair <version> --status applied --linked --yes
```

Utile quand une migration est dans le dépôt et la base est déjà à jour, mais la ligne d’historique distante manque.
