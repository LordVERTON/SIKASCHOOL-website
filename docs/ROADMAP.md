# Roadmap d'amélioration SikaSchool

_Checklist de mise en œuvre issue de l'audit du 12 septembre 2026. Préserver logo, couleurs et identité actuelle. Les décisions commerciales/légales signalées comme dépendances doivent être validées avant développement._

## Rôle de ce document

Cette roadmap est le **seul backlog d'exécution**. Chaque ID y apparaît une seule fois comme tâche actionnable. Pour ne pas dupliquer l'analyse :

| Besoin | Document de référence |
| --- | --- |
| Pourquoi un problème visible est important | `UX_UI_AUDIT.md` |
| Cause technique, sécurité et contrôle qualité | `TECHNICAL_AUDIT.md` |
| Justification et coût d'un pattern | `DESIGN_PATTERNS.md` |
| Carte d'acteurs, étapes et états | `WORKFLOWS.md` |
| Ordre, dépendances et recette | ce document |

## Principes de pilotage

- Priorité à la sécurité, l'intégrité paiement et la continuité des parcours avant le polish.
- Une tâche conserve un périmètre petit, démontrable et réversible.
- Utiliser les principes : cohérence et standards, reconnaissance plutôt que mémorisation, visibilité de l'état, prévention des erreurs, divulgation progressive, WCAG 2.2 (focus/target size), Core Web Vitals.
- Les documents d'audit donnent le contexte ; ne recopier ici que le travail, les dépendances et les critères de sortie.

## Matrice impact / effort

| ID | Amélioration | Impact | Effort | Risque | Priorité |
| --- | --- | ---: | ---: | ---: | --- |
| TECH-001 | Supprimer la réinitialisation de mot de passe par lead | High | Medium | High | P0 |
| TECH-002 | Idempotence et transaction des crédits Stripe | High | High | High | P0 |
| TECH-003 | Sécuriser la réservation publique | High | Medium | High | P0 |
| UX-001 | Unifier l'ouverture de la modale de réservation | High | Low | Medium | P0 |
| A11Y-001 | Landmarks et modales accessibles | High | Medium | Medium | P0 |
| UX-002 | Tarifs exacts, comparables et conditions | High | Medium | Medium | P0 |
| UX-003 | Réservation progressive et formulaires | High | High | Medium | P0 |
| TECH-007 | Mettre à niveau les vulnérabilités critiques | High | Medium | Medium | P0 |
| TECH-008 | Remplacer le calendrier mock | High | Medium | Medium | P1 |
| UX-004 | Réordonner la homepage | High | Medium | Low | P1 |
| UX-005 | Prouver contenus, tuteurs et chiffres | High | Medium | Low | P1 |
| UX-006 | Normaliser navigation et liens | Medium | Low | Low | P1 |
| UI-001 | Primitives du design system | High | High | Medium | P1 |
| A11Y-002 | États, erreurs et mouvement réduit | Medium | Medium | Low | P1 |
| TECH-004 | Services et extraction des écrans monolithiques | High | High | Medium | P1 |
| TECH-005 | Contrats Zod/DTO/erreurs | High | Medium | Medium | P1 |
| TECH-006 | RBAC cohérent | High | Medium | Medium | P1 |
| TECH-010 | Tests, CI, env et types DB | High | High | Low | P1 |
| TECH-009 | Hydratation/fetch/cache | Medium | Medium | Medium | P2 |
| TECH-011 | Observabilité et funnel | Medium | Medium | Low | P2 |
| TECH-012 | SEO et domaine canonique | Medium | Low | Low | P2 |
| PERF-001 | Baseline et budgets Core Web Vitals | Medium | Medium | Low | P2 |

## Phase 0 — Corrections critiques

