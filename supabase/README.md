# Base Supabase SikaSchool

## Fichiers versionnés

| Fichier / dossier | Rôle |
|-------------------|------|
| `migrations/20260101120000_initial_schema.sql` | **Schéma complet** : enums, tables, index, FK, fonctions, triggers, RLS messagerie / FAQ / témoignages, publication Realtime (messages), tables Stripe (`payments`, `student_credits`, …), Sika AI (`ai_tutor_*`). |
| `seed.sql` | **Données de test uniquement** (comptes démo, matières, FAQ, etc.). Aucun DDL. |
| `config.toml` | Configuration CLI locale (version Postgres, seed, …). |

## Nom du fichier de migration (`20260101120000` et pas `0001`)

La CLI Supabase identifie chaque migration par un préfixe **`YYYYMMDDHHMMSS`** (souvent **14 chiffres**). Les fichiers du type **`0001_initial_schema.sql`** ne suivent pas cette convention et peuvent être **ignorés ou mal ordonnés**.

Ici, **`20260101120000_initial_schema.sql`** est la **migration initiale unique** du dépôt : le préfixe est un **identifiant d’ordre** stable dans Git, pas nécessairement la date réelle de création du projet.

Référence : [Database migrations (CLI)](https://supabase.com/docs/guides/cli/local-development#database-migrations).

## Développeur — stack locale

```bash
npx supabase start
npx supabase db reset
```

`db reset` applique les migrations puis `seed.sql` (voir `[db.seed]` dans `config.toml`).

## Cloud (`db push`) et historique désynchronisé

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
| **Développement local** | `npx supabase start` → `npx supabase db reset` (migrations + `seed.sql`) → Next.js pointe vers l’URL/clés locales (`supabase status`). |
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
