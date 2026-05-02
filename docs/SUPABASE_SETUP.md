# Supabase

Procédure à jour : **[README.md](../README.md#base-de-données-et-nouveau-collaborateur)** (section *Base de données et nouveau collaborateur*).

- Schéma versionné : `supabase/migrations/`
- Variables d’environnement : `.env.example` et section *Démarrage* du README.

Les anciens guides « copier-coller tout `schema.sql` dans le dashboard » ne reflètent plus le flux recommandé ; privilégier la CLI (`npx supabase link`, `npx supabase db push`).

Pour **`npx supabase db pull`** : définir **`SUPABASE_DB_PASSWORD`** (mot de passe Postgres du projet, cf. dashboard → Database). Détail et `migration repair` : voir [`supabase/README.md`](../supabase/README.md).
