# Audit technique — SikaSchool

_Périmètre : dépôt local au 12 septembre 2026, lecture du code et exécution de `type-check`, `lint`, `security:check`. Aucune migration ni modification applicative effectuée._

## Rôle de ce document

Ce document est la **source de vérité des constats d'implémentation** : sécurité, données, API, architecture, qualité et exploitation. Il ne redéfinit ni la hiérarchie de page, ni les règles de contenu ou de design : celles-ci sont dans [UX_UI_AUDIT.md](UX_UI_AUDIT.md). Les cartes d'états et d'acteurs sont dans [WORKFLOWS.md](WORKFLOWS.md), les choix de patterns dans [DESIGN_PATTERNS.md](DESIGN_PATTERNS.md) et l'ordre d'exécution dans [ROADMAP.md](ROADMAP.md).

## Vue d'ensemble

L'application est un monolithe Next.js 15 App Router : site public dans `app/(site)`, espaces élève/famille/tuteur, 50+ routes API, Supabase/PostgreSQL, Stripe, LiveKit, Mercure et un agent IA. La richesse fonctionnelle est réelle, mais la couche API contient à la fois autorisation, requêtes Supabase, mapping, règles métier et effets secondaires. Les contrôles sont souvent présents, mais ils ne sont ni uniformes ni testés automatiquement.

**Contrôles exécutés :** `npm run type-check` réussit sans sortie ; `npm run lint` réussit sans warning ; `npm run security:check` échoue car `npm audit` signale **15 vulnérabilités (1 critique, 8 élevées, 6 modérées)**, notamment Next.js 15.5.3 et Nodemailer. Aucun test, runner de tests, Playwright/Vitest/Jest ni pipeline `.github` n'a été trouvé.

## [TECH-001] Corriger la prise de contrôle de compte dans le lead public

**Catégories :** [SECURITY] [WORKFLOW] [CODE]  
**Priorité :** P0  
**Impact :** Confidentialité / intégrité des comptes

**État actuel (corrigé en septembre 2026) :** `POST /api/leads` ne modifie plus le rôle ni le mot de passe d’un compte existant. Un nouveau compte est créé dans Supabase Auth avec un secret aléatoire non communiqué, puis reçoit un lien recovery à usage limité.

**Résolution :** aucun mot de passe n’est renvoyé ou envoyé par e-mail. Le parcours lead conserve les identifiants et le rôle d’un compte existant ; un nouveau compte choisit son mot de passe via un lien recovery Supabase.

**Fichiers concernés :**

- `app/api/leads/route.ts`
- `components/Booking/LeadCaptureModal.tsx`
- `lib/registration-emails.ts`
- `docs/workflows/01-onboarding-auth.md`

**Solution appliquée :** le mot de passe provisoire aléatoire n’est jamais exposé ; le lien de définition utilise les tokens recovery natifs de Supabase Auth. Les comptes existants ne subissent aucune modification de rôle ou d’identifiants.

**Critères d'acceptation :**

- [x] La réponse API ne contient jamais un mot de passe.
- [x] Un e-mail existant ne peut ni modifier rôle ni mot de passe sans authentification ou lien signé.
- [x] Les réponses ne révèlent pas si l’e-mail disposait déjà d’un compte.
- [ ] La route doit encore être limitée en débit au niveau de l’infrastructure.

**Tests :**

- [ ] E-mail existant, nouveau, admin, parent et tuteur
- [ ] Replay/lien expiré et rate limit
- [ ] Test d'intégration sans fuite de mot de passe dans logs/réponse

## [TECH-002] Rendre la comptabilisation Stripe atomique et réellement idempotente

**Catégories :** [SECURITY] [ARCH] [CODE] [TEST]  
**Priorité :** P0  
**Impact :** Intégrité financière

**État actuel :** `app/api/webhooks/stripe/route.ts` upsert `payments`, mais `addCredits` vérifie un ledger sans utiliser la référence Stripe dans la requête ni s'arrêter si une ligne existe. Il lit puis incrémente `student_credits` et insère le ledger sans identifiant d'événement.

**Problème :** une relivraison Stripe peut exécuter de nouveau l'incrément, et deux événements concurrents peuvent perdre ou doubler un crédit. La documentation actuelle affirme une idempotence que cette fonction n'assure pas.

**Fichiers concernés :**

- `app/api/webhooks/stripe/route.ts`
- `supabase/migrations/20260101120000_initial_schema.sql`
- `docs/workflows/04-payments.md`

**Solution proposée :** persister un `stripe_event_id` ou une référence unique d'attribution dans le ledger, avec contrainte unique, puis effectuer paiement/ledger/solde dans une transaction SQL ou RPC atomique. Retourner immédiatement si l'événement a déjà été appliqué ; formaliser remboursement et consommation des crédits dans le même ledger.

