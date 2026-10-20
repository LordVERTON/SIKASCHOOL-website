# Roadmap d'amélioration SikaSchool

_Checklist de mise en œuvre issue de l'audit du 12 septembre 2026. Appliquer l’identité officielle V2 du 20 octobre 2026 ; conserver le logo existant. Les décisions commerciales/légales signalées comme dépendances doivent être validées avant développement._

## Addendum prioritaire — identité officielle V2 (20 octobre 2026)

La référence graphique et éditoriale principale est désormais [BRAND_IDENTITY_V2.md](BRAND_IDENTITY_V2.md). Elle prime sur les anciennes consignes de conservation de palette : **bleu #1E3A8A, orange #FFBC58, blanc, neutre #F0F1F5 ; Poppins pour corps/UI, display Archivo Black en capitales**. La branche `test-ui` rétablit la typographie initiale de la refonte V2. Akaru guide la sophistication, DANEMO les principes techniques, sans remplacement de l’identité SIKASCHOOL. Le bleu historique #006BFF n’est plus la référence par défaut.

Les fichiers Instagram, ZIP et PDF nommés dans l’addendum sont absents du dépôt : ils n’ont pas été inspectés. Les spécifications du propriétaire ont servi à l’implémentation. Horizon n’est pas embarquée : source exacte et droit web non vérifiés ; Archivo Black (SIL OFL) sert d’alternative provisoire à valider. Le comparatif avec la branche `feat(UX/UI)` utilisant Sensa Wild Fill est décrit dans `docs/TYPOGRAPHY_COMPARISON.md`.

La recette a également révélé que `/how-to`, `/booking`, `/book-online`, `/support`, `/donnees-personnelles` et `/error` manquaient dans `PUBLIC_ROUTES`. Ces destinations publiques sont ajoutées explicitement ; les espaces métier restent soumis à leurs contrôles d’authentification.

**Implémentation locale :** migration des alias de couleur, typographie publique, nouvelle homepage en React/CSS, matières du catalogue transmises au formulaire réel, modale unique typée, fonds inertes et mouvement réduit, pages publiques harmonisées. Les statistiques non sourcées, la promotion saisonnière de la homepage et les faux créneaux de `/booking` sont retirés du rendu. Les profils et citations existants sont réutilisés sans diplôme/badge vérifié inventé. Les prix de la homepage viennent du catalogue partagé. Voir [la recette et ses limites](BRAND_V2_VERIFICATION.md).

Cette actualisation inclut du code réel et de la vérification locale ; la mention « mission documentaire » du 17 octobre ci-dessous reste limitée à cette intervention antérieure. Aucun déploiement ni lancement de campagne n’est effectué.

**Priorité d’exécution :** UI-001 passe en P0 pour les fondations V2. UX-001, UX-004, UX-005, A11Y-001/002 et SK-006 portent la migration et sa recette ; seules les cases dont les critères sont satisfaits sont cochées. Aucun backlog graphique parallèle n’est créé.

Restent à obtenir dans UX-005 : originaux des supports, comparaison directe, choix display validé, droits des portraits et avis, fiches tuteurs authentiques (parcours, matières, méthodologie, qualifications avec justificatifs). Ne publier aucune statistique « 70 % », promesse « +15/20 » ou offre établissements sans preuve/offre réelle. UI-001 garde la migration progressive des primitives ; PERF-001 garde les mesures de performance en production.

## Exécution UX/UI — branche `feat(UX/UI)` (20 octobre 2026)

Les modifications V2 déjà présentes sont conservées. Le lot poursuit les P0 d’interface (dialogs accessibles, primitives et tarifs), puis la navigation, les formulaires et les campagnes. Le détail des changements et de la recette figure dans [UX_UI_IMPLEMENTATION_2026-10-20.md](UX_UI_IMPLEMENTATION_2026-10-20.md). Les tâches de sécurité, les conditions commerciales et les recettes transactionnelles restent ouvertes ; les simulations navigateur ne valent pas validation de Supabase ou Stripe.

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

Actualisation documentaire du **17 octobre 2026**, sur `main` (`e637788`) : les phases, priorités, IDs et cases historiques sont conservés. Les onze demandes complémentaires sont intégrées ci-dessous dans ce même backlog. Les références Notion proviennent des demandes fournies ; elles servent au suivi, sans synchronisation automatique bidirectionnelle ni modification de Notion.

Les constats ajoutés reposent sur la lecture des fichiers versionnés et de l'arborescence `app/`, `components/`, `lib/`, `supabase/` ; ils ne prouvent ni l'état de production ni une recette exécutée. Les audits de septembre restent datés : `package.json` déclare maintenant Next.js 16.3.4 et des scripts `lint` (ESLint CLI), `type-check` et `build`, sans runner de tests dédié. Les travaux communs restent portés par leurs IDs historiques ; les SK décrivent le complément demandé et sa recette globale. Une dépendance « coordination » n'impose pas de terminer tout le ticket lié avant de commencer.

Les campagnes d'été et de rentrée 2026 sont passées au jour de cette mise à jour. Toute nouvelle activation exige une période future et une validation commerciale explicites ; le contenu promotionnel encore présent dans le code ne vaut pas autorisation de publication. Cette mission ne réalise aucun développement, test transactionnel, paiement, déploiement ou lancement marketing.

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
| UI-001 | Fondations V2 et primitives du design system | High | High | Medium | P0 |
| A11Y-002 | États, erreurs et mouvement réduit | Medium | Medium | Low | P1 |
| TECH-004 | Services et extraction des écrans monolithiques | High | High | Medium | P1 |
| TECH-005 | Contrats Zod/DTO/erreurs | High | Medium | Medium | P1 |
| TECH-006 | RBAC cohérent | High | Medium | Medium | P1 |
| TECH-010 | Tests, CI, env et types DB | High | High | Low | P1 |
| TECH-009 | Hydratation/fetch/cache | Medium | Medium | Medium | P2 |
| TECH-011 | Observabilité et funnel | Medium | Medium | Low | P2 |
| TECH-012 | SEO et domaine canonique | Medium | Low | Low | P2 |
| PERF-001 | Baseline et budgets Core Web Vitals | Medium | Medium | Low | P2 |
| SK-001 | Finaliser Stripe et sa recette globale (atomicité : TECH-002) | High | High | High | P0 |
| SK-002 | Homogénéiser les statuts français | Medium | Medium | Medium | P1 |
| SK-003 | Diagnostiquer et corriger la 404 depuis un tuteur | High | Medium | High | P0 |
| SK-004 | Préparer les futurs stages et les accès sociaux | High | Medium | Medium | P1 |
| SK-005 | Produire la vidéo des stages | Medium | Medium | Medium | P2 |
| SK-006 | Actualiser et recetter le site | High | High | Medium | P1 |
| SK-007 | Planifier YouTube Ads sans lancement automatique | Medium | Medium | High | P2 |
| SK-008 | Surveiller la disponibilité DB et préparer la reprise | High | Medium | High | P0 |
| SK-009 | Préparer une future offre de rentrée -15 % | High | Medium | High | P1 |
| SK-010 | Préparer le carrousel Canva de rentrée | Medium | Low | Medium | P2 |
| SK-011 | Permettre le choix différé sécurisé du premier créneau | High | High | High | P0 |

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