- [x] **[P0][SECURITY][TECH-001] Supprimer toute réinitialisation de mot de passe déclenchée par un lead**
  - Impact : élevé
  - Effort : moyen
  - Risque : élevé
  - Dépendances : décision de création de compte (lien de définition de mot de passe ou compte après essai)
  - Fichiers concernés : `app/api/leads/route.ts`, `components/Booking/LeadCaptureModal.tsx`, `lib/registration-emails.ts`
  - Travail : séparer lead, compte existant et récupération de mot de passe ; rendre les réponses non-énumérantes ; supprimer `initialPassword` et le mot de passe prévisible.
  - Critères d'acceptation :
    - [x] Aucune réponse/log/e-mail ne contient un mot de passe généré.
    - [x] Un lead ne peut pas modifier le rôle ni le mot de passe d'un compte existant.

- [ ] **[P0][SECURITY][TECH-002] Rendre l'attribution de crédits Stripe atomique et idempotente**
  - Impact : élevé
  - Effort : élevé
  - Risque : élevé
  - Dépendances : migration SQL/RPC et stratégie de réconciliation
  - Fichiers concernés : `app/api/webhooks/stripe/route.ts`, `supabase/migrations/**`, `docs/workflows/04-payments.md`
  - Travail : ajouter référence unique d'événement au ledger, transactionner paiement/ledger/solde et faire retourner le chemin déjà appliqué.
  - Critères d'acceptation :
    - [ ] Un replay d'événement ne crédite pas deux fois.
    - [ ] Les totaux correspondent au ledger après concurrence et retry.

- [ ] **[P0][SECURITY][TECH-003] Lier la réservation gratuite à un token vérifié et empêcher le double booking**
  - Impact : élevé
  - Effort : moyen
  - Risque : élevé
  - Dépendances : TECH-001, politique de vérification e-mail et limitation de débit
  - Fichiers concernés : `app/api/leads/**`, `components/Booking/LeadCaptureModal.tsx`, migration sessions/holds si retenue
  - Travail : token opaque court, rate limit IP/e-mail, verrou/contrainte transactionnelle de créneau, réponse 409 récupérable.
  - Critères d'acceptation :
    - [ ] Une personne ne réserve pas pour une autre via son e-mail.
    - [ ] Deux demandes simultanées ne créent jamais deux séances identiques.

- [ ] **[P0][UX][A11Y][UX-001] Donner un unique propriétaire à la modale de réservation**
  - Impact : élevé
  - Effort : faible
  - Risque : moyen
  - Dépendances : aucune
  - Fichiers concernés : `components/Hero/index.tsx`, `app/(site)/ClientProviders.tsx`, `components/Header/index.tsx`, `components/StagePromo/index.tsx`
  - Travail : retirer l'instance doublée, remplacer l'événement DOM par une action typée et tester les sources CTA.
  - Critères d'acceptation :
    - [ ] Une seule modale est visible et soumissible.
    - [ ] Le focus revient au lanceur.

- [ ] **[P0][A11Y][A11Y-001] Corriger landmarks, skip link et dialogs**
  - Impact : élevé
  - Effort : moyen
  - Risque : moyen
  - Dépendances : UX-001
  - Fichiers concernés : `app/(site)/layout.tsx`, pages publiques, `components/Accessibility/SkipLink.tsx`, `components/Booking/**Modal.tsx`
  - Travail : un seul main, cible de skip link focalisable, dialog standard avec focus trap/Échap/retour focus/titre annoncé.
  - Critères d'acceptation :
    - [ ] Aucun focus n'atteint l'arrière-plan d'une modale ouverte.
    - [ ] La navigation par landmarks/titres est valide au lecteur d'écran.

- [ ] **[P0][UX][UI][UX-002] Rendre prix, économie et conditions comparables**
  - Impact : élevé
  - Effort : moyen
  - Risque : moyen
  - Dépendances : validation commerciale et juridique des conditions
  - Fichiers concernés : `components/{Pricing,Packs,BookOnline}/**`, `lib/{payments-catalog,stripe}.ts`, FAQ/légal
  - Travail : une présentation de plan unique ; afficher TTC, durée, prix/séance, économie dérivée ; distinguer pack/abonnement/séance.
  - Critères d'acceptation :
    - [ ] Les prix publics correspondent à Stripe.
    - [ ] « Sans engagement », validité et annulation sont définis avant paiement.