**Critères d'acceptation :**

- [ ] Le même événement Stripe répété N fois ne change le solde qu'une fois.
- [ ] Deux événements différents concurrentiels produisent le bon solde.
- [ ] Paiement, ledger et solde sont cohérents après erreur/retry.

**Tests :**

- [ ] Tests d'intégration Stripe CLI : paiement, abonnement, remboursement, replay
- [ ] Tests de concurrence DB
- [ ] Réconciliation d'un solde contre le ledger

## [TECH-003] Protéger et limiter le workflow de première séance public

**Catégories :** [SECURITY] [WORKFLOW] [ARCH]  
**Priorité :** P0  
**Impact :** Réservations abusives / données personnelles

**État actuel :** `GET|POST /api/leads/first-session-slots` est public. Le POST identifie l'élève par e-mail et peut créer une assignation et une séance gratuite ; il n'est lié ni à une session, ni à un jeton de réservation, ni à un rate limit. La disponibilité est calculée côté application sur une grille fixe 9h–20h, sans transaction de verrouillage.

**Problème :** réservation pour un tiers et course entre deux demandes. Le GET expose également l'existence de disponibilité par matière.

**Fichiers concernés :**

- `app/api/leads/first-session-slots/route.ts`
- `app/api/leads/route.ts`
- `components/Booking/LeadCaptureModal.tsx`

**Solution proposée :** émettre après vérification e-mail un token opaque, court et lié au lead, niveau/matière ; exiger ce token au POST. Ajouter limitation IP/e-mail, validation métier des niveaux/matières, slot hold ou contrainte d'exclusion/transaction DB pour éviter le double booking.

**Lien UX :** la réduction des champs et l'ordre des étapes relèvent de `UX-003`; ce ticket se limite à l'identité, l'anti-abus et la cohérence des écritures.

**Critères d'acceptation :**

- [ ] Un visiteur ne peut pas réserver au nom d'un e-mail tiers.
- [ ] Deux réservations du même créneau n'aboutissent jamais.
- [ ] Les erreurs 400/409 sont actionnables et l'état UI est conservé.

**Tests :**

- [ ] Token absent/expiré/réutilisé
- [ ] Deux POST concurrents
- [ ] Limitation de débit et absence de fuite de données

## [TECH-004] Extraire la logique métier des routes et pages monolithiques

**Catégories :** [ARCH] [CODE]  
**Priorité :** P1  
**Impact :** Maintenabilité / testabilité

**État actuel :** les handlers appellent directement `supabaseAdmin` et combinent validation, RBAC, mapping et notifications. Plusieurs interfaces concentrent état, requêtes et rendu : `app/tutor/administration/page.tsx` (1 464 lignes), `app/student/profile/page.tsx` (885), `app/tutor/profile/page.tsx` (876), `LeadCaptureModal` (821). On relève 351 occurrences d'accès/création Supabase API et 598 occurrences de contournements/types faibles dans le périmètre audité.

**Fichiers concernés :**

- `app/api/**/route.ts`
- `app/{student,tutor}/**/page.tsx`
- `components/Booking/LeadCaptureModal.tsx`
- `lib/{student-access,session-participants,registration-emails}.ts`

**Solution proposée :** introduire par workflow un service applicatif étroit (réservation, paiement, messagerie) et un adaptateur Supabase. Extraire les sous-vues et hooks depuis les grosses pages. Ne créer un repository que là où les requêtes deviennent partagées ou transactionnelles ; garder les lectures simples proches de la route.

**Critères d'acceptation :**

- [ ] La route ne contient que parsing HTTP, appel de service et mapping réponse.
- [ ] Les règles d'autorisation et transitions sont testables sans React/Next.
- [ ] Les composants de plus de 500 lignes ont un plan d'extraction ciblé.

## [TECH-005] Unifier validation, DTO et gestion d'erreur

**Catégories :** [ARCH] [CODE] [A11Y]  
**Priorité :** P1  
**Impact :** Fiabilité API / feedback UX

**État actuel :** Zod est utilisé dans quelques routes (`sessions`, `first-session-slots`), tandis que `leads` et de nombreuses routes utilisent des vérifications ad hoc. Des `any`, casts et `@ts-expect-error` compensent les types Supabase non régénérés. Les réponses alternent entre français/anglais, détails DB et formes d'erreur différentes.

**Fichiers concernés :**

- `app/api/leads/route.ts`
- `app/api/sessions/route.ts`
- `app/api/**/route.ts`
- `lib/validation.ts`
- `types/supabase.ts`

