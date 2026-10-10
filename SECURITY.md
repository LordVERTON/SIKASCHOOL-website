# Security Policy

L'architecture de sécurité et ses limites sont décrites dans [architecture](docs/architecture.md#securite), les exigences dans [Rules](docs/Rules.md) et les corrections dans [tasks](docs/tasks.md). État documentaire : 10 octobre 2026 ; aucun audit de production ni test d'intrusion effectué lors de cette consolidation.

## Mécanismes présents

- Supabase Auth pour l'identité, Auth.js pour la session ; contrôles de rôle/propriété dans les routes, à uniformiser.
- PostgreSQL RLS et privilèges limités ; les routes service role doivent assurer leur propre autorisation.
- Validation Zod ou manuelle selon endpoint, TypeScript strict, ErrorBoundary et helpers logger/storage.
- Webhook Stripe avec vérification de signature sur body brut. L'idempotence des crédits n'est pas garantie actuellement.
- `next.config.js` : X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy origin-when-cross-origin, X-XSS-Protection et X-DNS-Prefetch-Control ; pas de CSP/HSTS explicite. Les en-têtes déployés restent à vérifier.

## Limites prioritaires

La présence de ces mécanismes ne prouve pas une protection complète. La 2FA du login custom n'est pas imposée dans le fournisseur Credentials ; la liaison parent par e-mail, les mutations publiques lead/update-status et les écritures de crédits exigent des corrections prioritaires. Les détails et critères restent dans les références ci-dessus, sans duplication du backlog.

`npm run security:check` lance `npm audit`. Les nombres de vulnérabilités de septembre sont historiques ; aucun résultat actuel n'est revendiqué ici. Le plugin ESLint security est installé mais non activé dans la configuration actuelle. Les logs console et validations d'environnement ne garantissent pas une redaction ou couverture exhaustive.

## Reporting Security Vulnerabilities

Contact conservé du dépôt : security@sikaschool.com (délivrabilité non testée pendant cette mission). Fournir description, étapes minimales, impact potentiel et suggestion, sans données personnelles, secret ou preuve exploitable publiée dans une issue publique.

## Pratiques et entretien

Valider côté serveur, protéger rôle et propriété, utiliser HTTPS, garder les secrets hors Git/client/logs et vérifier les dépendances. Le calendrier historique recommande audit hebdomadaire, revue de dépendances mensuelle, revue de code sécurité trimestrielle et test d'intrusion annuel lorsque pertinent ; il s'agit d'une recommandation d'exploitation, pas d'activités attestées. Programmer ces contrôles avec responsables et preuves dans tasks/memory.