- [x] **[P0][UX][A11Y][UX-001] Donner un unique propriétaire à la modale de réservation**
  - Impact : élevé
  - Effort : faible
  - Risque : moyen
  - Dépendances : aucune
  - Fichiers concernés : `components/Hero/index.tsx`, `app/(site)/ClientProviders.tsx`, `components/Header/index.tsx`, `components/StagePromo/index.tsx`
  - Travail : retirer l'instance doublée, remplacer l'événement DOM par une action typée et tester les sources CTA.
  - Réalisé localement le 20 octobre : un seul `LeadCaptureModal` dans `ClientProviders`, `BookingContext/useBooking`, transmission matière/e-mail/campagne ; `lead:open` reste un adaptateur de compatibilité.
  - Critères d'acceptation :
    - [x] Une seule instance de modale et de formulaire est rendue pour les cinq entrées testées ; aucune soumission doublée possible par duplication du composant.
    - [x] Le focus revient au lanceur desktop ou au bouton du menu mobile lorsque son CTA disparaît. Recette Chromium dans `BRAND_V2_VERIFICATION.md` ; aucune écriture backend effectuée.

- [ ] **[P0][A11Y][A11Y-001] Corriger landmarks, skip link et dialogs**
  - Impact : élevé
  - Effort : moyen
  - Risque : moyen
  - Dépendances : UX-001
  - Fichiers concernés : `app/(site)/layout.tsx`, pages publiques, `components/Accessibility/SkipLink.tsx`, `components/Booking/**Modal.tsx`
  - Travail : un seul main, cible de skip link focalisable, dialog standard avec focus trap/Échap/retour focus/titre annoncé.
  - Lot UX/UI : `Common/Dialog` natif partagé par réservation, choix du tuteur et menu mobile ; arrière-plan inerte via la top layer, piège Tab/Maj+Tab, défilement mobile et retour focus. Landmarks publics conservés. Le choix du tuteur est un composant historique non monté dans le parcours actuel ; son contrôle est statique, celui du composant partagé est exécuté au navigateur.
  - Critères d'acceptation :
    - [x] Aucun focus n'atteint l'arrière-plan des modales publiques testées (réservation et menu mobile) ; le choix du tuteur utilise la même primitive.
    - [ ] La navigation par landmarks/titres est valide au lecteur d'écran.

- [ ] **[P0][UX][UI][UX-002] Rendre prix, économie et conditions comparables**
  - Impact : élevé
  - Effort : moyen
  - Risque : moyen
  - Dépendances : validation commerciale et juridique des conditions
  - Fichiers concernés : `components/{Pricing,Packs,BookOnline}/**`, `lib/{payments-catalog,stripe}.ts`, FAQ/légal
  - Travail : une présentation de plan unique ; afficher TTC, durée, prix/séance, économie dérivée ; distinguer pack/abonnement/séance.
  - Lot UX/UI : `PlanCard` commun à accueil/packs/séances, TTC et économie en euros dérivée du tarif unitaire du même niveau. `lib/stripe.ts` construit ses offres depuis `CLIENT_PLANS` sans changement de montants/IDs. Les assertions « Sans engagement » non définies sont retirées des cartes. Erreur Checkout visible et réessayable, retour de connexion vers la page d’origine.
  - Critères d'acceptation :
    - [x] Les prix publics et les `price_data` du Checkout proviennent du même catalogue ; test de non-régression. La configuration réelle du compte Stripe reste à recetter dans SK-001.
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
  - Lot UX/UI (partiel) : besoins → coordonnées → créneau selon le contrat actuel du backend ; formulaire natif, groupes annoncés, focus sur le titre, validations et erreurs conservant la saisie. Indicatif pays natif, retry des créneaux, état vide, conflit 409 et demande en attente clairement distincte d’une confirmation tuteur. FR/EN et contrats `PARENT`/`STUDENT` simulés au navigateur. L’ordre cible, le token vérifié TECH-003 et la reprise sécurisée restent à traiter avant de solder le ticket.
  - Critères d'acceptation :
    - [x] Chaque étape de l’interface actuelle est annoncée et exploitable au clavier/mobile (recette navigateur).
    - [x] Une erreur n’efface pas les choix antérieurs ; retour arrière et fermeture/réouverture conservent le brouillon pendant la session.

- [ ] **[P1][UX][UI][UX-004] Réorganiser la homepage autour de la décision**
  - Impact : élevé ; Effort : moyen ; Risque : faible
  - Dépendances : contenus tuteurs/preuves approuvés, analytics baseline
  - Fichiers concernés : `app/(site)/page.tsx`, sections homepage
  - Travail : Hero → réassurance → avis → fonctionnement → signature → tuteurs → tarifs → FAQ/contact → CTA final ; campagne isolée/configurable.
  - Réalisé localement le 20 octobre : composition V2, matières accessibles depuis le catalogue réel, trois étapes conformes au formulaire actuel, signature éditoriale, équipe et avis existants, CTA réels ; promotion périmée retirée de la homepage.
  - Critères d'acceptation :
    - [ ] Chaque section a un objectif clair et ne concurrence pas le CTA primaire.
    - [x] Menu/ancres suivent l’ordre réel : avis → fonctionnement → équipe → tarifs, état actif synchronisé au scroll et ancres sous le header.
  - Campagnes : configuration centralisée dans `lib/campaigns.ts`, désactivée sans période future approuvée ; dates zonées, fin exclusive et tests des bornes. `StagePromo` reste masqué en l’absence de campagne active, sans supprimer l’attribution historique des leads.