**Solution proposée :** schémas Zod par commande, types d'entrée/sortie dérivés, mapping des erreurs métier vers un `Result`/erreur applicative léger (`code`, message sûr, détails de champ). Régénérer et importer les types DB ; traiter `unknown` au bord des intégrations.

**Critères d'acceptation :**

- [ ] Les entrées externes sont validées côté serveur.
- [ ] Les réponses 4xx/5xx suivent un contrat documenté sans données de debug.
- [ ] Les erreurs de champ peuvent être rendues et annoncées dans l'UI.

## [TECH-006] Rendre l'autorisation cohérente et indépendante d'une liste d'e-mails

**Catégories :** [SECURITY] [ARCH]  
**Priorité :** P1  
**Impact :** Contrôle d'accès / exploitation

**État actuel :** le middleware protège les routes UI grâce au rôle signé. Les API font majoritairement leur propre vérification, mais `lib/admin-permissions.ts` accorde aussi l'administration à une liste d'e-mails de tuteurs codée en dur. `middleware.ts` exclut toutes les API, donc chaque nouvelle route doit se souvenir d'autoriser explicitement.

**Fichiers concernés :**

- `middleware.ts`
- `lib/admin-permissions.ts`
- `auth.ts` et `lib/auth.ts`
- `app/api/admin/**`

**Solution proposée :** faire du rôle ou d'une permission persistée la source unique, retirer le bypass par e-mail après migration contrôlée, et fournir des gardes de route standardisés (`requireUser`, `requireRole`, `requireCapability`). Auditer exhaustivement les API par matrice rôle/ressource/action.

**Critères d'acceptation :**

- [ ] Aucun privilège ne dépend d'une adresse codée dans le bundle.
- [ ] Chaque route API a une politique d'authentification/autorisation explicite.
- [ ] Un test négatif couvre les accès inter-rôles et inter-utilisateurs.

## [TECH-007] Réduire dette dépendances et compléter les en-têtes de sécurité

**Catégories :** [SECURITY] [DX]  
**Priorité :** P0  
**Impact :** Exposition applicative

**État actuel :** `npm audit` détecte 15 vulnérabilités : Next.js est signalé critique, ainsi que dépendances transverses (`nodemailer`, `postcss`, `sharp`, `ws`, etc.). `next.config.js` déclare quelques en-têtes, tandis que `SECURITY.md` annonce CSP, HSTS et `X-Frame-Options: DENY`, divergents de la configuration (`SAMEORIGIN`, pas de CSP/HSTS explicites).

**Fichiers concernés :**

- `package.json`, `package-lock.json`
- `next.config.js`
- `SECURITY.md`
- `scripts/security-check.js`

**Solution proposée :** trier les alertes par chemin exploitable et mise à jour compatible, d'abord Next.js. Mettre à jour par petits lots avec build/tests, puis aligner `SECURITY.md` sur la configuration effective. Définir CSP par inventaire des sources (Stripe, Supabase, LiveKit, Mercure, Pexels) et HSTS uniquement au niveau production HTTPS.

**Critères d'acceptation :**

- [ ] Plus aucune vulnérabilité critique connue dans le lockfile validé.
- [ ] Les en-têtes déployés et la documentation correspondent.
- [ ] CSP est testée sans casser Stripe/LiveKit.

## [TECH-008] Remplacer le calendrier de démonstration et éliminer les parcours morts

**Catégories :** [WORKFLOW] [CODE] [UX]  
**Priorité :** P1  
**Impact :** Intégrité produit / confusion

**État actuel :** `/booking` rend `components/Booking/BookingCalendar.tsx`, qui propose des dates de janvier 2024 en mémoire et affiche un toast « confirmée » sans écrire en base. Le vrai flux est dans `LeadCaptureModal` et les routes `leads/first-session-slots`. `TutorSelectionModal` est également une liste statique indépendante des données réelles.

**Fichiers concernés :**

- `app/(site)/booking/page.tsx`
- `components/Booking/{BookingCalendar,TutorSelectionModal,LeadCaptureModal}.tsx`
- `app/api/leads/first-session-slots/route.ts`

**Solution proposée :** retirer la route ou la faire consommer le même service/état que la modale. Éviter tout mock dans une route accessible ; déterminer si le choix de tuteur est une étape produit réelle ou ne proposer que « meilleur tuteur disponible ».

**Critères d'acceptation :**

- [ ] Toute confirmation publique a une persistance et une référence de séance.
- [ ] Aucune date fictive ne peut être réservée.
- [ ] Le workflow documenté est le workflow accessible.

## [TECH-009] Réduire les composants client, cascades et accès API répétitifs

**Catégories :** [PERF] [ARCH]  
**Priorité :** P2  
**Impact :** JS/hydratation / latence