- [ ] **[P0][SECURITY][DX][TECH-007] Réduire les vulnérabilités critiques et aligner les en-têtes documentés**
  - Impact : élevé
  - Effort : moyen
  - Risque : moyen
  - Dépendances : environnement de preview/build pour les mises à jour majeures
  - Fichiers concernés : `package.json`, `package-lock.json`, `next.config.js`, `SECURITY.md`
  - Travail : mise à jour compatible prioritaire de Next.js, audit des alertes restantes, tests de régression, inventaire CSP/HSTS.
  - Critères d'acceptation :
    - [ ] Aucune vulnérabilité critique connue ne reste dans le lockfile validé.
    - [ ] `SECURITY.md` décrit les en-têtes réellement déployés.

## Phase 1 — UX et conversion

- [ ] **[P1][UX][WORKFLOW][UX-003] Recomposer le parcours de réservation par étapes**
  - Impact : élevé ; Effort : élevé ; Risque : moyen
  - Dépendances : TECH-001 à TECH-003, UX-001
  - Fichiers concernés : `components/Booking/LeadCaptureModal.tsx`, `app/api/leads/**`
  - Travail : niveau → matière → créneau → coordonnées minimales → confirmation ; états réessayables et valeurs conservées.
  - Critères d'acceptation :
    - [ ] Chaque étape est annoncée et exploitable au clavier/mobile.
    - [ ] Une erreur n'efface pas les choix antérieurs.

- [ ] **[P1][UX][UI][UX-004] Réorganiser la homepage autour de la décision**
  - Impact : élevé ; Effort : moyen ; Risque : faible
  - Dépendances : contenus tuteurs/preuves approuvés, analytics baseline
  - Fichiers concernés : `app/(site)/page.tsx`, sections homepage
  - Travail : Hero → réassurance → avis → fonctionnement → tuteurs → tarifs → FAQ → CTA final ; campagne isolée/configurable.
  - Critères d'acceptation :
    - [ ] Chaque section a un objectif clair et ne concurrence pas le CTA primaire.
    - [ ] Menu/ancres suivent l'ordre réel.

- [ ] **[P1][UX][UI][UX-005] Publier seulement des preuves vérifiables**
  - Impact : élevé ; Effort : moyen ; Risque : faible
  - Dépendances : validation métier, consentements et droits logos
  - Fichiers concernés : `components/{FunFact,Testimonial,Brands}/**`, `lib/{translations,homepage-testimonials}.ts`, `public/images/logo/**`
  - Travail : registre de source pour chiffres, avis contextualisés, cartes/profils tuteurs, mention non partenariale si vraie.
  - Critères d'acceptation :
    - [ ] Chaque statistique possède période/définition/source.
    - [ ] Aucun logo ne suggère un partenariat non prouvé.

- [ ] **[P1][UX][A11Y][UX-006] Normaliser navigation, copy et liens**
  - Impact : moyen ; Effort : faible ; Risque : faible
  - Dépendances : glossaire FR/EN
  - Fichiers concernés : `components/{Header,Footer}/**`, `lib/translations.ts`
  - Travail : `À la séance`, `Qui sommes-nous ?`, CTA/ancres stables, suppression de `href="#"`.
  - Critères d'acceptation :
    - [ ] Toutes les destinations ont une formulation cohérente.
    - [ ] Tous les liens sont utiles et fonctionnels.

## Phase 2 — Design system