- [ ] **[P1][UX][UI][UX-005] Publier seulement des preuves vérifiables**
  - Impact : élevé ; Effort : moyen ; Risque : faible
  - Dépendances : validation métier, consentements et droits logos
  - Fichiers concernés : `components/{FunFact,Testimonial,Brands}/**`, `lib/{translations,homepage-testimonials}.ts`, `public/images/logo/**`
  - Travail : registre de source pour chiffres, avis contextualisés, cartes/profils tuteurs, mention non partenariale si vraie.
  - Lot UX/UI : mention non justifiée de « tuteurs qualifiés » retirée du footer FR/EN. Les droits et sources des portraits/avis restent à obtenir.
  - Critères d'acceptation :
    - [ ] Chaque statistique possède période/définition/source.
    - [ ] Aucun logo ne suggère un partenariat non prouvé.

- [x] **[P1][UX][A11Y][UX-006] Normaliser navigation, copy et liens**
  - Impact : moyen ; Effort : faible ; Risque : faible
  - Dépendances : glossaire FR/EN
  - Fichiers concernés : `components/{Header,Footer}/**`, `lib/translations.ts`
  - Travail : `À la séance`, `Qui sommes-nous ?`, CTA/ancres stables, suppression de `href="#"`.
  - Lot UX/UI : navigation typée FR/EN, quatre destinations d’accueil et logo vers `/`, menu mobile dialog avec noms localisés, libellés corrigés. La page Comment ça marche reprend les étapes réelles, les noms de niveaux et le CTA commun. Destinations du header/footer recettées en HTTP et ancres vérifiées.
  - Critères d'acceptation :
    - [x] Les destinations publiques du header/footer et les pages d’offres migrées ont une formulation cohérente.
    - [x] Les liens du header/footer ont une destination utile, sans `href="#"` ; pages et ancres vérifiées.

## Phase 2 — Design system

- [ ] **[P0][UI][A11Y][UI-001] Appliquer la charte V2 et établir les primitives UI**
  - Impact : élevé ; Effort : élevé ; Risque : moyen
  - Dépendances : inventaire des écrans ; addendum officiel V2 prioritaire, logo existant conservé
  - Fichiers concernés : `app/globals.css`, `components/Common/**`, écrans touchés
  - Travail : tokens spacing/type/surfaces et `Button`, `Card`, `Field`, `Alert`, `Dialog`, `Section`, `Container` progressifs.
  - Lot UX/UI : sept primitives React partagées, adoptées sur les offres publiques, le header, le formulaire et Comment ça marche ; variantes, boutons en attente/désactivés, champs avec labels/aide/erreur et alertes sémantiques. Le ticket reste ouvert pour la poursuite de migration et la validation display/supports signalée dans l’addendum.
  - Réalisé localement le 20 octobre : palette officielle et alias compatibles, Poppins/Archivo Black, primitives CSS publiques, homepage et pages secondaires ; Radix/shadcn/Lucide ne sont pas encore installés. Alternative display et comparaison aux supports à valider.
  - Critères d'acceptation :
    - [x] Variantes, focus, disabled et loading sont définis une fois pour les primitives migrées.
    - [x] Les écrans migrés respectent la palette/typographie V2 ; alertes sémantiques et contraste bleu/orange explicites, vérification navigateur clair/sombre.

- [ ] **[P1][A11Y][UI][A11Y-002] Standardiser feedback, erreurs et mouvement réduit**
  - Impact : moyen ; Effort : moyen ; Risque : faible
  - Dépendances : UI-001
  - Fichiers concernés : `components/{Common,Student,ErrorBoundary}/**`, composants Motion, `app/(site)/error/page.tsx`
  - Travail : composants état vide/skeleton/erreur/retry et règle `prefers-reduced-motion`; localiser les erreurs template.
  - Lot UX/UI : `Alert` annonce erreur/succès ; disponibilité vide, chargement, relance et conflit de réservation ; erreurs de paiement réessayables et libellés loading communs. Mouvement réduit existant conservé. Restent les autres écrans et formulaires métier.
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
  - Réalisé localement le 20 octobre : `/booking` entre dans le formulaire partagé réel ; les créneaux 2024 et le toast de confirmation fictive sont supprimés. La recette transactionnelle des disponibilités et confirmations reste liée à TECH-003/UX-003.
  - Critères d'acceptation :
    - [ ] Toute confirmation a une séance réellement créée et une référence.
    - [x] Aucun écran ne promet une réservation fictive dans le composant public remplacé.

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

## Backlog complémentaire SIKASCHOOL — demandes du 17 octobre 2026

Les onze cases principales ci-dessous sont ouvertes. Les critères devront être vérifiés lors des missions de réalisation ; aucune fonctionnalité n'est déclarée livrée ici. Les liens et chemins cités sont relatifs au dépôt, sauf les références Notion. Les livrables de communication seront produits et validés séparément de cette mise à jour Markdown.

### Critiques : intégrité des paiements, réservation, disponibilité DB et inscription