**État actuel :** la majorité des sections marketing utilisent `"use client"`; les pages dashboard font fréquemment plusieurs `fetch` dans `useEffect`. Les accès Supabase via service role sont dispersés, parfois avec requêtes par élément de liste (notamment messagerie).

**Fichiers concernés :**

- `components/{Hero,Pricing,Footer,FunFact,About}/index.tsx`
- `app/{student,tutor}/**/page.tsx`
- `app/api/{student,tutor}/messages/**`

**Solution proposée :** séparer données serveur stables, interactions client minimales et endpoints agrégés. Mesurer les waterfalls avant de mettre en cache ; définir `no-store` seulement pour les vues réellement temps réel et invalider les données après mutation/Mercure.

**Critères d'acceptation :**

- [ ] Les sections marketing statiques n'hydratent pas inutilement.
- [ ] Les pages critiques ont un budget de requêtes et une stratégie de cache documentés.
- [ ] Chaque mutation rafraîchit/invalide la donnée visible.

## [TECH-010] Ajouter tests, CI et contrôle de schéma

**Catégories :** [TEST] [DX] [WORKFLOW]  
**Priorité :** P1  
**Impact :** Prévention des régressions

**État actuel :** scripts lint/type/build présents, Prettier configuré, historique de commits conventionnel (`feat`, `fix`, `docs`), mais aucun test ni CI détecté. `.env.example` est cité par `README.md` mais absent du dépôt. La génération de types Supabase est manuelle (`db:types`).

**Fichiers concernés :**

- `package.json`
- `README.md`
- `.gitignore`
- `supabase/migrations/**`
- futur `.github/workflows/**`, `.env.example`

**Solution proposée :** créer d'abord des tests unitaires de catalogue/transitions/permissions, puis intégration de routes avec Supabase local et E2E des parcours P0. Faire exécuter en PR : install → format check → lint → type-check → unit → build ; E2E en preview/staging. Ajouter `.env.example` sans secret, validation centralisée et vérification que les types DB sont à jour après migration.

**Critères d'acceptation :**

- [ ] Chaque P0 a au moins un test automatique de non-régression.
- [ ] Une PR ne peut pas fusionner si lint/type/build échouent.
- [ ] L'environnement local est recréable depuis README + exemple d'env.

## [TECH-011] Formaliser observabilité, analytics et exploitation

**Catégories :** [DX] [WORKFLOW] [PERF]  
**Priorité :** P2  
**Impact :** Diagnostic / décision produit

**État actuel :** `lib/logger.ts` et des `console.*` existent, mais aucun suivi d'erreur centralisé, RUM ou analytics produit n'est détecté. Les e-mails/notifications sont souvent lancés en best-effort (`void`), sans outbox ni mesure d'échec.

**Fichiers concernés :**

- `lib/logger.ts`
- `lib/registration-emails.ts`
- `lib/mercure.ts`
- `app/api/**`

**Solution proposée :** définir d'abord événements métier minimaux (sans PII) : `homepage_view`, `booking_cta_click`, `booking_started`, `level_selected`, `subject_selected`, `slot_selected`, `contact_completed`, `booking_completed`, `checkout_started`, `payment_completed`. Ajouter traces/correlation id, alertes de webhook et tableaux de succès des effets secondaires avant tout fournisseur externe.

**Critères d'acceptation :**

- [ ] Un échec paiement/réservation est corrélable à une requête sans contenu sensible.
- [ ] Le funnel rend visible abandons et erreurs par étape.
- [ ] Consentement/cookies et durée de conservation sont documentés.

## [TECH-012] Compléter SEO et cohérence de domaine

**Catégories :** [SEO] [CODE]  
**Priorité :** P2  
**Impact :** Indexation / partage

**État actuel :** metadata par page existe, mais `app/(site)/head.tsx` emploie encore `https://www.sikaschool.com` tandis que README annonce `sikaschool.app`; aucun `robots.ts`, `sitemap.ts`, canonical ou `metadataBase` n'a été trouvé. L'erreur publique est encore celle du template Solid.

**Fichiers concernés :**

- `app/(site)/head.tsx`
- `app/(site)/**/page.tsx`
- `app/layout.tsx`
- `next.config.js`

**Solution proposée :** choisir un domaine canonique, rediriger l'autre domaine au niveau hébergeur, définir `metadataBase`, canonical, OpenGraph absolu, robots et sitemap. Ajouter JSON-LD seulement pour les données réelles (organisation/service/FAQ validée).

**Critères d'acceptation :**

- [ ] Une URL canonique unique est rendue sur chaque page indexable.
- [ ] `.com` et `.app` ne servent pas le même contenu indexable.
- [ ] Sitemap/robots et aperçus sociaux sont vérifiés en production.