- [ ] **[P1][UI][A11Y][UI-001] Établir tokens d'espacement/type et primitives UI**
  - Impact : élevé ; Effort : élevé ; Risque : moyen
  - Dépendances : inventaire des écrans ; pas de changement de palette/logo
  - Fichiers concernés : `app/globals.css`, `components/Common/**`, écrans touchés
  - Travail : tokens spacing/type/surfaces et `Button`, `Card`, `Field`, `Alert`, `Dialog`, `Section`, `Container` progressifs.
  - Critères d'acceptation :
    - [ ] Variantes, focus, disabled et loading sont définis une fois.
    - [ ] Les écrans migrés gardent couleurs/identité existantes.

- [ ] **[P1][A11Y][UI][A11Y-002] Standardiser feedback, erreurs et mouvement réduit**
  - Impact : moyen ; Effort : moyen ; Risque : faible
  - Dépendances : UI-001
  - Fichiers concernés : `components/{Common,Student,ErrorBoundary}/**`, composants Motion, `app/(site)/error/page.tsx`
  - Travail : composants état vide/skeleton/erreur/retry et règle `prefers-reduced-motion`; localiser les erreurs template.
  - Critères d'acceptation :
    - [ ] Tous les formulaires critiques annoncent succès/erreur.
    - [ ] Mouvement réduit respecte la préférence OS.

## Phase 3 — Architecture

- [ ] **[P1][ARCH][CODE][TECH-004] Extraire services métier et sous-composants ciblés**
  - Impact : élevé ; Effort : élevé ; Risque : moyen
  - Dépendances : tests initiaux (TECH-010)
  - Fichiers concernés : `app/api/**`, `app/tutor/administration/page.tsx`, profils, `LeadCaptureModal`
  - Travail : commencer par booking/paiements ; faire des routes minces ; extraire hooks/vues de grosses pages.
  - Critères d'acceptation :
    - [ ] Règles métier testables sans route Next.
    - [ ] Aucun refactor général non justifié.

- [ ] **[P1][ARCH][CODE][TECH-005] Normaliser schémas, DTO et erreurs**
  - Impact : élevé ; Effort : moyen ; Risque : moyen
  - Dépendances : TECH-004
  - Fichiers concernés : `lib/validation.ts`, `app/api/**`, `types/supabase.ts`
  - Travail : Zod aux frontières, réponse d'erreur stable, régénération type DB et suppression progressive des `any` prioritaires.
  - Critères d'acceptation :
    - [ ] Entrée/sortie des endpoints critiques documentées et validées.
    - [ ] Pas de détail DB envoyé au navigateur.

- [ ] **[P1][SECURITY][ARCH][TECH-006] Centraliser les guards d'autorisation**
  - Impact : élevé ; Effort : moyen ; Risque : moyen
  - Dépendances : matrice permissions validée
  - Fichiers concernés : `auth.ts`, `lib/{auth,admin-permissions,student-access}.ts`, `app/api/**`
  - Travail : supprimer liste e-mails admin, guards cohérents, ownership au niveau service.
  - Critères d'acceptation :
    - [ ] Privilèges uniquement issus d'un rôle/capacité persisté.
    - [ ] Matrice rôle × action couverte par tests négatifs.

## Phase 4 — Workflows

- [ ] **[P1][WORKFLOW][CODE][TECH-008] Supprimer ou connecter le calendrier public mock**
  - Impact : élevé ; Effort : moyen ; Risque : moyen
  - Dépendances : TECH-003 et UX-003
  - Fichiers concernés : `app/(site)/booking/page.tsx`, `components/Booking/{BookingCalendar,TutorSelectionModal}.tsx`
  - Travail : un seul moteur de réservation et de disponibilité ; supprimer les données 2024 de toute route publique.
  - Critères d'acceptation :
    - [ ] Toute confirmation a une séance réellement créée et une référence.
    - [ ] Aucun écran ne promet une réservation fictive.