- [ ] **[P0][PAYMENT][SECURITY][SK-001] Finaliser Stripe**
  - Catégories : paiement, sécurité ; Impact : élevé ; Effort : élevé ; Risque : élevé (montants, crédits et droits).
  - Notion : https://app.notion.com/p/3fc173c57e048172b971e4d20bd74c78
  - État vérifié : Checkout existe pour packs, séances et abonnements, avec métadonnées élève/plan, codes promotionnels autorisés et création de facture pour les paiements uniques. Portail, consultation, signature webhook et handlers abonnement/remboursement existent. `addCredits` lit puis écrit le solde et le ledger sans transaction ni référence unique appliquée ; son contrôle d'existence ne bloque pas le replay. La migration initiale rend `stripe_checkout_session` unique, mais pas `stripe_invoice_id`, pourtant utilisé comme cible d'upsert. Le remboursement met seulement le paiement à `REFUNDED`. Certaines erreurs DB sont journalisées sans provoquer de retry.
  - Fichiers vérifiés : `lib/stripe.ts`, `lib/payments-catalog.ts`, `app/api/student/payments/checkout/route.ts`, `app/api/webhooks/stripe/route.ts`, `app/api/student/payments/portal/route.ts`, `app/api/student/payments/overview/route.ts`, `lib/student-access.ts`, `supabase/migrations/20260101120000_initial_schema.sql`, `supabase/migrations/20260912143000_move_users_to_supabase_auth.sql`, [STRIPE_SETUP.md](STRIPE_SETUP.md), [workflow paiements](workflows/04-payments.md).
  - Travail : auditer l'existant puis finaliser les parcours d'achat, renouvellement, échec, annulation, remboursement et accès aux factures ; réconcilier catalogue affiché, montants payés, ledger et droits. Faire réaliser l'atomicité dans TECH-002, y compris l'unicité de l'attribution par facture afin que deux types d'événements relatifs à une même facture ne créditent pas deux fois. Vérifier le statut de paiement avant attribution, les erreurs/retries DB et les événements désordonnés. Corriger ensuite les garanties excessives et les références `users` devenues `profiles` dans les guides. Préparer une checklist go-live avec responsable, configuration test/live, fiscalité, réconciliation et retour arrière.
  - Dépendances bloquantes : TECH-002 pour l'atomicité ; UX-002 et validation métier des prix, taxes, annulations et remboursements pour la recette commerciale. Coordination : TECH-010 pour les tests, TECH-011 et SK-008 pour les alertes/reprise. Le go-live et tout paiement réel nécessitent une décision explicite ultérieure.
  - Critères d'acceptation :
    - [ ] En environnement Stripe de test, packs, séances et abonnements couvrent succès, refus/échec, abandon/annulation, renouvellement et résiliation ; aucun retour navigateur ne crédite un achat.
    - [ ] Les tests de TECH-002 prouvent une transaction paiement/ledger/solde atomique ; replays, concurrence, interruption/retry et événements distincts pour une même facture ne créent ni double crédit ni perte.
    - [ ] Montants en centimes, devise, quantité/niveau des séances et éventuelles remises correspondent entre catalogue, Checkout, facture et DB ; les totaux se réconcilient sans double comptabilisation initiale d'abonnement.
    - [ ] Remboursements complets/partiels et crédits déjà consommés suivent une règle validée et testée ; les droits et soldes restent cohérents.
    - [ ] Factures/portail et routes de retour fonctionnent pour élève et parent lié ; tuteur, compte tiers et parent sans élève lié n'accèdent à aucun achat indu.
    - [ ] Les erreurs DB déclenchent le traitement de reprise prévu ; les guides sont alignés sur les preuves de test et le go-live reste conditionné à sa validation.

