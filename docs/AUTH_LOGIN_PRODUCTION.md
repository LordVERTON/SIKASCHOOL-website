# Connexion en production : faux « Compte désactivé »

## Diagnostic du 9 novembre 2026

Contrôles en lecture seule sur le projet cloud lié `ozgfoygyhvhhemneiiny` :

- La lecture de `public.profiles` par la Data API renvoie `PGRST205` : table absente du cache de schéma.
- `public.users` est toujours accessible et contient 44 profils historiques.
- Le compte signalé existe dans Auth, avec e-mail confirmé et sans bannissement. Son profil historique est actif, de rôle TUTOR, avec le même UUID.
- Les 18 comptes Auth ont été comparés aux profils historiques : 17 correspondances e-mail/UUID et aucune collision d'e-mail avec des UUID différents.

Le code déployé attend le schéma après migration Auth, mais l'API distante expose encore le schéma historique. La route ignorait l'erreur SQL et assimilait l'absence de résultat à une désactivation. Réinitialiser le mot de passe Auth ne corrige pas ce décalage.

Le correctif de la route distingue désormais une erreur de lecture (503), un profil absent/incomplet (403) et une désactivation explicite (403). Ces trois cas refusent toujours la création de session.

## Remise en cohérence de la production

La migration nécessaire existe déjà : [`20260912143000_move_users_to_supabase_auth.sql`](../supabase/migrations/20260912143000_move_users_to_supabase_auth.sql). Elle reprend les UUID, conserve les profils et leurs rôles, importe les comptes historiques dans Auth, renomme `public.users` en `public.profiles` et installe les triggers de synchronisation. Un mot de passe déjà présent dans Auth est conservé, y compris après réinitialisation.

Utiliser un accès propriétaire/administrateur au projet, sauvegarder la base, puis vérifier l'historique distant et les migrations en attente avant toute application :

```powershell
npx supabase migration list --linked
npx supabase db push --linked --dry-run
```

Si la migration Auth est bien en attente et les prérequis présents, appliquer les migrations examinées dans la même fenêtre de maintenance que le déploiement du code :

```powershell
npx supabase db push --linked
```

Ne pas simplement marquer la migration comme appliquée, créer un profil isolé ou réactiver tous les comptes : cela ne mettrait pas le schéma en cohérence. En cas d'historique désynchronisé, suivre la procédure de [supabase/README.md](../supabase/README.md) après comparaison du schéma réel.

La première session CLI utilisée pendant le diagnostic avait reçu HTTP 403 de la Management API. Une nouvelle connexion CLI a ensuite permis les contrôles SQL et l'intervention décrite ci-dessous.

## Intervention effectuée en production le 9 novembre 2026

Le contrôle SQL a confirmé l'absence de `public.profiles`, 44 comptes historiques, 18 comptes Auth, aucune collision d'e-mail/UUID et aucun doublon de `students.user_id` ou `tutors.user_id`. L'historique distant s'arrêtait à `20260605123000`.

Avant intervention, deux sauvegardes PostgreSQL ont été réalisées avec `pg_dump` via la CLI, pour les schémas `public`, `auth` et `supabase_migrations` :

- `artifacts/auth-production-20261109/schema-before.sql` : schéma, 96 200 octets ;
- `artifacts/auth-production-20261109/data-before.sql` : données, 802 836 octets.

Ces fichiers contiennent des données privées, restent locaux et sont exclus de Git par la règle `/artifacts/`. Aucun exercice de restauration complet n'a été réalisé pendant cette intervention.

Trois migrations ont été appliquées avec succès :

1. `20260605124500_add_parent_link_to_students` : prérequis du lien parent-élève. L'ancienne table `parent_student_links` était absente, donc aucune ligne de liens n'a été supprimée.
2. `20260912143000_move_users_to_supabase_auth` : migration des comptes et profils. Avant application, l'import des mots de passe a été adapté pour accepter uniquement les empreintes bcrypt valides. Cinq comptes historiques contenaient des valeurs de remplacement : ils ont été importés sans mot de passe utilisable et nécessitent une réinitialisation. Aucun mot de passe existant dans Auth n'a été remplacé.
3. `20261109172829_restrict_auth_profile_trigger_execution` : révocation d'EXECUTE pour PUBLIC, anon et authenticated sur les deux fonctions internes de synchronisation, après leur signalement par les advisors.

Le déploiement a utilisé un répertoire de migrations ciblé sous `artifacts/auth-production-20261109/deploy`, avec les migrations déjà appliquées et celles explicitement retenues, puis `db push --project-ref ozgfoygyhvhhemneiiny --skip-vault`. Les quatre migrations d'avis publics et d'accents restent en attente. Un futur déploiement doit examiner cet historique partiel avant de recourir à `--include-all` ; ne pas marquer ces migrations comme appliquées sans les exécuter.

Résultats vérifiés :

- 45 comptes Auth, 45 profils, aucun compte Auth sans profil ;
- les 18 mots de passe Auth d'origine sont strictement conservés, par comparaison de leurs empreintes avec la sauvegarde ;
- le compte signalé conserve son UUID, son rôle TUTOR, son statut actif et son e-mail confirmé, sans bannissement ;
- la création d'un compte Auth produit automatiquement un profil STUDENT actif ;
- appels réels à `/api/auth/login` puis `/api/auth/session` sur le site public réussis pour STUDENT, TUTOR, PARENT et ADMIN, avec cookie de session et rôle attendu ;
- un profil désactivé reçoit HTTP 403 sans cookie de session ;
- le compte temporaire de contrôle et son profil ont été supprimés ; aucun e-mail n'a été envoyé pour ces tests ;
- les advisors ne signalent plus les droits d'exécution des fonctions de synchronisation. Restent deux avertissements de configuration Auth préexistants : protection contre les mots de passe compromis et options MFA ; ces réglages n'ont pas été modifiés ;
- huit tests automatisés de la route, vérification TypeScript et ESLint ciblé réussis.

Les tests réels ont porté sur les requêtes HTTP et les sessions ; aucun parcours de formulaire dans un navigateur n'a été automatisé. Aucun mot de passe personnel n'a été demandé ou changé. L'application Vercel existante (`65896098b1ce882bc4dbab6423cab879c2cef3cd`) est compatible avec le schéma corrigé et n'a pas été redéployée. Le correctif de message d'erreur dans la route reste une modification locale à publier lors du prochain déploiement applicatif.

## Vérification après migration

Dans le SQL Editor, vérifier le compte concerné (remplacer l'adresse) :

```sql
select au.id, au.email, au.banned_until, p.role, p.is_active
from auth.users au
left join public.profiles p on p.id = au.id
where lower(au.email) = lower('adresse-du-compte@example.com');

select count(*) as auth_accounts_without_profile
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null;
```

Vérifier que la Data API lit `public.profiles`, tester une connexion réelle et la redirection pour chaque rôle, puis confirmer qu'un compte désactivé reste bloqué. Le test automatisé de la route s'exécute avec `node --test scripts/auth-login.test.mjs` ; il ne remplace pas une connexion réelle en production.