- [ ] **[P1][WORKFLOW][ARCH] Formaliser les transitions séance, annulation et crédits**
  - Impact : élevé ; Effort : moyen ; Risque : moyen
  - Dépendances : TECH-002, TECH-004
  - Fichiers concernés : `app/api/{sessions,tutor/sessions/action}/**`, `lib/session-participants.ts`, migrations concernées
  - Travail : table de transitions, commandes, invariant de consommation de crédit, notification/outbox après réussite.
  - Critères d'acceptation :
    - [ ] Chaque transition a acteur, précondition, sortie et erreur définis.
    - [ ] Annulation et remboursement respectent la règle commerciale validée.

## Phase 5 — Performance, accessibilité et SEO

- [ ] **[P2][PERF][ARCH][TECH-009] Réduire hydratation et waterfalls mesurés**
  - Impact : moyen ; Effort : moyen ; Risque : moyen
  - Dépendances : baseline PERF-001
  - Fichiers concernés : sections marketing client, dashboards, routes messages
  - Travail : rendre serveur le statique, découper l'interactif, regrouper données et définir cache/invalidation.
  - Critères d'acceptation :
    - [ ] Réduction mesurée du JS ou des requêtes sur une page cible.
    - [ ] Donnée mutée rafraîchie correctement.

- [ ] **[P2][PERF][UI][PERF-001] Mettre en place baseline et budgets CWV**
  - Impact : moyen ; Effort : moyen ; Risque : faible
  - Dépendances : environnement production/preview instrumenté
  - Fichiers concernés : `next.config.js`, hero/avis/images, futur monitoring
  - Travail : mesurer LCP/CLS/INP, tailles/sizes, images distantes et préférences reduced motion.
  - Critères d'acceptation :
    - [ ] LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms au p75 quand RUM disponible.

- [ ] **[P2][SEO][TECH-012] Choisir un domaine canonique et compléter metadata**
  - Impact : moyen ; Effort : faible ; Risque : faible
  - Dépendances : décision `.app`/`.com` et accès hébergeur
  - Fichiers concernés : `app/(site)/head.tsx`, `app/layout.tsx`, futur `app/{robots,sitemap}.ts`, config hébergeur
  - Travail : redirect du domaine secondaire, metadataBase/canonical/OG absolus, sitemap, robots, structured data réel.
  - Critères d'acceptation :
    - [ ] Une seule URL est indexable par contenu.
    - [ ] Partages sociaux et Search Console sont validés.

## Phase 6 — Tests, CI et observabilité

- [ ] **[P1][TEST][DX][TECH-010] Construire le filet de sécurité et la CI**
  - Impact : élevé ; Effort : élevé ; Risque : faible
  - Dépendances : environnement Supabase local reproductible
  - Fichiers concernés : `package.json`, `README.md`, futur `.env.example`, `.github/workflows/**`, tests
  - Travail : unit (catalogue, transitions, permissions), intégration (lead/booking/Stripe), E2E (signup/login/booking/achat), PR pipeline install → format → lint → type → unit → build → e2e preview.
  - Critères d'acceptation :
    - [ ] Chaque P0 a une preuve automatisée.
    - [ ] CI bloque une régression lint/type/build/test.

- [ ] **[P2][DX][WORKFLOW][TECH-011] Rendre erreurs et funnel observables**
  - Impact : moyen ; Effort : moyen ; Risque : faible
  - Dépendances : politique consentement/RGPD, événements validés
  - Fichiers concernés : `lib/logger.ts`, `lib/{registration-emails,mercure}.ts`, providers à choisir
  - Travail : correlation id, logs sûrs, alertes webhook, funnel minimal sans PII et taux d'échec des effets secondaires.
  - Critères d'acceptation :
    - [ ] Une réservation/paiement défaillant est diagnostiquable sans secret/PII dans les logs.
    - [ ] Funnel homepage_view → booking_completed visible avec consentement adapté.

# Quick Wins

Ces tâches sont à faible effort/faible risque ; elles ne remplacent pas les P0 sécurité.