- [ ] **[P0][BUG][BOOKING][SK-003] Corriger la 404 lors de la réservation depuis un tuteur**
  - Catégories : bug, réservation ; Impact : élevé ; Effort : moyen ; Risque : élevé (régression de navigation ou d'autorisation).
  - Notion : https://app.notion.com/p/3fc173c57e0481c8a7e0f48bf2ebb3de
  - État vérifié : `/student/tutors` ouvre `CreateSessionModal` avec `preselectedTutorId`, puis soumet à `/api/sessions` ; `/family/tutors` réexporte la même page. `/booking` existe mais affiche encore le calendrier mock de 2024 (TECH-008). Aucune route de fiche tuteur dynamique publique/privée n'a été trouvée dans `app/`. La 404 signalée n'a pas été reproduite ; une API peut aussi renvoyer 404 pour un parent sans élève lié. Ne pas conclure à une route absente sans identifier la requête fautive.
  - Fichiers vérifiés : `app/student/tutors/page.tsx`, `app/family/tutors/page.tsx`, `components/Student/CreateSessionModal.tsx`, `app/api/sessions/route.ts`, `lib/student-access.ts`, `app/(site)/booking/page.tsx`, `components/Booking/BookingCalendar.tsx`, `components/Booking/TutorSelectionModal.tsx`, `auth.ts`, `proxy.ts`, `next.config.js`.
  - Travail : consigner d'abord URL exacte, page d'origine, clic, rôle/session, paramètres tuteur, appareil, réponse HTTP et chaîne de redirections, en distinguant 404 de page et d'API. Tracer le bouton ou l'éventuelle fiche concernée, puis corriger route, paramètres ou reprise après connexion selon la cause démontrée. Conserver le tuteur choisi sans contourner les contrôles d'assignation, de rôle et d'élève effectif.
  - Dépendances : reproduction documentée avant correction ; coordination avec TECH-008 pour la destination réelle de réservation et UX-001 si le CTA public traverse la modale partagée. Ne pas recopier leur refonte dans ce correctif.
  - Critères d'acceptation :
    - [ ] Le scénario initial et la requête 404 sont documentés avec résultat attendu/observé avant modification, puis couverts par un test de non-régression.
    - [ ] Desktop/mobile, connecté/non connecté et parent/élève aboutissent au parcours autorisé ; le tuteur choisi est conservé après navigation ou connexion.
    - [ ] Tuteur indisponible/supprimé, paramètre absent/invalide et parent sans élève lié produisent un état explicite avec reprise ; aucun contournement des autorisations n'est introduit.
    - [ ] Une demande réussie correspond à une séance persistée avec référence ; les tests interdisent la confirmation fictive du calendrier historique.

- [ ] **[P0][OPS][SUPABASE][SK-008] Contrôler la disponibilité de la base**
  - Catégories : exploitation, Supabase ; Impact : élevé ; Effort : moyen ; Risque : élevé (panne, secrets, reprise).
  - Notion : https://app.notion.com/p/3fc173c57e0481acbb96fda328d484c9
  - État vérifié : `lib/supabase.ts` expose les clients anon/service role et un détecteur d'erreurs réseau ; aucun health check DB dédié ni ordonnanceur de surveillance n'a été trouvé dans les fichiers examinés. Le README décrit l'hébergement et Supabase local/cloud, sans preuve de surveillance en production. `supabase/README.md` recommande une sauvegarde avant migration, sans exercice complet de restauration. Le GET `/api/admin/resend/health` envoie réellement un e-mail : il ne convient pas à une sonde DB non destructive.
  - Fichiers vérifiés : `lib/supabase.ts`, `app/api/student/dashboard/route.ts`, `app/api/sessions/route.ts`, `app/api/leads/first-session-slots/route.ts`, `app/api/webhooks/stripe/route.ts`, `app/api/admin/resend/health/route.ts`, `next.config.js`, `package.json`, `README.md`, `supabase/README.md`.
  - Travail : inventorier les dépendances DB des parcours critiques, puis définir une sonde serveur en lecture seule, bornée et sans retour de données métier, séparant app accessible et DB joignable. Proposition initiale à valider : toutes les 5 minutes, timeout 5 secondes, alerte après 3 échecs, rétablissement après 2 succès ; limiter charge et doublons. Désigner destinataire, escalade et maintenance. Documenter diagnostic, restauration, réconciliation des écritures interrompues et reprise des webhooks ; fixer RPO/RTO, rétention, chiffrement et emplacement des sauvegardes avec un responsable.
  - Dépendances : accès d'exploitation et environnement non productif ; validation des seuils, destinataires, RPO/RTO et moyens de sauvegarde disponibles. Coordination TECH-011 pour logs/alertes et TECH-010 pour la reproductibilité. Aucun outil payant ne sera activé sans validation.
  - Critères d'acceptation :
    - [ ] La sonde n'écrit pas en DB, n'envoie ni e-mail métier ni paiement et ne renvoie aucun secret ou donnée personnelle ; accès, timeout, cadence et charge sont documentés.
    - [ ] Une panne simulée hors production déclenche une seule alerte exploitable, puis une notification de rétablissement fiable ; délai mesuré, faux positifs et maintenance sont vérifiés.
    - [ ] Les logs corrélés restent sans secrets/PII ; le runbook nomme responsable, escalade, contrôles de santé et conditions de reprise.
    - [ ] Une sauvegarde est restaurée dans un environnement isolé ; intégrité, permissions, crédits/séances et RPO/RTO sont vérifiés, sans écriture sur la production.

- [ ] **[P0][BOOKING][ONBOARDING][SK-011] Choix différé du premier créneau**
  - Catégories : réservation, onboarding ; Impact : élevé ; Effort : élevé ; Risque : élevé (identité, doublons, parent/élève).
  - Notion : https://app.notion.com/p/3fc173c57e0481d184b1ec3cd6822850
  - État vérifié : `POST /api/leads` crée déjà le compte sans créneau ; la modale affiche ensuite les disponibilités, mais « Se connecter à mon espace » reste disponible sans réservation et la modale peut être fermée. Il manque un parcours explicite de choix ultérieur avec contexte durable et sécurisé. Le POST de créneau public identifie actuellement le demandeur par e-mail sans token/session ; pour un parent, il utilise directement son profil, à réconcilier avec l'élève effectif.
  - Fichiers vérifiés : `components/Booking/LeadCaptureModal.tsx`, `app/api/leads/route.ts`, `app/api/leads/first-session-slots/route.ts`, `lib/student-access.ts`, `lib/registration-emails.ts`, [onboarding](workflows/01-onboarding-auth.md), [séances](workflows/03-session-lifecycle.md), [WORKFLOWS.md](WORKFLOWS.md).
  - Travail : expliciter « Choisir mon créneau plus tard » après inscription et distinguer compte créé / première séance à planifier / réservation demandée. Conserver les seuls besoins utiles et proposer une reprise depuis l'espace connecté ou un lien vérifié à durée limitée. Revérifier disponibilités et élève effectif lors de la confirmation ; aucun créneau, hold permanent ou séance fictive à l'inscription seule. Distinguer notifications d'inscription, rappel de planification et confirmation réelle ; définir fréquence/expiration des rappels.
  - Dépendance bloquante : TECH-003 pour preuve d'identité, anti-abus et réservation atomique. Coordination UX-003 pour les étapes et TECH-008 pour le moteur réel ; SK-003 si la reprise passe par le choix d'un tuteur. Complément explicite à l'ordre historique de UX-003 : conserver un choix immédiat possible et ajouter la branche différée, sans recopier ni renuméroter UX-003. Ne pas créer de dépendance circulaire en attendant sa refonte complète.
  - Critères d'acceptation :
    - [ ] Parent et élève peuvent s'inscrire sans créneau et accéder à leur espace ; absence de disponibilité, fermeture ou erreur de chargement ne remet pas en cause l'inscription réussie.
    - [ ] Sans confirmation de créneau, aucune séance/assignation fictive ni crédit consommé n'est créé ; l'état « à planifier » ne bloque pas injustement les fonctions autorisées.
    - [ ] La reprise conserve les besoins utiles après déconnexion/changement d'appareil ; session autorisée ou lien vérifié sont requis. E-mail seul, jeton expiré/réutilisé et accès d'un tiers sont refusés.
    - [ ] La confirmation revérifie disponibilité et lien parent/élève ; double clic, deux onglets, replay et concurrence ne créent jamais deux premières séances ni deux assignations.
    - [ ] Notifications et e-mails distinguent inscription sans créneau et demande réellement enregistrée ; rappels ne se dupliquent pas. Tests parent/élève, desktop/mobile, réseau lent et indisponibilité passent avec preuve de non-régression P0.

### Produit/UX : traductions, contenus du site, stages et promotion

- [ ] **[P1][I18N][UX][SK-002] Homogénéiser les statuts français**
  - Catégories : traduction, UX ; Impact : moyen ; Effort : moyen ; Risque : moyen (sémantique et compatibilité FR/EN).
  - Notion : https://app.notion.com/p/3fc173c57e048139a176ff9c2d85bf52
  - État vérifié : `lib/translations.ts` fournit déjà FR/EN. Le dashboard élève et les séances admin traduisent déjà les cinq statuts principaux localement ; les paiements élève ont aussi un mapping. Des valeurs brutes restent rendues, notamment `payment.status` en administration et certains statuts de l'historique tuteur.
  - Fichiers vérifiés : `lib/translations.ts`, `app/student/page.tsx`, `app/tutor/page.tsx`, `app/tutor/administration/page.tsx`, `app/student/paiements/page.tsx`, `app/student/notifications/page.tsx`, `app/tutor/notifications/page.tsx`, `app/family/tutors/page.tsx`, `lib/registration-emails.ts`, [cycle des séances](workflows/03-session-lifecycle.md).
  - Travail : inventorier tous les rendus de statuts (dashboards, calendriers, historiques, paiements, notifications et e-mails), centraliser les libellés par domaine/langue et supprimer les fallbacks techniques visibles. Définir notamment PENDING → « En attente », SCHEDULED → « Programmée », IN_PROGRESS → « En cours », COMPLETED → « Terminée », CANCELLED → « Annulée », avec accord adapté à l'objet ; couvrir aussi paiements et abonnements. Préserver strictement valeurs DB/API et logique de transition.
  - Dépendances : glossaire métier FR/EN validé ; coordination UX-006 pour le vocabulaire, sans recopier la normalisation des liens.
  - Critères d'acceptation :
    - [ ] Aucun statut anglais/enum technique ne reste visible en français dans les écrans, notifications et e-mails inventoriés, pour élève, parent, tuteur et admin.
    - [ ] Un mapping centralisé par domaine et langue couvre tous les statuts recensés et un fallback français neutre pour une valeur inconnue ; les écrans déjà traduits ne régressent pas.
    - [ ] Tests de mapping et recette sur tous les rôles : filtres, badges, historiques et messages gardent leur sens ; les valeurs DB/API et les libellés anglais disponibles sont préservés.

- [ ] **[P1][UX][SEO][SK-006] Mettre à jour et recetter le site**
  - Catégories : UX, SEO, contenu ; Impact : élevé ; Effort : élevé ; Risque : moyen (informations commerciales, liens et identité).
  - Actualisation du 20 octobre : homepage V2, charte, pages publiques, footer, contact et tarifs d’accueil refondus ; les chiffres/remises périmés ne sont plus rendus sur l’accueil. Les URL publiques manquantes sont corrigées. Les constats du 17 octobre ci-dessous restent l’état initial ; voir la recette V2 pour les contrôles effectivement exécutés et leurs limites.
  - Notion : https://app.notion.com/p/3fc173c57e0481f59415d0601463a8e4
  - État vérifié : la homepage assemble déjà Hero, avis, promotion, méthode, chiffres, tarifs, FAQ et contact. Header et Footer existent ; le footer conserve des liens `#`. Des badges -15 % sont codés dans Pricing ; OpenGraph mentionne `.com` tandis que le README indique `.app`. Aucun `app/robots.ts` ou `app/sitemap.ts` n'a été trouvé. Les commandes qualité existent dans `package.json` ; elles n'ont pas été exécutées pour cette lecture documentaire.
  - Fichiers vérifiés : `app/(site)/page.tsx`, `app/(site)/head.tsx`, `app/layout.tsx`, `components/Hero/index.tsx`, `components/Header/index.tsx`, `components/Header/menuData.tsx`, `components/Footer/index.tsx`, `components/Pricing/index.tsx`, `components/Packs/index.tsx`, `lib/translations.ts`, `next.config.js`, `package.json`, [audit UX/UI](UX_UI_AUDIT.md), [audit technique](TECHNICAL_AUDIT.md).
  - Travail : établir un inventaire page/section, texte actuel, correction proposée, source, propriétaire, validation et liens/CTA à recetter. Vérifier offres, tarifs, coordonnées, preuves, mentions légales et campagnes périmées. Organiser la recette navigation, responsive, accessibilité, performance, identité visuelle et SEO. Faire réaliser la réorganisation par UX-004, la normalisation des liens par UX-006 et le canonique/metadata par TECH-012 ; SK-006 coordonne l'actualisation et la recette globale de leurs résultats.
  - Dépendances de clôture : UX-004, UX-006, TECH-012 et validation des contenus commerciaux ; UX-002 pour les prix et UX-005 pour les preuves. Coordination PERF-001/A11Y-001 pour mesures et accessibilité ; SK-004/SK-009 seulement si leurs offres futures sont incluses dans la livraison. La recette générale peut avancer sans campagne.
  - Critères d'acceptation :
    - [ ] Inventaire relu par les responsables : toutes les informations commerciales sont vérifiées et les promotions sans dates futures approuvées ont un état neutre prévu.
    - [ ] Chaque CTA et lien a une destination réelle ; parcours publics/authentifiés, ancres, menus et retours sont vérifiés desktop/mobile et au clavier.
    - [ ] Logo existant et identité officielle V2 sont respectés ; accessibilité, performances et SEO disposent d'une baseline, de résultats et d'écarts suivis dans leurs tickets existants.
    - [ ] `npm run lint`, `npm run type-check` et `npm run build` passent lors de la réalisation ; les résultats sont consignés avec la recette desktop/mobile et les critères de UX-004, UX-006 et TECH-012.

- [ ] **[P1][MARKETING][UX][SK-004] Stages d'été et accès aux réseaux sociaux**
  - Catégories : marketing, UX ; Impact : élevé ; Effort : moyen ; Risque : moyen (offre périmée ou parcours trompeur).
  - Notion : https://app.notion.com/p/3fc173c57e0481aca354eb1ecbd899a3
  - État vérifié : malgré son nom, `StagePromo` affiche actuellement l'offre de rentrée -15 % via les traductions et émet `lead:open` avec la campagne `back_to_school`. Ce composant n'est donc pas une inscription aux stages d'été. Le Footer comporte déjà des liens Instagram et WhatsApp ; ils restent à recetter et leurs comptes officiels à confirmer.
  - Fichiers vérifiés : `components/StagePromo/index.tsx`, `app/(site)/page.tsx`, `components/Header/index.tsx`, `components/Header/menuData.tsx`, `components/Footer/index.tsx`, `lib/translations.ts`, `app/(site)/head.tsx`, `app/(site)/ClientProviders.tsx`.
  - Travail : faire confirmer offre, public, prochaines dates futures, lieux/en ligne, tarifs, capacité et visuels des stages ; spécifier présentation et parcours d'inscription avec responsable du traitement. Prévoir campagne distincte de la rentrée, activation datée et fallback neutre. Inventorier et recetter les liens sociaux existants, définir les accès manquants après validation des comptes ; traiter les changements partagés de navigation dans UX-006.
  - Dépendances : validation de l'offre et des dates futures par l'équipe ; coordination UX-004 (place de campagne), UX-006 (liens), UX-001 (CTA/modale), TECH-012 (SEO). Dépend de SK-011/TECH-003 si le parcours retenu utilise l'inscription lead avec choix différé ; SK-001 seulement si un paiement est retenu.
  - Critères d'acceptation :
    - [ ] Offre, dates, lieux, tarifs, capacité et visuels approuvés ; aucun stage d'été 2026 passé n'est présenté comme ouvert.
    - [ ] CTA d'inscription et liens sociaux officiels fonctionnent sur desktop/mobile ; cas complet, indisponible et hors période ont une réponse claire.
    - [ ] Clavier, focus, noms accessibles des liens/icônes, contraste et métadonnées sont vérifiés ; l'identité SIKASCHOOL est conservée.
    - [ ] Activation/désactivation par période et fuseau horaire validés sont testées, avec fallback neutre ; toute ouverture future attend une validation humaine des dates.

- [ ] **[P1][PROMO][PAYMENT][SK-009] Offre de rentrée -15 %**
  - Catégories : promotion, paiement ; Impact : élevé ; Effort : moyen ; Risque : élevé (prix, fiscalité et validité).
  - Notion : https://app.notion.com/p/3fc173c57e04810194acd02523bc2bbd
  - État vérifié : Pricing et les traductions affichent déjà -15 %, sans période contrôlée ; Checkout autorise déjà `allow_promotion_codes: true` pour paiement unique et abonnement. Les prix sont définis dans les deux catalogues et envoyés via `price_data`. Cela ne prouve ni l'existence d'un coupon Stripe configuré ni l'application d'une remise cohérente en production.
  - Fichiers vérifiés : `components/Pricing/index.tsx`, `components/Packs/index.tsx`, `components/StagePromo/index.tsx`, `lib/translations.ts`, `lib/payments-catalog.ts`, `lib/stripe.ts`, `app/api/student/payments/checkout/route.ts`, [STRIPE_SETUP.md](STRIPE_SETUP.md).
  - Travail : faire approuver périmètre des formules, prix de référence, éligibilité, début/fin/fuseau, nombre d'utilisations, durée sur abonnement, non-cumul, taxe, remboursement et CGV. Préparer coupon/promotion compatible avec le catalogue réellement utilisé, puis affichage du prix avant/après, conditions et désactivation hors période. Choisir avec SK-001 si des Stripe Prices persistants sont nécessaires ; ne pas supposer qu'autoriser la saisie de codes applique automatiquement -15 %.
  - Dépendances bloquantes : SK-001 et UX-002 pour la fiabilité/cohérence tarifaire ; nouvelle décision commerciale et validation des conditions légales. Coordination SK-006 pour l'affichage et la recette. Aucune offre de septembre 2026 ne sera activée sans nouvelle décision ; prévoir une période future approuvée.
  - Critères d'acceptation :
    - [ ] Périmètre, dates futures, fuseau, éligibilité, non-cumul, taxes, durée et CGV sont approuvés par les responsables avant toute activation.
    - [ ] Pour chaque formule éligible, calcul/arrondis du -15 %, prix affiché, total Checkout et facture concordent ; les crédits correspondent à l'offre achetée.
    - [ ] Tests Stripe en mode test : coupon valide, invalide, expiré, pas encore actif, hors périmètre, limite atteinte et non-cumul ; durée de remise d'abonnement et remboursement sont vérifiés.
    - [ ] Hors période, code et affichage promotionnel sont désactivés, avec prix normal explicite ; les anciennes mentions dans les leads/notifications sont recensées et alignées.

### Communication/acquisition : vidéo, Canva et YouTube Ads

- [ ] **[P2][CONTENT][VIDEO][SK-005] Vidéo pour les stages**
  - Catégories : production de contenu, vidéo ; Impact : moyen ; Effort : moyen ; Risque : moyen (droits et mineurs).
  - Notion : https://app.notion.com/p/3fc173c57e04812f8cf3d212b90fcbd9
  - État vérifié : les références éditoriales de l'offre se trouvent dans `StagePromo` et les traductions ; ces fichiers ne constituent ni une vidéo ni un brief de tournage validé. Il s'agit d'une production de contenu, sans fonctionnalité à coder.
  - Fichiers vérifiés pour le contexte : `components/StagePromo/index.tsx`, `lib/translations.ts`, `app/(site)/page.tsx`, `components/Footer/index.tsx`.
  - Travail : produire brief de tournage, script/storyboard séquencé, liste de plans, voix/texte, CTA et destination ; définir master YouTube 16:9 et déclinaisons Shorts/réseaux 9:16 avec durée, résolution, zones sûres, miniature et exports attendus. Prévoir sous-titres relus et fichier de sous-titres séparé ; nommer responsables de tournage, montage et validation.
  - Dépendance bloquante : SK-004 pour l'offre, les prochaines dates et le CTA approuvés ; validation des droits visuels/musiques, des personnes filmées et des autorisations parentales pour les mineurs. Coordination SK-007 si la vidéo sert de création publicitaire.
  - Critères d'acceptation :
    - [ ] Script, storyboard, plans, planning de tournage, CTA, formats/durées et livrables/export sont définis et approuvés, avec liens de suivi des livrables réels.
    - [ ] Offre et dates correspondent à SK-004 ; toutes les variantes et sous-titres sont relus et adaptés au mobile.
    - [ ] Droits des images/musiques et autorisations des personnes, dont représentants légaux des mineurs, sont consignés avant usage.
    - [ ] Master, déclinaisons, miniature et sous-titres reçoivent la validation éditoriale avant toute publication ; une checklist Markdown ne vaut pas production de la vidéo.

- [ ] **[P2][CONTENT][SOCIAL][SK-010] Carrousel Canva rentrée**
  - Catégories : contenu, réseaux sociaux ; Impact : moyen ; Effort : faible ; Risque : moyen (offre, droits et publication).
  - Notion : https://app.notion.com/p/3fc173c57e04813dbe9fe6fe2b1ab5da
  - État vérifié : l'identité et les mentions de rentrée existent dans les composants/traductions ; aucun fichier Canva n'est produit par cette roadmap.
  - Fichiers vérifiés pour le contexte : `components/Pricing/index.tsx`, `components/StagePromo/index.tsx`, `components/Footer/index.tsx`, `lib/translations.ts`.
  - Travail : définir brief, plan des slides (accroche → bénéfice → offre → conditions → CTA), textes, visuels autorisés, palette/logo SIKASCHOOL, formats réseaux, zones sûres et légende. Prévoir création effective dans Canva, lien éditable et accès de l'équipe, exports et texte alternatif ; programmer seulement après validation de la période future de l'offre.
  - Dépendance bloquante : SK-009 pour périmètre, dates futures, prix et conditions du -15 % ; validation éditoriale/droits. Coordination SK-006 pour la destination du CTA.
  - Critères d'acceptation :
    - [ ] Brief, slides, textes, formats et visuels sont approuvés et préservent l'identité SIKASCHOOL ; lisibilité mobile et droits sont vérifiés.
    - [ ] Un véritable lien Canva éditable accessible à l'équipe est livré, avec exports aux dimensions retenues, légende et texte alternatif.
    - [ ] Mentions -15 %, dates et conditions correspondent strictement à SK-009 ; CTA mène à la bonne offre et aucun contenu périmé n'est annoncé actif.
    - [ ] Validation finale obtenue avant publication ; l'ajout de cette tâche ne prétend pas avoir créé ou publié le fichier Canva.

- [ ] **[P2][ACQUISITION][ADS][SK-007] Campagne YouTube Ads**
  - Catégories : acquisition, publicité ; Impact : moyen ; Effort : moyen ; Risque : élevé (budget, consentement et mineurs).
  - Notion : https://app.notion.com/p/3fc173c57e0481a3ba7aefb4e624841f
  - État vérifié : des pages publiques et CTA existent ; les fichiers consultés ne démontrent pas de campagne Ads ni de suivi de conversions opérationnel. TECH-011 porte déjà le funnel et le consentement ; ne pas recréer une seconde instrumentation indépendante.
  - Fichiers vérifiés pour le contexte : `app/(site)/page.tsx`, `components/Hero/index.tsx`, `components/StagePromo/index.tsx`, `components/Footer/index.tsx`, `lib/translations.ts`, [audit technique — TECH-011](TECHNICAL_AUDIT.md).
  - Travail : rédiger un brief d'audiences familiales appropriées, objectifs, messages, créations, landing pages et parcours jusqu'au lead ; définir budget plafond/journalier et durée à approuver, UTM, conversions avec consentement, KPI (leads qualifiés, coût par lead, taux de conversion) et seuils d'arrêt. Planifier une expérimentation A/B avec hypothèse, variantes, métrique et règle de décision ; nommer responsables du suivi et de l'approbation.
  - Dépendance bloquante : SK-006 pour les landing pages et CTA recettés ; TECH-011 pour la mesure/consentement concernés. SK-005 si la vidéo des stages est utilisée, SK-004 si la campagne annonce les stages, SK-009 si elle annonce -15 %. Budget et ciblage attendent validation explicite avant tout lancement.
  - Critères d'acceptation :
    - [ ] Brief complet : audiences familiales, objectifs, créations, landing pages, hypothèse A/B, durée et seuils d'arrêt approuvés.
    - [ ] Budget, plafonds et responsable sont validés ; aucune campagne n'est lancée ou financée automatiquement.
    - [ ] Suivi UTM/conversions recetté avec et sans consentement, sans PII dans les URL ; RGPD/consentement et absence de ciblage inapproprié de mineurs sont validés.
    - [ ] Tableau de mesure et règle de qualification permettent de calculer coût par lead et conversion, avec traitement des doublons ; créations et dates futures approuvées avant publication.

# Quick Wins

Ces tâches sont à faible effort/faible risque ; elles ne remplacent pas les P0 sécurité.

- [x] [P1][UX] Corriger « À la séance » et « Qui sommes-nous ? » dans `lib/translations.ts`.
- [x] [P1][UX][A11Y] Remplacer les `href="#"` du footer par `mailto:` et `/donnees-personnelles`.
- [x] [P1][A11Y] Rendre la cible de skip link focalisable et supprimer les `<main>` imbriqués.
- [x] [P1][A11Y] Ajouter titre, `aria-modal`, Échap et retour focus à `TutorSelectionModal` (primitive partagée ; composant non monté, recette statique).
- [x] [P1][UX] Retirer le composant CTA anglais non utilisé ou le localiser avant réemploi.
- [x] [P1][UX] Localiser `app/(site)/error/page.tsx` et supprimer « Solid SaaS Boilerplate ».
- [x] [P1][UX] Supprimer le calendrier 2024 de la route publique ou le rediriger vers le vrai parcours.
- [ ] [P1][UI] Ajouter les `sizes` aux images responsives les plus visibles, après mesure.
- [x] [P1][UI] Définir `prefers-reduced-motion` pour les animations d'entrée non essentielles.
- [ ] [P1][DX] Ajouter `.env.example` sans secrets, conforme au README.
- [x] [P1][DX] Remplacer `next lint` déprécié par l'ESLint CLI dans les scripts, après validation Next.
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

### Compléments du 17 octobre 2026 — disponibilité, langues et campagnes

**Disponibilité DB (SK-008, coordination TECH-011) :** faux positifs, sonde trop coûteuse, divulgation de secrets et sauvegarde inutilisable. Vérifier panne/rétablissement et restauration uniquement hors production ; conserver une preuve de lecture seule, des seuils/alertes et des RPO/RTO approuvés. Ne pas réutiliser le health check Resend qui envoie un e-mail.

**Reprise d'inscription et 404 (SK-011/SK-003, TECH-003/TECH-008/UX-003) :** compte créé confondu avec séance réservée, perte du tuteur ou du contexte après connexion, réservation pour un tiers et mauvais rattachement parent/élève. Tester absence de créneau, reprise sur un autre appareil, liens expirés, rôles, concurrence et refus d'accès. L'URL de la 404 reste à établir avant correction ; la branche différée complète l'ordre historique de UX-003.

**Paiement et remise (SK-001/SK-009, TECH-002/UX-002) :** unicité insuffisante par event seul lorsque deux événements portent une même facture, upsert facture sans contrainte adaptée, erreurs DB absorbées, remboursements sans ajustement des droits, écart UI/Checkout et cumul non voulu. Étendre la recette existante à ces cas, aux coupons hors période et aux factures initiales/récurrentes ; le go-live n'est pas réputé validé par la documentation.

**Traductions (SK-002, UX-006) :** modifier les enums par erreur ou masquer une valeur inconnue sous un statut de succès. Tester mapping, fallback neutre, FR/EN et tous les rôles sans changer les contrats DB/API.

**Communication (SK-004 à SK-007, SK-009/SK-010) :** dates d'été/rentrée passées, promesse -15 % non approuvée, droits des visuels/musiques, autorisations pour mineurs, fuite de données via tracking et dépenses publicitaires. Les briefs peuvent avancer ; activation/publication exige dates futures, offre, droits, consentement et budget validés. Canva et vidéo restent des livrables de production distincts ; cette roadmap ne les crée pas.

# Definition of Done

Une tâche UX/UI ou technique est terminée seulement si :

- [ ] Desktop validé.
- [ ] Mobile et responsive validés aux breakpoints pertinents.
- [ ] Navigation clavier validée ; lecteur d'écran validé quand pertinent.
- [ ] Loading, empty, success et error states présents lorsque pertinents.
- [ ] Les valeurs utilisateur sont préservées après une erreur récupérable.
- [ ] Logo existant conservé et nouvelles couleurs officielles V2 appliquées conformément à l’addendum.
- [ ] La sécurité, les permissions et données personnelles sont revues si la tâche les touche.
- [ ] TypeScript, lint, format et build passent.
- [ ] Tests unitaires/intégration/E2E concernés passent ; test de non-régression ajouté pour tout P0.
- [ ] Aucun warning console ajouté, logs sans secret ni mot de passe.
- [ ] Critères d'acceptation, analytics et documentation concernés sont mis à jour.