- [ ] [P1][UX] Corriger « À la séance » et « Qui sommes-nous ? » dans `lib/translations.ts`.
- [ ] [P1][UX][A11Y] Remplacer les `href="#"` du footer par `mailto:` et `/donnees-personnelles`.
- [ ] [P1][A11Y] Rendre la cible de skip link focalisable et supprimer les `<main>` imbriqués.
- [ ] [P1][A11Y] Ajouter titre, `aria-modal`, Échap et retour focus à `TutorSelectionModal`.
- [ ] [P1][UX] Retirer le composant CTA anglais non utilisé ou le localiser avant réemploi.
- [ ] [P1][UX] Localiser `app/(site)/error/page.tsx` et supprimer « Solid SaaS Boilerplate ».
- [ ] [P1][UX] Supprimer le calendrier 2024 de la route publique ou le rediriger vers le vrai parcours.
- [ ] [P1][UI] Ajouter les `sizes` aux images responsives les plus visibles, après mesure.
- [ ] [P1][UI] Définir `prefers-reduced-motion` pour les animations d'entrée non essentielles.
- [ ] [P1][DX] Ajouter `.env.example` sans secrets, conforme au README.
- [ ] [P1][DX] Remplacer `next lint` déprécié par l'ESLint CLI dans les scripts, après validation Next.
- [ ] [P2][SEO] Aligner l'URL OpenGraph sur le domaine canonique choisi.

# Risques de régression

### Sécurisation et refonte réservation

**Risques :** perte de données entre étapes, demandes non finalisées, régression parent/élève, double réservation, évolution des e-mails/analytics.  
**Pages/workflows :** homepage, header, promo, `/booking`, lead, notifications, admin/tuteur.  
**Tests obligatoires :** E2E desktop/mobile, nouveau/existant, parent, réseau lent, clavier, lecteur d'écran, deux créneaux concurrents, vérification e-mail.

### Paiements et crédits

**Risques :** double crédit, perte de crédit, erreur de montant, abonnement non synchronisé, remboursement incohérent.  
**Pages/workflows :** packs, à la carte, paiements élève/famille, Stripe webhook, admin.  
**Tests obligatoires :** Stripe CLI, replay webhooks, concurrence, checkout réussi/annulé, abonnement, remboursement, réconciliation DB.

### Design system et homepage

**Risques :** changement involontaire de couleurs/logo, contraste insuffisant, casse responsive, CTA ou routes modifiés.  
**Pages/workflows :** site public et composants partagés.  
**Tests obligatoires :** captures clair/sombre, 320/375/390/430/tablette/laptop/grand écran, clavier, contraste, non-régression des liens.

### Extraction architecture/RBAC

**Risques :** permission oubliée, récupération de donnée divergente, cache périmé, effets secondaires doublés.  
**Pages/workflows :** toutes les API rôle-aware, dashboards, LiveKit, messages.  
**Tests obligatoires :** matrice rôle × ressource × action, tests ownership, build/type/lint, intégration Supabase.

# Definition of Done

Une tâche UX/UI ou technique est terminée seulement si :

- [ ] Desktop validé.
- [ ] Mobile et responsive validés aux breakpoints pertinents.
- [ ] Navigation clavier validée ; lecteur d'écran validé quand pertinent.
- [ ] Loading, empty, success et error states présents lorsque pertinents.
- [ ] Les valeurs utilisateur sont préservées après une erreur récupérable.
- [ ] Aucun changement non souhaité de logo ou couleurs de marque.
- [ ] La sécurité, les permissions et données personnelles sont revues si la tâche les touche.
- [ ] TypeScript, lint, format et build passent.
- [ ] Tests unitaires/intégration/E2E concernés passent ; test de non-régression ajouté pour tout P0.
- [ ] Aucun warning console ajouté, logs sans secret ni mot de passe.
- [ ] Critères d'acceptation, analytics et documentation concernés sont mis à jour.
