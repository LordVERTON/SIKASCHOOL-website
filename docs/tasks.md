# SikaSchool — Roadmap et tâches

> SikaSchool — Documentation de référence

**Last updated:** 2026-10-10
**Status:** Active
**Source of truth:** backlog unique, statuts de réalisation et critères de validation.

## Navigation

[Product](./PRD.md) · [Architecture](./architecture.md) · [Rules](./Rules.md) · [Design](./design.md) · [Tasks](./tasks.md) · [Memory](./memory.md)

## 1. Vue d'ensemble

Objectif : fiabiliser la plateforme puis livrer une V2 frontend cohérente. P0 = sécurité/intégrité ou blocage critique ; P1 = parcours/qualité ; P2 = optimisation ; P3 = options. Les priorités ne valent pas autorisation de déploiement. Les phases sont des jalons, pas une obligation de terminer chaque option avant la suivante.

Les 22 IDs historiques TECH/UX/UI/A11Y/PERF sont conservés. Les 50 numéros de l'ancienne feuille UX sont des **alias**, fusionnés dans une tâche canonique ; pas de second ticket pour le même travail. Les critères ci-dessous ont été migrés, les anciennes cases cochées ne sont pas des tests réalisés dans cette mission. Un statut TODO peut signifier « correction présente, recette restante ». Aucun développement V2 n'est IN_PROGRESS.

### Vue synthétique

- **Immédiatement :** TECH-013 (2FA), TECH-014 (liaison famille), TECH-015 (mutation publique), TECH-002 (crédits), TECH-003 (réservation). TECH-016 reste également P0 et ne doit pas être oublié.
- **En cours :** aucun chantier applicatif attesté ; la consolidation documentaire est le dernier travail terminé, voir DOC-001 après validation.
- **Bloqué :** UX-002 (conditions), UX-005 (preuves/droits), TECH-012 (domaine), TECH-019 (règles séance/crédits), UX-007 (campagne), UX-008 (boîte/domaine), OPS-001 (configuration et validation lancement), OPT-001/002/003 (décisions optionnelles).
- **Terminé :** voir DOC-001 et memory pour les contrôles réellement exécutés ; corrections historiques de TECH-001 et UI partiellement présentes mais recette non établie.
- **Décisions attendues :** politique essai/annulation/remboursement/crédits, preuve parent/élève et cardinalité, accès parent en vidéo, domaine canonique, preuves marketing, rétention/quotas IA, éventuel Egress.

Risques : toute modification des paiements doit vérifier solde/ledger, toute modification booking doit préserver saisie/identité/concurrence, toute migration de composants doit vérifier contrastes/CTA, tout refactor d'autorisation doit couvrir inter-rôles et inter-utilisateurs. TECH-010 pose le filet de tests ; ne pas attendre un refactor global pour corriger un P0 avec un test ciblé.

### Traçabilité des 50 items historiques

`[x] historique` indique seulement la case de l'ancienne feuille. Les critères ont été rattachés à la tâche canonique, sans reprendre ses anciennes affirmations d'état comme faits actuels.

| Alias historique | Intitulé                                                         | Case historique | Tâche canonique |
| ---------------- | ---------------------------------------------------------------- | --------------- | --------------- |
| 01               | Hero : rendre le H1 explicite.                                   | [x] historique  | UX-004          |
| 02               | Hero : expliciter la différenciation.                            | [x] historique  | UX-004          |
| 03               | CTA : instaurer un CTA primaire unique.                          | [x] historique  | UX-001          |
| 04               | CTA : instaurer un CTA secondaire unique.                        | [x] historique  | UX-006          |
| 05               | Conversion : retirer l’e-mail du hero.                           | [x] historique  | UX-001          |
| 06               | Hero : ajouter une réassurance vérifiable.                       | [x] historique  | UX-005          |
| 07               | Contenu : rendre les campagnes saisonnières configurables.       | [ ]             | UX-007          |
| 08               | Copywriting : fixer la cible de chaque bloc.                     | [ ]             | UX-004          |
| 09               | Copywriting : remplacer les formulations génériques.             | [ ]             | UX-004          |
| 10               | Homepage : réordonner selon la décision.                         | [ ]             | UX-004          |
| 11               | Navigation : limiter les destinations principales.               | [ ]             | UX-006          |
| 12               | Navigation : uniformiser les intitulés.                          | [ ]             | UX-006          |
| 13               | Navigation : clarifier l’état actif.                             | [ ]             | UX-006          |
| 14               | Navigation : vérifier le retour accueil du logo.                 | [x] historique  | UX-006          |
| 15               | Terminologie : normaliser les offres.                            | [ ]             | UX-002          |
| 16               | Packs : faire du niveau l’information principale.                | [x] historique  | UX-002          |
| 17               | Tarifs : afficher le prix unitaire.                              | [x] historique  | UX-002          |
| 18               | Tarifs : afficher le coût effectif par séance.                   | [x] historique  | UX-002          |
| 19               | Tarifs : afficher l’économie réelle.                             | [ ]             | UX-002          |
| 20               | Tarifs : définir « sans engagement ».                            | [ ]             | UX-002          |
| 21               | Tarifs : uniformiser les cartes.                                 | [ ]             | UX-002          |
| 22               | Tarifs : marquer une formule recommandée seulement si justifiée. | [ ]             | UX-002          |
| 23               | Tuteurs : créer des profils de confiance.                        | [ ]             | UX-005          |
| 24               | Tuteurs : expliquer la sélection.                                | [ ]             | UX-005          |
| 25               | Grandes écoles : contextualiser les logos.                       | [ ]             | UX-005          |
| 26               | Témoignages : remonter les preuves sociales.                     | [x] historique  | UX-005          |
| 27               | Témoignages : ajouter du contexte.                               | [ ]             | UX-005          |
| 28               | Preuves : sourcer les statistiques.                              | [ ]             | UX-005          |
| 29               | Crédibilité : privilégier les photos authentiques.               | [ ]             | UX-005          |
| 30               | Contact : utiliser l’adresse du domaine.                         | [ ]             | UX-008          |
| 31               | Typographie : documenter une échelle globale.                    | [ ]             | UI-001          |
| 32               | Typographie : limiter la largeur des textes longs.               | [ ]             | UI-001          |
| 33               | Spacing : créer une échelle réutilisable.                        | [ ]             | UI-001          |
| 34               | Sections : renforcer la séparation spatiale.                     | [ ]             | UI-001          |
| 35               | Composants : standardiser les cartes.                            | [ ]             | UI-001          |
| 36               | Boutons : standardiser les variantes.                            | [ ]             | UI-001          |
| 37               | Mobile : assurer des cibles tactiles confortables.               | [x] historique  | UI-001          |
| 38               | Accessibilité : rendre le focus visible.                         | [x] historique  | A11Y-001        |
| 39               | Accessibilité : valider tous les parcours au clavier.            | [ ]             | A11Y-001        |
| 40               | Formulaires : fournir des labels persistants.                    | [ ]             | UX-003          |
| 41               | Formulaires : réduire les champs avant réservation.              | [ ]             | UX-003          |
| 42               | Formulaires : découper la réservation en étapes.                 | [ ]             | UX-003          |
| 43               | Formulaires : indiquer les champs requis/facultatifs.            | [ ]             | UX-003          |
| 44               | Formulaires : afficher des erreurs actionnables.                 | [ ]             | UX-003          |
| 45               | Formulaires : conserver les valeurs après erreur.                | [ ]             | UX-003          |
| 46               | Images : corriger les textes alternatifs.                        | [ ]             | A11Y-002        |
| 47               | Performance : optimiser l’élément LCP du hero.                   | [ ]             | PERF-001        |
| 48               | Performance : servir des images responsives.                     | [ ]             | PERF-001        |
| 49               | Performance : empêcher les décalages de mise en page.            | [ ]             | PERF-001        |
| 50               | Validation UX : mesurer et tester les lots.                      | [ ]             | TECH-011        |

## Phase 0 — Sécurité et fiabilité

### [TECH-001] Corriger la prise de contrôle de compte dans le lead public

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** SECURITY
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/api/leads/route.ts` - `components/Booking/LeadCaptureModal.tsx` - `lib/registration-emails.ts` - `docs/PRD.md`
- **Contexte :** Correction historique du rôle/mot de passe lead confirmée dans le code ; recette et rate limit encore absents. Ne pas confondre avec la modification publique de coordonnées TECH-016.
- **Objectif :** Corriger la prise de contrôle de compte dans le lead public.
- **Implémentation prévue :** le mot de passe provisoire aléatoire n’est jamais exposé ; le lien de définition utilise les tokens recovery natifs de Supabase Auth. Les comptes existants ne subissent aucune modification de rôle ou d’identifiants.
- **Critères d'acceptation :**
  - [ ] La réponse API ne contient jamais un mot de passe.
  - [ ] Un e-mail existant ne peut ni modifier rôle ni mot de passe sans authentification ou lien signé.
  - [ ] Les réponses ne révèlent pas si l’e-mail disposait déjà d’un compte.
  - [ ] La route doit encore être limitée en débit au niveau de l’infrastructure.
- **Tests :**
  - [ ] E-mail existant, nouveau, admin, parent et tuteur
  - [ ] Replay/lien expiré et rate limit
  - [ ] Test d'intégration sans fuite de mot de passe dans logs/réponse
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-002] Rendre la comptabilisation Stripe atomique et réellement idempotente

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** SECURITY
- **Impact :** High
- **Effort :** High
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/api/webhooks/stripe/route.ts` - `supabase/migrations/20260101120000_initial_schema.sql` - `docs/PRD.md`
- **Contexte :** addCredits ne déduplique pas et écrit solde/ledger séparément ; invoice_id sans UNIQUE ; erreurs DB avalées. Le code courant confirme le risque historique.
- **Objectif :** Rendre la comptabilisation Stripe atomique et réellement idempotente.
- **Implémentation prévue :** persister un `stripe_event_id` ou une référence unique d'attribution dans le ledger, avec contrainte unique, puis effectuer paiement/ledger/solde dans une transaction SQL ou RPC atomique. Retourner immédiatement si l'événement a déjà été appliqué ; formaliser remboursement et consommation des crédits dans le même ledger.
- **Critères d'acceptation :**
  - [ ] Le même événement Stripe répété N fois ne change le solde qu'une fois.
  - [ ] Deux événements différents concurrentiels produisent le bon solde.
  - [ ] Paiement, ledger et solde sont cohérents après erreur/retry.
  - [ ] Deux événements invoice.paid et invoice.payment_succeeded de la même facture ne créditent qu’une attribution.
  - [ ] Toute erreur DB financière empêche un acquittement de succès et reste rejouable.
  - [ ] Contrainte unique invoice, statut réellement payé et remboursement partiel traités selon décision métier.
- **Tests :**
  - [ ] Tests d'intégration Stripe CLI : paiement, abonnement, remboursement, replay
  - [ ] Tests de concurrence DB
  - [ ] Réconciliation d'un solde contre le ledger
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-003] Protéger et limiter le workflow de première séance public

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** SECURITY
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/api/leads/first-session-slots/route.ts` - `app/api/leads/route.ts` - `components/Booking/LeadCaptureModal.tsx`
- **Contexte :** POST public par e-mail, divergences grille GET/POST, conflits chevauchants mal bornés, écriture parent comme élève et absence de transaction.
- **Objectif :** Protéger et limiter le workflow de première séance public.
- **Implémentation prévue :** émettre après vérification e-mail un token opaque, court et lié au lead, niveau/matière ; exiger ce token au POST. Ajouter limitation IP/e-mail, validation métier des niveaux/matières, slot hold ou contrainte d'exclusion/transaction DB pour éviter le double booking.
- **Critères d'acceptation :**
  - [ ] Un visiteur ne peut pas réserver au nom d'un e-mail tiers.
  - [ ] Deux réservations du même créneau n'aboutissent jamais.
  - [ ] Les erreurs 400/409 sont actionnables et l'état UI est conservé.
  - [ ] GET et POST appliquent même horizon, durée, horaires et fuseau ; overlap inclut séances commencées avant le slot.
  - [ ] Le parent ne devient pas student_id sans décision et résolution explicite.
- **Tests :**
  - [ ] Token absent/expiré/réutilisé
  - [ ] Deux POST concurrents
  - [ ] Limitation de débit et absence de fuite de données
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-006] Rendre l'autorisation cohérente et indépendante d'une liste d'e-mails

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** SECURITY
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `proxy.ts` - `lib/admin-permissions.ts` - `auth.ts` et `lib/auth.ts` - `app/api/admin/**`
- **Contexte :** Privilèges tuteur par e-mails codés, proxy UI exclut API, rôle JWT mémorisé. Politique de révocation à recetter.
- **Objectif :** Rendre l'autorisation cohérente et indépendante d'une liste d'e-mails.
- **Implémentation prévue :** faire du rôle ou d'une permission persistée la source unique, retirer le bypass par e-mail après migration contrôlée, et fournir des gardes de route standardisés (`requireUser`, `requireRole`, `requireCapability`). Auditer exhaustivement les API par matrice rôle/ressource/action.
- **Critères d'acceptation :**
  - [ ] Aucun privilège ne dépend d'une adresse codée dans le bundle.
  - [ ] Chaque route API a une politique d'authentification/autorisation explicite.
  - [ ] Un test négatif couvre les accès inter-rôles et inter-utilisateurs.
- **Tests :**
  - [ ] Vérifier les critères TECH-006 sur les fichiers ciblés, puis lint/type-check et intégration des consommateurs modifiés ; consigner preuve et résultat.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-007] Réduire dette dépendances et compléter les en-têtes de sécurité

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** SECURITY
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `package.json`, `package-lock.json` - `next.config.js` - `SECURITY.md` - `scripts/security-check.js`
- **Contexte :** Next est désormais 16.3.4, Nodemailer 8.0.11 ; les 15 vulnérabilités de septembre ne sont pas un état actuel. En-têtes locaux incomplets versus anciennes affirmations.
- **Objectif :** Réduire dette dépendances et compléter les en-têtes de sécurité.
- **Implémentation prévue :** trier les alertes par chemin exploitable et mise à jour compatible, d'abord Next.js. Mettre à jour par petits lots avec build/tests, puis aligner `SECURITY.md` sur la configuration effective. Définir CSP par inventaire des sources (Stripe, Supabase, LiveKit, Mercure, Pexels) et HSTS uniquement au niveau production HTTPS.
- **Critères d'acceptation :**
  - [ ] Plus aucune vulnérabilité critique connue dans le lockfile validé.
  - [ ] Les en-têtes déployés et la documentation correspondent.
  - [ ] CSP est testée sans casser Stripe/LiveKit.
- **Tests :**
  - [ ] Vérifier les critères TECH-007 sur les fichiers ciblés, puis lint/type-check et intégration des consommateurs modifiés ; consigner preuve et résultat.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [UX-001] Une seule source et un seul propriétaire pour l'ouverture de réservation

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** UX
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `components/Hero/index.tsx` - `app/(site)/ClientProviders.tsx` - `components/Header/index.tsx` - `components/StagePromo/index.tsx` - `components/Booking/LeadCaptureModal.tsx`
- **Contexte :** Hero et ClientProviders écoutent lead:open et rendent chacun LeadCaptureModal.
- **Objectif :** Une seule source et un seul propriétaire pour l'ouverture de réservation.
- **Implémentation prévue :** conserver une seule modale dans le provider du site ; exposer une action typée via contexte ou prop de composition. Centraliser le préremplissage et la campagne dans cet unique contrôleur.
- **Critères d'acceptation :**
  - [ ] Un clic CTA ouvre exactement une modale.
  - [ ] Fermer, Échap et retour de focus fonctionnent depuis chaque CTA.
  - [ ] Le CTA garde la source/campagne uniquement pour l'analytics, sans modifier le parcours.
  - [ ] Alias historique 03 : tous les CTA d’acquisition primaires ont le même libellé et le même résultat.
  - [ ] Alias historique 05 : aucun champ personnel n’est visible dans le hero ; la réservation conserve un préremplissage si nécessaire.
- **Tests :**
  - [ ] Desktop et mobile
  - [ ] Clavier, Échap, tabulation
  - [ ] Lecteur d'écran
  - [ ] Alias 03 : desktop/mobile, clavier, suivi du clic.
  - [ ] Alias 05 : desktop/mobile, clavier, régression création de lead.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**03 — CTA : instaurer un CTA primaire unique.** centraliser un libellé tel que « Réserver ma séance d’essai gratuite » et une action d’ouverture de réservation. Dépendance métier/source : décision métier sur l’intitulé et l’éligibilité de l’essai.

**05 — Conversion : retirer l’e-mail du hero.** remplacer le formulaire par le CTA primaire ; recueillir les données au moment opportun dans le parcours de réservation. Dépendance métier/source : mesure de conversion (item 50) et validation marketing.

### [A11Y-001] Corriger la structure de landmarks et les dialogues

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** UX
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [UX-001] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/(site)/layout.tsx` - `app/(site)/{page,booking/page,book-online/page,packs/page}.tsx` - `components/Accessibility/SkipLink.tsx` - `components/Booking/{LeadCaptureModal,TutorSelectionModal}.tsx`
- **Contexte :** Landmarks main imbriqués ; focus trap/Échap/restauration présents dans LeadCaptureModal, contrairement à ancien audit ; double modale reste un risque.
- **Objectif :** Corriger la structure de landmarks et les dialogues.
- **Implémentation prévue :** un seul landmark `main` par document ; skip link rendu immédiatement avec une cible `tabIndex={-1}`. Standardiser le dialog natif ou un composant accessible : focus initial, boucle de tabulation, Échap, overlay, retour du focus et libellé/titre associé.
- **Critères d'acceptation :**
  - [ ] Navigation clavier complète sans atteindre l'arrière-plan d'une modale.
  - [ ] Le focus revient au bouton lanceur après fermeture.
  - [ ] La hiérarchie de titres et landmarks est unique et logique.
  - [ ] Alias historique 38 : chaque élément interactif focalisé est visible et non masqué par le header.
  - [ ] Alias historique 39 : réservation, connexion, menu, modales et FAQ sont réalisables sans souris.
- **Tests :**
  - [ ] NVDA/VoiceOver, Tab/Shift+Tab/Échap
  - [ ] Zoom 200 % et reflow à 320 px
  - [ ] Alias 38 : Tab/Shift+Tab sur desktop, mobile clavier, thème clair/sombre.
  - [ ] Alias 39 : parcours Tab/Entrée/Espace/Échap, lecteur d’écran.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**38 — Accessibilité : rendre le focus visible.** définir un focus ring global visible avec les couleurs existantes et un `scroll-margin-top` compatible header sticky. Dépendance métier/source : inventaire des contrôles, item 36.

**39 — Accessibilité : valider tous les parcours au clavier.** établir une matrice de navigation clavier, ajouter piège de focus/retour de focus dans les modales si manquants. Dépendance métier/source : item 38 ; tests E2E à choisir.

### [TECH-013] Fermer tous les chemins de contournement 2FA et durcir les secrets

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** SECURITY
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** auth.ts ; app/api/auth ; lib/sms-2fa.ts ; context/AuthContext.tsx
- **Contexte :** authorize ne vérifie pas SMS ; register renvoie le mot de passe soumis ; OTP faible et fallback. Reset admin renvoie aussi tempPassword ; ce comportement doit être traité séparément du recovery public.
- **Objectif :** Fermer tous les chemins de contournement 2FA et durcir les secrets.
- **Implémentation prévue :** Centraliser preuve MFA à la frontière qui crée une session ; générateur cryptographique, secret obligatoire, limitation essais/envois, réponse inscription sans mot de passe ; vérifier les sessions Supabase navigateur.
- **Critères d'acceptation :**
  - [ ] Aucun chemin Credentials ne crée une session sans second facteur requis
  - [ ] OTP expiré/rejoué/incorrect refusé, tentatives bornées
  - [ ] Aucun mot de passe dans réponse/log ; inscription et Realtime préservés
  - [ ] Remplacer ou encadrer le retour tempPassword du reset admin selon décision de sécurité, avec audit et sans fuite de secret.
- **Tests :**
  - [ ] Intégration login custom et callback Credentials, avec et sans MFA
  - [ ] Tests expiration/replay/concurrence challenge et absence Twilio
  - [ ] Recette inscription/login/logout deux sessions
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-014] Sécuriser et rendre atomique la liaison parent–élève

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** SECURITY
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/api/family/linked-student/route.ts ; lib/student-access.ts ; supabase/migrations
- **Contexte :** Simple e-mail suffit ; remplacement de lien et cardinalité contradictoires avec seed.
- **Objectif :** Sécuriser et rendre atomique la liaison parent–élève.
- **Implémentation prévue :** Proposer invitation ou approbation vérifiée, décider mono/multi-enfant ; transaction et interdiction de reprendre un lien sans autorité.
- **Critères d'acceptation :**
  - [ ] Un parent ne lit pas les données d’un élève dont il connaît seulement l’e-mail
  - [ ] Ancien lien conservé si échec
  - [ ] Cardinalité approuvée et cohérente UI/DB
- **Tests :**
  - [ ] Négatifs inter-familles, invitation expirée/rejouée
  - [ ] Deux liaisons concurrentes et rollback
  - [ ] Parent sans lien et changement d’enfant
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-015] Protéger et fiabiliser update-status

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** SECURITY
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/api/sessions/update-status/route.ts ; appelants calendrier
- **Contexte :** Mutation publique globale, retours précoces et démarrage PENDING sans validation.
- **Objectif :** Protéger et fiabiliser update-status.
- **Implémentation prévue :** Définir invocation serveur ou autorisation étroite ; calcul indépendant des clôtures et démarrages ; validation table de transitions avant changement.
- **Critères d'acceptation :**
  - [ ] Requête anonyme ne modifie rien
  - [ ] Séance expirée clôturée même sans nouvelle séance à démarrer
  - [ ] Transition PENDING décidée explicitement, pas implicite
- **Tests :**
  - [ ] Tests sans session active, bornes horaires, concurrence et appel répété
  - [ ] Test négatif anonyme et rôle non autorisé
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-016] Empêcher la modification de coordonnées par lead non vérifié

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** SECURITY
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/api/leads/route.ts ; lib/registration-emails.ts
- **Contexte :** Rôle/mot de passe préservés mais profil et besoins modifiables avec e-mail public.
- **Objectif :** Empêcher la modification de coordonnées par lead non vérifié.
- **Implémentation prévue :** Séparer demande et profil existant ; appliquer modifications seulement après preuve d’identité et autorisation ; limiter abus.
- **Critères d'acceptation :**
  - [ ] Un lead tiers ne modifie nom/téléphone/code postal/besoins d’aucun compte
  - [ ] Réponse non énumérante et besoin d’acquisition conservé
- **Tests :**
  - [ ] Comparer compte élève/parent/tuteur/admin avant/après lead anonyme
  - [ ] Tester nouveau compte, doublon, email invalide, panne mail
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-019] Formaliser transitions, consommation de crédits et bilans collectifs

- **Priorité :** P1
- **Statut :** BLOCKED
- **Domaine :** PRODUCT
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [TECH-002, TECH-015] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/api/sessions ; app/api/tutor/session-assessments ; lib/session-participants.ts ; supabase/migrations
- **Contexte :** Ancienne tâche sans ID de phase 4 ; débits non reliés aux réservations ; session_assessments unique par séance.
- **Objectif :** Formaliser transitions, consommation de crédits et bilans collectifs.
- **Implémentation prévue :** Décider moment du débit et annulation/remboursement ; table acteur/précondition/commande/sortie ; SQL atomique avec ledger ; bilan par séance ou participant arbitré.
- **Critères d'acceptation :**
  - [ ] Transitions et erreurs définies pour chaque acteur
  - [ ] Pas de double débit ; annulation respecte politique approuvée
  - [ ] Multi-participants évalués conformément au modèle retenu
- **Tests :**
  - [ ] Tests transitions interdites, J-2/J-0, débit/concurrence/retry
  - [ ] Réconciliation après annulation/remboursement
  - [ ] Bilan multi-élèves
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

## Phase 1 — Architecture et qualité

### [TECH-004] Extraire la logique métier des routes et pages monolithiques

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** BACKEND
- **Impact :** High
- **Effort :** High
- **Dépendances :** [TECH-010] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/api/**/route.ts` - `app/{student,tutor}/**/page.tsx` - `components/Booking/LeadCaptureModal.tsx` - `lib/{student-access,session-participants,registration-emails}.ts`
- **Contexte :** Routes et pages mêlent autorisation/données/état/rendu. Anciennes métriques de taille non remesurées ; extraction ciblée uniquement.
- **Objectif :** Extraire la logique métier des routes et pages monolithiques.
- **Implémentation prévue :** introduire par workflow un service applicatif étroit (réservation, paiement, messagerie) et un adaptateur Supabase. Extraire les sous-vues et hooks depuis les grosses pages. Ne créer un repository que là où les requêtes deviennent partagées ou transactionnelles ; garder les lectures simples proches de la route.
- **Critères d'acceptation :**
  - [ ] La route ne contient que parsing HTTP, appel de service et mapping réponse.
  - [ ] Les règles d'autorisation et transitions sont testables sans React/Next.
  - [ ] Les composants de plus de 500 lignes ont un plan d'extraction ciblé.
- **Tests :**
  - [ ] Vérifier les critères TECH-004 sur les fichiers ciblés, puis lint/type-check et intégration des consommateurs modifiés ; consigner preuve et résultat.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-005] Unifier validation, DTO et gestion d'erreur

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** BACKEND
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [TECH-004] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/api/leads/route.ts` - `app/api/sessions/route.ts` - `app/api/**/route.ts` - `lib/validation.ts` - `types/supabase.ts`
- **Contexte :** Validation hétérogène et any ; types consommés types/supabase.ts différents de la sortie du script de génération.
- **Objectif :** Unifier validation, DTO et gestion d'erreur.
- **Implémentation prévue :** schémas Zod par commande, types d'entrée/sortie dérivés, mapping des erreurs métier vers un `Result`/erreur applicative léger (`code`, message sûr, détails de champ). Régénérer et importer les types DB ; traiter `unknown` au bord des intégrations.
- **Critères d'acceptation :**
  - [ ] Les entrées externes sont validées côté serveur.
  - [ ] Les réponses 4xx/5xx suivent un contrat documenté sans données de debug.
  - [ ] Les erreurs de champ peuvent être rendues et annoncées dans l'UI.
- **Tests :**
  - [ ] Vérifier les critères TECH-005 sur les fichiers ciblés, puis lint/type-check et intégration des consommateurs modifiés ; consigner preuve et résultat.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-010] Ajouter tests, CI et contrôle de schéma

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** DEVOPS
- **Impact :** High
- **Effort :** High
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `package.json` - `README.md` - `.gitignore` - `supabase/migrations/**` - futur `.github/workflows/**`, `.env.example`
- **Contexte :** Aucun test runner/CI trouvé ; .env.example absent, modèle développement existant ; npm lint utilise déjà eslint . ; génération DB mal ciblée.
- **Objectif :** Ajouter tests, CI et contrôle de schéma.
- **Implémentation prévue :** créer d'abord des tests unitaires de catalogue/transitions/permissions, puis intégration de routes avec Supabase local et E2E des parcours P0. Faire exécuter en PR : install → format check → lint → type-check → unit → build ; E2E en preview/staging. Ajouter `.env.example` sans secret, validation centralisée et vérification que les types DB sont à jour après migration.
- **Critères d'acceptation :**
  - [ ] Chaque P0 a au moins un test automatique de non-régression.
  - [ ] Une PR ne peut pas fusionner si lint/type/build échouent.
  - [ ] L'environnement local est recréable depuis README + exemple d'env.
  - [ ] Modèle env existant documenté sans secret ; types DB générés au chemin consommé.
  - [ ] Conserver eslint . déjà présent, ne pas exécuter le quick win obsolète de remplacement de next lint.
- **Tests :**
  - [ ] Vérifier les critères TECH-010 sur les fichiers ciblés, puis lint/type-check et intégration des consommateurs modifiés ; consigner preuve et résultat.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-011] Formaliser observabilité, analytics et exploitation

- **Priorité :** P2
- **Statut :** TODO
- **Domaine :** BACKEND
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `lib/logger.ts` - `lib/registration-emails.ts` - `lib/mercure.ts` - `app/api/**`
- **Contexte :** Logs et effets secondaires best-effort, pas de suivi central des échecs ni funnel identifié ; consentement/outbox à arbitrer.
- **Objectif :** Formaliser observabilité, analytics et exploitation.
- **Implémentation prévue :** définir d'abord événements métier minimaux (sans PII) : `homepage_view`, `booking_cta_click`, `booking_started`, `level_selected`, `subject_selected`, `slot_selected`, `contact_completed`, `booking_completed`, `checkout_started`, `payment_completed`. Ajouter traces/correlation id, alertes de webhook et tableaux de succès des effets secondaires avant tout fournisseur externe.
- **Critères d'acceptation :**
  - [ ] Un échec paiement/réservation est corrélable à une requête sans contenu sensible.
  - [ ] Le funnel rend visible abandons et erreurs par étape.
  - [ ] Consentement/cookies et durée de conservation sont documentés.
  - [ ] Alias historique 50 : un tableau permet de suivre succès, erreurs, abandons et retours qualitatifs par lot.
- **Tests :**
  - [ ] Alias 50 : contrôle des événements, opt-in/opt-out cookies, test utilisateur desktop/mobile/clavier.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**50 — Validation UX : mesurer et tester les lots.** instrumenter `clic CTA → démarrage réservation → niveau/matière → créneau → coordonnées → confirmation`, puis mener des tests avec environ 5 utilisateurs représentatifs. Dépendance métier/source : choix de l’outil, consentement RGPD, définition des événements et baseline avant changement.

### [TECH-017] Aligner les parcours parent, LiveKit et retours Stripe

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** BACKEND
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [TECH-014] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/api/livekit/token/route.ts ; lib/livekit-access.ts ; app/api/student/payments/checkout/route.ts ; app/family
- **Contexte :** Token utilise user.id ; checkout retourne /student ; accès vidéo temporel indéfini.
- **Objectif :** Aligner les parcours parent, LiveKit et retours Stripe.
- **Implémentation prévue :** Définir si parent observe ou rejoint comme élève ; appliquer ownership et statut/date décidés ; choisir retour paiement par rôle, sans élargir roomAdmin.
- **Critères d'acceptation :**
  - [ ] Parent lié traité conformément à décision explicite
  - [ ] Parent non lié refusé et aucun rôle instructor indu
  - [ ] Retour succès/annulation dans espace du payeur
- **Tests :**
  - [ ] Matrice élève primaire/additionnel/parent/tuteur/étranger, état/date de séance
  - [ ] Checkout test STUDENT et PARENT
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-018] Durcir les images IA, le contexte et la gestion des erreurs

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** SECURITY
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/api/student/ai-tutor ; lib/ai-tutor ; app/student/messages/ai-tutor
- **Contexte :** URLs non validées strictement, historique premiers 40, pas de quota et erreurs fournisseur exposées.
- **Objectif :** Durcir les images IA, le contexte et la gestion des erreurs.
- **Implémentation prévue :** Valider schéma/MIME/tailles/origines et budget, charger les derniers messages dans l’ordre ; erreurs sûres ; définir rétention et traitement fournisseur.
- **Critères d'acceptation :**
  - [ ] Messages récents transmis correctement au-delà de 40
  - [ ] Fichiers invalides et trop volumineux refusés côté serveur
  - [ ] Quotas et erreurs actionnables sans détail secret
  - [ ] Ownership parent/élève et suppression respectés
- **Tests :**
  - [ ] Conversation 45+ messages avec marqueurs ordonnés
  - [ ] Image invalide, URL non permise, payload excessif, fournisseur indisponible
  - [ ] Isolation inter-comptes et suppression cascade
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [OPS-002] Rendre la stack locale HTTPS reproductible

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** DEVOPS
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** package.json ; next.config.js ; docker-compose.mercure.yml ; supabase/config.toml ; modèles env et certificats
- **Contexte :** Node poste 26 vs requis 24 ; certificats attendus ; CORS Mercure HTTP vs dev HTTPS ; allowedDevOrigins dupliqué préexistant.
- **Objectif :** Rendre la stack locale HTTPS reproductible.
- **Implémentation prévue :** Documenter/provisionner certificats locaux hors Git ; unifier origines et modèle env ; tester clone avec Node 24 sans exposer services loopback.
- **Critères d'acceptation :**
  - [ ] Clone démarre avec instructions et variables documentées
  - [ ] Auth/Mercure/LiveKit fonctionnent en HTTPS local
  - [ ] Valeurs personnelles et secrets exclus
- **Tests :**
  - [ ] Démarrage isolé Node 24 ; navigateur HTTPS et SSE ; micro/caméra
  - [ ] format/lint/type/build en environnement cible
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [OPT-001] Arbitrer les extensions Sika AI

- **Priorité :** P3
- **Statut :** BLOCKED
- **Domaine :** PRODUCT
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [TECH-018] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** lib/ai-tutor ; app/api/student/ai-tutor
- **Contexte :** Pistes historiques, aucune obligation de livraison.
- **Objectif :** Arbitrer les extensions Sika AI.
- **Implémentation prévue :** Comparer streaming SSE, search_course/pgvector, images Storage signées et export PDF ; mesurer coût/utilité/données avant choix.
- **Critères d'acceptation :**
  - [ ] Décision documentée pour chaque option retenue ou rejetée
  - [ ] Aucune promesse commerciale non implémentée
- **Tests :**
  - [ ] Revue produit et sécurité ; prototype seulement si autorisé
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [OPT-002] Arbitrer les extensions Stripe

- **Priorité :** P3
- **Statut :** BLOCKED
- **Domaine :** PRODUCT
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [TECH-002] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** lib/stripe.ts ; checkout ; intégrations Stripe
- **Contexte :** Prices persistants, Connect, SEPA et paiement fractionné étaient des pistes.
- **Objectif :** Arbitrer les extensions Stripe.
- **Implémentation prévue :** Comparer options métier/opérationnelles, retours différés et contraintes avant proposition ; aucune intégration automatique.
- **Critères d'acceptation :**
  - [ ] Décision motivée et périmètre séparé pour chaque option
  - [ ] Pas de modification du checkout avant décision
- **Tests :**
  - [ ] Revue contrat et scénario sandbox pour option retenue
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [OPT-003] Décider d’une outbox après mesure des pertes

- **Priorité :** P3
- **Statut :** BLOCKED
- **Domaine :** BACKEND
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [TECH-011] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** lib/registration-emails.ts ; lib/mercure.ts ; migrations si retenue
- **Contexte :** Pattern recommandé mais explicitement différé dans source historique.
- **Objectif :** Décider d’une outbox après mesure des pertes.
- **Implémentation prévue :** Instrumenter d’abord échecs, puis comparer retry/outbox/worker ; éviter infrastructure non justifiée.
- **Critères d'acceptation :**
  - [ ] Mesure des échecs disponible
  - [ ] Décision coût/fiabilité documentée ; outbox non imposée avant preuve
- **Tests :**
  - [ ] Simuler perte e-mail/hub et vérifier écriture métier unique
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

## Phase 2 — Design system V2

### [UI-001] Transformer les tokens existants en système de composants

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** FRONTEND
- **Impact :** High
- **Effort :** High
- **Dépendances :** [V2-002] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/globals.css` - `components/{Common,Pricing,Packs,BookOnline,Booking}/**` - `components/Student/{EmptyState,Skeleton}.tsx` - `components/Tutor/**`
- **Contexte :** Tokens Tailwind présents, primitives incomplètes ; focus global et cibles déjà ajoutés, recette systématique manquante.
- **Objectif :** Transformer les tokens existants en système de composants.
- **Implémentation prévue :** conserver les couleurs actuelles mais formaliser des tokens de surface, texte, bordure, espacement (`4/8/12/16/24/32/48/64` après inventaire) et une échelle type. Introduire progressivement `Button`, `Card`, `Field`, `Alert`, `Modal/Dialog`, `Section` et `PageHeader`, sans migration générale en un lot.
- **Critères d'acceptation :**
  - [ ] Les variantes primaire, secondaire, texte et destructive définissent hover, active, focus, disabled et loading.
  - [ ] Tous les contrôles importants ont une cible d'au moins 44×44 px si l'espace le permet.
  - [ ] Les nouveaux composants n'introduisent aucune couleur de marque.
  - [ ] Alias historique 31 : une même fonction éditoriale emploie le même style sur les pages publiques.
  - [ ] Alias historique 32 : les textes courants restent confortables sur desktop et ne créent pas de rupture sur mobile.
  - [ ] Alias historique 33 : les nouvelles sections n’introduisent plus de valeurs arbitraires non justifiées.
  - [ ] Alias historique 34 : les groupes de contenu sont perceptibles sans toucher à la palette.
  - [ ] Alias historique 35 : les cartes de même nature partagent une API et des règles visuelles.
  - [ ] Alias historique 36 : aucun CTA public ne masque son état focus/loading/disabled.
  - [ ] Alias historique 37 : les contrôles essentiels atteignent 24×24 CSS px au minimum, 44 px cible quand possible. Les CTA publics, la navigation, le sélecteur de thème et le consentement de contact disposent désormais d’une cible minimale de 44 px.
- **Tests :**
  - [ ] Contraste clair/sombre et focus
  - [ ] Story/capture visuelle aux breakpoints cibles
  - [ ] Clavier et lecteurs d'écran pour dialog/formulaire
  - [ ] Alias 31 : desktop/mobile, zoom 200 %, thème sombre.
  - [ ] Alias 32 : 320 px, 768 px, 1440 px, zoom 200 %.
  - [ ] Alias 33 : captures desktop/mobile, thème sombre.
  - [ ] Alias 34 : desktop/mobile, contraste, capture visuelle.
  - [ ] Alias 35 : desktop/mobile, thème sombre, capture visuelle.
  - [ ] Alias 36 : desktop/mobile, clavier, contraste, lecteur d’écran.
  - [ ] Alias 37 : 320 px, appareil tactile, audit WCAG 2.2 cible tactile.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**31 — Typographie : documenter une échelle globale.** définir et documenter H1/H2/H3/corps/meta/label, puis migrer progressivement. Dépendance métier/source : inventaire des pages ; ne pas modifier les polices de marque sans validation.

**32 — Typographie : limiter la largeur des textes longs.** ajouter une utilitaire de largeur de lecture et l’appliquer aux paragraphes longs. Dépendance métier/source : item 31.

**33 — Spacing : créer une échelle réutilisable.** documenter les pas 4/8/12/16/24/32/48/64 et les introduire par lots. Dépendance métier/source : audit visuel, item 34.

**34 — Sections : renforcer la séparation spatiale.** utiliser whitespace, conteneurs et séparateurs existants plutôt que de nouvelles couleurs. Dépendance métier/source : item 33 et nouvel ordre item 10.

**35 — Composants : standardiser les cartes.** définir variantes de carte et tokens (padding, radius, bordure, CTA), sans uniformiser abusivement les contenus. Dépendance métier/source : items 21, 31, 33.

**36 — Boutons : standardiser les variantes.** créer `primary`, `secondary`, `text/link`, `disabled`, `loading`, `hover`, `focus` avec la palette existante. Dépendance métier/source : item 03–04 ; audit des boutons d’actions sensibles.

**37 — Mobile : assurer des cibles tactiles confortables.** viser environ 44×44 px pour les contrôles principaux, sans casser leur densité sur desktop. Dépendance métier/source : item 36.

### [A11Y-002] Stabiliser les états, erreurs et mouvement réduit

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** UX
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [UI-001] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `components/{Common,Student,ErrorBoundary}/**` - `components/{Hero,About,FAQ,Testimonial,Footer}/**` - `app/(site)/error/page.tsx`
- **Contexte :** États/erreurs/mouvement réduit non uniformes ; page erreur héritée Solid et alt décoratifs à corriger.
- **Objectif :** Stabiliser les états, erreurs et mouvement réduit.
- **Implémentation prévue :** définir les états loading/empty/error/success dans les composants partagés, avec messages actionnables et `aria-live` si nécessaire. Respecter `prefers-reduced-motion` dans la configuration Motion. Localiser les pages d'erreur et supprimer les références au template.
- **Critères d'acceptation :**
  - [ ] Chaque attente réseau critique a un état visible et une reprise possible.
  - [ ] Les erreurs préservent les choix de l'utilisateur.
  - [ ] Les animations non essentielles sont réduites selon la préférence système.
  - [ ] Alias historique 46 : aucun alt générique ne pollue la lecture, aucune image informative n’est silencieuse.
  - [ ] Page erreur publique localisée, sans Solid SaaS Boilerplate ; alt décoratifs vides, informatifs utiles.
- **Tests :**
  - [ ] Réseau hors ligne/500 et retry
  - [ ] Préférence de mouvement réduit
  - [ ] FR/EN, clavier, lecteur d'écran
  - [ ] Alias 46 : lecteur d’écran, audit axe/Lighthouse.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**46 — Images : corriger les textes alternatifs.** passer les visuels décoratifs à `alt=""` et décrire uniquement l’information réellement transmise. Dépendance métier/source : inventaire des images publiques.

### [V2-001] Établir baseline et inventaire d’écrans

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** UX
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/(site) ; app/student ; app/family ; app/tutor ; design.md
- **Contexte :** PLANNED : frontend V2 spécifié, aucune implémentation durant la migration.
- **Objectif :** Établir baseline et inventaire d’écrans.
- **Implémentation prévue :** Capturer écrans/rôles/états, responsive et parcours ; rattacher mesures à PERF-001, sans doublonner ce ticket.
- **Critères d'acceptation :**
  - [ ] Inventaire inclut quatre espaces, public, réservation, paiement et vidéo
  - [ ] Captures datées clair/sombre et matrice des états
- **Tests :**
  - [ ] Revue 320/390/768/1440 px ; clavier ; réseau lent
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [V2-002] Proposer et valider les tokens V2

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** FRONTEND
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [V2-001] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/globals.css (future cible) ; design.md
- **Contexte :** PLANNED : frontend V2 spécifié, aucune implémentation durant la migration.
- **Objectif :** Proposer et valider les tokens V2.
- **Implémentation prévue :** Comparer tokens sémantiques proposés à marque ; grille/type/radius/états et contrastes ; aucune nouvelle identité implicite.
- **Critères d'acceptation :**
  - [ ] Tokens actuel/proposé distingués et approuvés
  - [ ] Contrastes des combinaisons critiques et focus documentés
- **Tests :**
  - [ ] Planche clair/sombre, zoom, petits écrans
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [V2-003] Concevoir le prototype homepage V2

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** UX
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [V2-002] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** design.md ; composants homepage comme référence
- **Contexte :** PLANNED : frontend V2 spécifié, aucune implémentation durant la migration.
- **Objectif :** Concevoir le prototype homepage V2.
- **Implémentation prévue :** Wireframes puis maquette mobile/desktop, contenu prouvé et tarifs exacts ; contrat du CTA unique ; pas de backend nouveau.
- **Critères d'acceptation :**
  - [ ] Chaque section a objectif/données/CTA
  - [ ] Prototype comparable à V1
  - [ ] Aucune fausse preuve sociale
- **Tests :**
  - [ ] Revue produit, navigation et lecture sur 320/390/1440 px
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [V2-004] Valider UX et responsive du prototype

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** UX
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [V2-003] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** Prototype issu de V2-003 ; design.md
- **Contexte :** PLANNED : frontend V2 spécifié, aucune implémentation durant la migration.
- **Objectif :** Valider UX et responsive du prototype.
- **Implémentation prévue :** Scénarios familles/élèves, environ cinq participants si disponibles ; consigner friction et corrections, sans fausse mesure de conversion.
- **Critères d'acceptation :**
  - [ ] Compréhension offre/prix/prochaine étape évaluée
  - [ ] Clavier et progression des formulaires validés
  - [ ] Décisions/rejets enregistrés
- **Tests :**
  - [ ] Scénarios réservation, retour arrière, erreurs, zoom et lecteur d’écran
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

## Phase 3 — Site public V2

### [TECH-008] Remplacer le calendrier de démonstration et éliminer les parcours morts

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** BACKEND
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [TECH-003, UX-003] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/(site)/booking/page.tsx` - `components/Booking/{BookingCalendar,TutorSelectionModal,LeadCaptureModal}.tsx` - `app/api/leads/first-session-slots/route.ts`
- **Contexte :** BookingCalendar conserve janvier 2024 et toast sans écriture. TutorSelectionModal demeure une sélection statique.
- **Objectif :** Remplacer le calendrier de démonstration et éliminer les parcours morts.
- **Implémentation prévue :** retirer la route ou la faire consommer le même service/état que la modale. Éviter tout mock dans une route accessible ; déterminer si le choix de tuteur est une étape produit réelle ou ne proposer que « meilleur tuteur disponible ».
- **Critères d'acceptation :**
  - [ ] Toute confirmation publique a une persistance et une référence de séance.
  - [ ] Aucune date fictive ne peut être réservée.
  - [ ] Le workflow documenté est le workflow accessible.
- **Tests :**
  - [ ] Vérifier les critères TECH-008 sur les fichiers ciblés, puis lint/type-check et intégration des consommateurs modifiés ; consigner preuve et résultat.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [UX-002] Rendre la promesse tarifaire complète et vérifiable

- **Priorité :** P0
- **Statut :** BLOCKED
- **Domaine :** UX
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `components/Pricing/index.tsx` - `components/Packs/index.tsx` - `components/BookOnline/index.tsx` - `lib/payments-catalog.ts` - `lib/stripe.ts`
- **Contexte :** Prix dans catalogues client/serveur ; Pricing promotionnel et conditions incomplets ; cases historiques 16–18 ne prouvent pas la recette de toutes cartes.
- **Objectif :** Rendre la promesse tarifaire complète et vérifiable.
- **Implémentation prévue :** alimenter toutes les cartes depuis une présentation unique du catalogue : niveau → quantité → prix TTC → prix/séance → économie calculée ou aucune remise → conditions → CTA. Faire de Collège/Lycée/Supérieur le titre ; NOTA/AVA/TODA deviennent secondaires si leur maintien est validé. Distinguer explicitement pack, séance et abonnement.
- **Critères d'acceptation :**
  - [ ] Chaque offre indique total, nombre/durée des séances et prix unitaire.
  - [ ] Toute économie est calculée depuis la séance à l'unité, testée et justifiée.
  - [ ] Renouvellement, « sans engagement », validité et annulation sont compréhensibles avant paiement.
  - [ ] Les prix UI correspondent au catalogue transmis à Stripe.
  - [ ] Alias historique 15 : mêmes termes dans UI, paiement, e-mails et documentation.
  - [ ] Alias historique 16 : la comparaison ne demande aucune connaissance des sigles internes.
  - [ ] Alias historique 17 : un visiteur connaît le prix avant prise de rendez-vous.
  - [ ] Alias historique 18 : toutes les formules affichent total, nombre de séances et prix par séance.
  - [ ] Alias historique 19 : toute économie affichée correspond exactement aux prix affichés.
  - [ ] Alias historique 20 : renouvellement, validité, annulation et report sont compréhensibles avant paiement.
  - [ ] Alias historique 21 : cartes comparables en une lecture verticale, sans régression du paiement.
  - [ ] Alias historique 22 : une recommandation indique clairement à qui elle convient et peut être désactivée.
- **Tests :**
  - [ ] Desktop, mobile et comparaison des cartes
  - [ ] Calculs/arrondis de prix
  - [ ] Checkout pack, séance et abonnement
  - [ ] Alias 15 : recherche textuelle, relecture FR/EN, parcours paiement.
  - [ ] Alias 16 : desktop/mobile, checkout, régression des IDs produits.
  - [ ] Alias 17 : desktop/mobile, cohérence catalogue/Stripe.
  - [ ] Alias 18 : desktop/mobile, tests de calcul, devise/arrondi.
  - [ ] Alias 19 : tests unitaires de calcul, relecture légale, desktop/mobile.
  - [ ] Alias 20 : desktop/mobile, liens FAQ, validation juridique.
  - [ ] Alias 21 : desktop/mobile, thème sombre, clavier et capture visuelle.
  - [ ] Alias 22 : desktop/mobile, cohérence des données.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**15 — Terminologie : normaliser les offres.** choisir les noms métier et créer un glossaire partagé. Dépendance métier/source : décision commerciale et juridique.

**16 — Packs : faire du niveau l’information principale.** titrer les cartes par Collège/Lycée/Supérieur, garder les noms internes en secondaire ou les retirer du front. Dépendance métier/source : item 15, compatibilité des identifiants Stripe.

**17 — Tarifs : afficher le prix unitaire.** exposer le tarif de la séance, TTC et sans ambiguïté, depuis le catalogue. Dépendance métier/source : validation prix/taxe ; item 15.

**18 — Tarifs : afficher le coût effectif par séance.** conserver le calcul, le rendre systématique et le positionner au même endroit sur toutes les cartes. Dépendance métier/source : item 21.

**19 — Tarifs : afficher l’économie réelle.** dériver l’économie du tarif unitaire, ou supprimer toute promesse de réduction non démontrée. Dépendance métier/source : item 17 et validation commerciale.

**20 — Tarifs : définir « sans engagement ».** publier les conditions exactes près du prix et dans une FAQ accessible. Dépendance métier/source : politique commerciale et juridique.

**21 — Tarifs : uniformiser les cartes.** définir l’ordre niveau → séances → prix → prix/séance → avantages → CTA. Dépendance métier/source : items 15, 17–20, 35–36.

**22 — Tarifs : marquer une formule recommandée seulement si justifiée.** ajouter un champ de recommandation documenté, ou ne mettre aucune formule en avant. Dépendance métier/source : décision commerciale, item 21.

### [UX-003] Réduire et séquencer la demande de première séance

- **Priorité :** P0
- **Statut :** TODO
- **Domaine :** UX
- **Impact :** High
- **Effort :** High
- **Dépendances :** [TECH-003, UX-001] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `components/Booking/LeadCaptureModal.tsx` - `app/api/leads/route.ts` - `app/api/leads/first-session-slots/route.ts`
- **Contexte :** Labels présents sur lead mais saisie dense avant créneau, états et soumission à revoir ; Auth reste à couvrir.
- **Objectif :** Réduire et séquencer la demande de première séance.
- **Implémentation prévue :** un workflow progressif : 1) niveau/matière, 2) créneau, 3) coordonnées minimales et consentement, 4) confirmation. Ne demander que les données nécessaires à la réservation ; traiter les détails pédagogiques ou postaux après confirmation si réellement requis. Utiliser un `<form>`, validation Zod partagée et erreurs `aria-describedby`/`aria-live`.
- **Critères d'acceptation :**
  - [ ] L'utilisateur sait à quelle étape il se trouve et conserve ses choix après une erreur.
  - [ ] Entrée soumet le formulaire ; les erreurs sont précises, associées au champ et résumées en tête.
  - [ ] Aucun champ non indispensable n'est bloquant avant le créneau.
  - [ ] Une indisponibilité de créneau permet de choisir un autre créneau sans recommencer.
  - [ ] Alias historique 40 : aucun champ public n’a le placeholder pour unique étiquette.
  - [ ] Alias historique 41 : chaque champ a une finalité justifiée et le backend accepte le nouvel ordre.
  - [ ] Alias historique 42 : l’utilisateur peut revenir, conserver ses données et comprendre son avancement.
  - [ ] Alias historique 43 : l’utilisateur sait avant saisie quelles données sont nécessaires.
  - [ ] Alias historique 44 : toute erreur explique quoi corriger et où, sans erreur technique vague.
  - [ ] Alias historique 45 : une erreur réseau ou métier ne supprime aucune saisie utile.
- **Tests :**
  - [ ] 320, 375, 390 et 430 px
  - [ ] Clavier, zoom 200 %, lecteur d'écran
  - [ ] Réseau lent, erreur API, double clic
  - [ ] Alias 40 : lecteur d’écran, zoom, desktop/mobile.
  - [ ] Alias 41 : desktop/mobile, API, données incomplètes, taux d’abandon.
  - [ ] Alias 42 : desktop/mobile, clavier, rafraîchissement, réseau lent.
  - [ ] Alias 43 : lecteur d’écran, desktop/mobile, validation de formulaire.
  - [ ] Alias 44 : lecteur d’écran, clavier, desktop/mobile, réponses API 4xx/5xx.
  - [ ] Alias 45 : erreur client, 400, 500, perte réseau, retour d’étape.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**40 — Formulaires : fournir des labels persistants.** ajouter `label` associé, visuellement visible ou au minimum conforme au design, et conserver le placeholder comme exemple. Dépendance métier/source : inventaire de tous les champs.

**41 — Formulaires : réduire les champs avant réservation.** conserver avant choix de créneau seulement les informations indispensables ; différer le reste après engagement ou confirmation. Dépendance métier/source : contraintes opérationnelles, RGPD, instrumentation item 50.

**42 — Formulaires : découper la réservation en étapes.** créer des étapes `Niveau → Matière → Créneau → Coordonnées → Confirmation` avec progression lisible et retour possible. Dépendance métier/source : item 41, persistance temporaire, validation API.

**43 — Formulaires : indiquer les champs requis/facultatifs.** afficher « obligatoire »/« facultatif » dans les labels et une légende non fondée uniquement sur la couleur. Dépendance métier/source : item 40–42, validation métier des données requises.

**44 — Formulaires : afficher des erreurs actionnables.** afficher un message précis lié au champ via `aria-describedby` et un résumé si nécessaire. Dépendance métier/source : item 40 et un composant d’erreur commun.

**45 — Formulaires : conserver les valeurs après erreur.** dissocier les valeurs de formulaire des états de soumission/erreur et ne réinitialiser qu’après succès confirmé. Dépendance métier/source : items 42 et 44.

### [UX-004] Aligner la homepage sur une décision d'achat

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** UX
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [UX-005, V2-004] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/(site)/page.tsx` - `components/{Hero,Testimonial,StagePromo,About,FunFact,Pricing,FAQ,Contact}/index.tsx`
- **Contexte :** Ordre réel Hero/Testimonial/StagePromo/About/FunFact/Pricing/FAQ/Contact ; copy améliorée mais aucune recette V2.
- **Objectif :** Aligner la homepage sur une décision d'achat.
- **Implémentation prévue :** après validation des contenus, adopter : Hero → réassurance factuelle → preuves sociales → fonctionnement → tuteurs/sélection → niveaux et tarifs → avantages → FAQ → CTA final → footer. Garder l'offre comme variante de campagne activable, jamais comme structure permanente.
- **Critères d'acceptation :**
  - [ ] Chaque section répond à une question de décision distincte.
  - [ ] Le CTA primaire reste le même et n'est pas concurrencé par le contact.
  - [ ] Les ancres et la navigation correspondent à cet ordre.
  - [ ] Alias historique 01 : le H1 explique l’offre sans contexte externe et reste une unique balise `h1`.
  - [ ] Alias historique 02 : la valeur ajoutée est comprise sans devoir ouvrir une autre page.
  - [ ] Alias historique 08 : chaque bloc public s’adresse à une seule cible identifiable.
  - [ ] Alias historique 09 : chaque section répond à « ce que j’obtiens », « comment » ou « pour qui ».
  - [ ] Alias historique 10 : la séquence est validée par un prototype et les ancres/navigation restent fonctionnelles. Les témoignages et la FAQ sont désormais intégrés ; la section Tuteurs reste à intégrer.
- **Tests :**
  - [ ] Desktop et mobile
  - [ ] Parcours de scroll et navigation par ancres
  - [ ] Mesure de clic et abandon une fois instrumentée
  - [ ] Alias 01 : desktop/mobile, lecteur d’écran (structure des titres).
  - [ ] Alias 02 : desktop/mobile, relecture FR/EN.
  - [ ] Alias 08 : relecture éditoriale FR/EN, desktop/mobile.
  - [ ] Alias 09 : relecture marketing, variantes A/B si instrumentées.
  - [ ] Alias 10 : desktop/mobile, navigation par clavier, métriques de scroll et CTA.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**01 — Hero : rendre le H1 explicite.** utiliser un H1 orienté service, par exemple « Cours particuliers en ligne du collège au supérieur » ; réserver la promesse de réussite au sous-texte. Dépendance métier/source : validation du positionnement et des versions FR/EN.

**02 — Hero : expliciter la différenciation.** ajouter une ou deux phrases maximum expliquant l’accompagnement personnalisé. Dépendance métier/source : wording validé par l’équipe pédagogique.

**08 — Copywriting : fixer la cible de chaque bloc.** documenter la cible de chaque section et réécrire les formulations incohérentes. Dépendance métier/source : décision marketing : parent, élève ou segment explicite.

**09 — Copywriting : remplacer les formulations génériques.** privilégier bénéfice concret, déroulé et résultat attendu ; conserver la tonalité de marque. Dépendance métier/source : item 08.

**10 — Homepage : réordonner selon la décision.** tester `Promesse → Réassurance → Avis → Fonctionnement → Tuteurs → Tarifs → FAQ → CTA final` avec ancres cohérentes. Dépendance métier/source : contenus des items 06, 23–28 et FAQ ; mesure item 50.

### [UX-005] Documenter les preuves, tuteurs, logos et statistiques

- **Priorité :** P1
- **Statut :** BLOCKED
- **Domaine :** UX
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `lib/translations.ts` - `components/FunFact/index.tsx` - `lib/homepage-testimonials.ts` - `app/api/testimonials/route.ts` - `components/Brands/**` - `public/images/logo/**`
- **Contexte :** Avis et chiffres codés ; source/droits non fournis ; profils publics consentis non structurés.
- **Objectif :** Documenter les preuves, tuteurs, logos et statistiques.
- **Implémentation prévue :** créer une fiche interne de preuve pour chaque chiffre/promesse, puis n'afficher que des formulations datées et expliquées. Publier des cartes tuteurs consenties (photo, matières, niveaux, formation, expérience, CTA profil) et une page profil si les données sont maintenues. Ajouter une formulation factuelle sur les écoles uniquement après validation des droits et de la véracité.
- **Critères d'acceptation :**
  - [ ] Chaque chiffre a une définition, période, dénominateur et propriétaire métier.
  - [ ] Chaque avis public est approuvé, contextualisé et consentement vérifié.
  - [ ] Aucun logo ne peut être lu comme partenariat sans preuve.
  - [ ] Alias historique 06 : chaque affirmation est sourcée et lisible sans surcharger le hero.
  - [ ] Alias historique 23 : chaque profil public est complet, exact et accessible.
  - [ ] Alias historique 24 : le texte ne promet rien qui ne soit effectif.
  - [ ] Alias historique 25 : aucune apparence de partenariat officiel non démontré.
  - [ ] Alias historique 26 : plusieurs avis s’affichent avant l’analyse détaillée des offres, avec état de chargement approprié.
  - [ ] Alias historique 27 : chaque avis affiché aide à identifier le cas d’usage sans surexposer la personne.
  - [ ] Alias historique 28 : chaque chiffre public est traçable à une source interne datée.
  - [ ] Alias historique 29 : chaque image de personne est exacte, pertinente et dispose d’un texte alternatif adapté.
- **Tests :**
  - [ ] Relecture métier/juridique
  - [ ] Mobile, alt des portraits et absence de données personnelles excessives
  - [ ] Alias 06 : desktop/mobile, contraste, relecture légale.
  - [ ] Alias 23 : desktop/mobile, alt des portraits, protection des données.
  - [ ] Alias 24 : relecture métier/juridique, desktop/mobile.
  - [ ] Alias 25 : desktop/mobile, lecteur d’écran, validation légale.
  - [ ] Alias 26 : desktop/mobile, chargement réseau lent, clavier du carousel.
  - [ ] Alias 27 : desktop/mobile, données absentes, confidentialité.
  - [ ] Alias 28 : desktop/mobile, relecture légale, mise à jour annuelle.
  - [ ] Alias 29 : desktop/mobile, performance, accessibilité.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**06 — Hero : ajouter une réassurance vérifiable.** afficher 2–3 preuves courtes (« Première séance gratuite », « Sans engagement », volume de familles) uniquement si justifiées. Dépendance métier/source : preuves métier pour chaque affirmation ; item 28 pour les chiffres.

**23 — Tuteurs : créer des profils de confiance.** créer des cartes avec photo autorisée, prénom/nom, matières, niveaux, formation et expérience. Dépendance métier/source : consentement des tuteurs, modèle de données et modération.

**24 — Tuteurs : expliquer la sélection.** publier les étapes réellement appliquées (académique, entretien, pédagogie, expérience, suivi). Dépendance métier/source : validation opérationnelle de chaque critère.

**25 — Grandes écoles : contextualiser les logos.** indiquer factuellement « Nos tuteurs et fondateurs sont notamment issus de… » si vrai ; sinon retirer les logos. Dépendance métier/source : validation factuelle et droits d’usage des marques.

**26 — Témoignages : remonter les preuves sociales.** placer un aperçu d’avis crédibles plus tôt et conserver une section complète plus bas si utile. Dépendance métier/source : item 10, données d’avis modérées.

**27 — Témoignages : ajouter du contexte.** ajouter niveau/matière/objectifs avec consentement, ou utiliser un rôle descriptif standardisé. Dépendance métier/source : migration/données, consentement et modération.

**28 — Preuves : sourcer les statistiques.** préciser population, période et définition, ou remplacer par une information vérifiable moins ambiguë. Dépendance métier/source : données métier et validation juridique.

**29 — Crédibilité : privilégier les photos authentiques.** utiliser des photos autorisées et optimisées lorsque la personne présentée délivre le service. Dépendance métier/source : consentement, droits à l’image, item 47.

### [UX-006] Normaliser navigation, libellés et liens de pied de page

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** UX
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `components/Header/menuData.tsx` - `components/Header/index.tsx` - `components/Footer/index.tsx` - `lib/translations.ts` - `app/(site)/donnees-personnelles/page.tsx`
- **Contexte :** Navigation, libellés FR/EN, ancres et faux liens à vérifier et harmoniser.
- **Objectif :** Normaliser navigation, libellés et liens de pied de page.
- **Implémentation prévue :** définir un glossaire (Tarifs, Séance à la carte, Packs, Mon espace), corriger « À la séance » et « Qui sommes-nous ? », remplacer les faux liens par des destinations valides (`mailto:` et confidentialité), puis harmoniser FR/EN.
- **Critères d'acceptation :**
  - [ ] Une action/destination a un libellé unique par langue.
  - [ ] Aucun lien `#` n'est interactif sans fonction.
  - [ ] Le menu mobile a des états actifs et des libellés compréhensibles.
  - [ ] Alias historique 04 : une action principale et une secondaire sont reconnaissables immédiatement. « Voir les tarifs » / « View pricing » est désormais la formulation unique du CTA secondaire sur les points d’entrée tarifaires.
  - [ ] Alias historique 11 : le menu desktop/mobile comporte uniquement les destinations retenues et le CTA est distinct.
  - [ ] Alias historique 12 : une destination a un seul intitulé dans chaque langue.
  - [ ] Alias historique 13 : page ou section courante identifiable sans ambiguïté.
  - [ ] Alias historique 14 : clic, clavier et lecteur d’écran permettent de revenir à l’accueil.
  - [ ] Corriger « À la séance » et « Qui sommes-nous ? » ; liens footer mailto/confidentialité valides ; CTA anglais inutilisé retiré ou localisé avant réemploi.
- **Tests :**
  - [ ] Liens desktop/mobile et clavier
  - [ ] Relecture FR/EN
  - [ ] Alias 04 : desktop/mobile, contraste et focus.
  - [ ] Alias 11 : desktop/mobile, clavier, liens et menu mobile.
  - [ ] Alias 12 : relecture FR/EN, liens desktop/mobile.
  - [ ] Alias 13 : desktop/mobile, clavier, scroll et thème sombre.
  - [ ] Alias 14 : desktop/mobile, Tab/Entrée, lecteur d’écran.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**04 — CTA : instaurer un CTA secondaire unique.** adopter « Voir les tarifs » comme action secondaire, avec une variante visuelle inférieure au CTA primaire. Dépendance métier/source : item 03 et composant bouton (item 36).

**11 — Navigation : limiter les destinations principales.** prioriser Comment ça marche, Tarifs, Tuteurs, Avis, Connexion et isoler le CTA de réservation. Dépendance métier/source : items 10 et 23 ; validation de l’architecture d’information.

**12 — Navigation : uniformiser les intitulés.** définir un glossaire et le réutiliser dans menu, titres, CTA et fil d’Ariane éventuel. Dépendance métier/source : item 15.

**13 — Navigation : clarifier l’état actif.** renforcer le style actif et, si les ancres sont conservées, synchroniser l’état avec le scroll. Dépendance métier/source : items 10–12.

**14 — Navigation : vérifier le retour accueil du logo.** conserver ce comportement, améliorer le nom accessible (`alt`/`aria-label`) et le tester. Dépendance métier/source : aucune.

### [UX-007] Configurer les campagnes saisonnières

- **Priorité :** P1
- **Statut :** BLOCKED
- **Domaine :** PRODUCT
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** components/StagePromo ; lib/translations.ts ; app/api/leads ; lib/registration-emails.ts
- **Contexte :** Alias historique 07 ; back_to_school codé à plusieurs endroits.
- **Objectif :** Configurer les campagnes saisonnières.
- **Implémentation prévue :** Configuration datée/activable et fallback neutre, préserver historique de campagne.
- **Critères d'acceptation :**
  - [ ] Campagne expirée absente
  - [ ] Offre activable sans modifications dispersées
  - [ ] Libellés site/lead/e-mail concordants
- **Tests :**
  - [ ] Bornes temporelles avant/pendant/après et fuseau
  - [ ] Desktop/mobile et création lead/e-mails
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [UX-008] Centraliser une adresse de support du domaine réellement délivrable

- **Priorité :** P2
- **Statut :** BLOCKED
- **Domaine :** PRODUCT
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [TECH-012] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** components/Footer ; lib/constants.ts ; lib/registration-emails.ts
- **Contexte :** Alias historique 30 ; adresse Gmail et domaines hétérogènes.
- **Objectif :** Centraliser une adresse de support du domaine réellement délivrable.
- **Implémentation prévue :** Choisir domaine/support, provisionner boîte et DNS dans mission autorisée puis centraliser liens.
- **Critères d'acceptation :**
  - [ ] Adresse publique délivrable et mailto valide
  - [ ] Contact confidentialité conservé et approuvé
- **Tests :**
  - [ ] Relecture des pages ; test réception/envoi autorisé
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [V2-006] Migrer les pages publiques par lots

- **Priorité :** P1
- **Statut :** TODO
- **Domaine :** FRONTEND
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [UI-001, V2-004, TECH-003, TECH-008, UX-002] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/(site) ; components marketing
- **Contexte :** PLANNED : frontend V2 spécifié, aucune implémentation durant la migration.
- **Objectif :** Migrer les pages publiques par lots.
- **Implémentation prévue :** Lot homepage via UX-004 puis about/how-to/offres/support/auth ; réutiliser UI-001 ; campagne UX-007 ; tarifs UX-002 ; aucune duplication de ces tâches.
- **Critères d'acceptation :**
  - [ ] Routes/CTA/contrats préservés ou redirections approuvées
  - [ ] États responsive/accessibles complets
  - [ ] Aucun mock de confirmation
- **Tests :**
  - [ ] Recette visuelle et E2E lead/compte/checkout ; build/lint/type
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

## Phase 4 — SEO et performances

### [TECH-009] Réduire les composants client, cascades et accès API répétitifs

- **Priorité :** P2
- **Statut :** TODO
- **Domaine :** BACKEND
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [PERF-001] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `components/{Hero,Pricing,Footer,FunFact,About}/index.tsx` - `app/{student,tutor}/**/page.tsx` - `app/api/{student,tutor}/messages/**`
- **Contexte :** Sections client et fetch dans useEffect ; requêtes répétées à mesurer avant cache/extraction.
- **Objectif :** Réduire les composants client, cascades et accès API répétitifs.
- **Implémentation prévue :** séparer données serveur stables, interactions client minimales et endpoints agrégés. Mesurer les waterfalls avant de mettre en cache ; définir `no-store` seulement pour les vues réellement temps réel et invalider les données après mutation/Mercure.
- **Critères d'acceptation :**
  - [ ] Les sections marketing statiques n'hydratent pas inutilement.
  - [ ] Les pages critiques ont un budget de requêtes et une stratégie de cache documentés.
  - [ ] Chaque mutation rafraîchit/invalide la donnée visible.
- **Tests :**
  - [ ] Vérifier les critères TECH-009 sur les fichiers ciblés, puis lint/type-check et intégration des consommateurs modifiés ; consigner preuve et résultat.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [TECH-012] Compléter SEO et cohérence de domaine

- **Priorité :** P2
- **Statut :** BLOCKED
- **Domaine :** SEO
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/(site)/head.tsx` - `app/(site)/**/page.tsx` - `app/layout.tsx` - `next.config.js`
- **Contexte :** Domaine .com dans head et .app dans README ; sitemap/robots/canonical non trouvés.
- **Objectif :** Compléter SEO et cohérence de domaine.
- **Implémentation prévue :** choisir un domaine canonique, rediriger l'autre domaine au niveau hébergeur, définir `metadataBase`, canonical, OpenGraph absolu, robots et sitemap. Ajouter JSON-LD seulement pour les données réelles (organisation/service/FAQ validée).
- **Critères d'acceptation :**
  - [ ] Une URL canonique unique est rendue sur chaque page indexable.
  - [ ] `.com` et `.app` ne servent pas le même contenu indexable.
  - [ ] Sitemap/robots et aperçus sociaux sont vérifiés en production.
- **Tests :**
  - [ ] Vérifier les critères TECH-012 sur les fichiers ciblés, puis lint/type-check et intégration des consommateurs modifiés ; consigner preuve et résultat.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [PERF-001] Mesurer avant d'optimiser la perception de vitesse

- **Priorité :** P2
- **Statut :** TODO
- **Domaine :** FRONTEND
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** - `app/(site)/page.tsx` - `components/{Hero,Footer,Pricing,FunFact,Testimonial}/**` - `next.config.js`
- **Contexte :** Aucune baseline RUM/Lighthouse recueillie ; optimisations et seuils restent objectifs.
- **Objectif :** Mesurer avant d'optimiser la perception de vitesse.
- **Implémentation prévue :** établir une baseline RUM/Lighthouse sur mobile, garder serveur les sections statiques, différer les composants interactifs, donner des `sizes` réels et mesurer le poids des images/fonts. Cibles indicatives : LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms au p75 lorsque la mesure est disponible.
- **Critères d'acceptation :**
  - [ ] Une baseline et une cible par page sont enregistrées.
  - [ ] Aucun changement ne dégrade LCP/CLS au-delà du budget défini.
  - [ ] Les images d'avis n'empêchent pas le rendu du contenu principal.
  - [ ] Alias historique 47 : LCP ≤ 2,5 s au 75e percentile pour les parcours ciblés.
  - [ ] Alias historique 48 : mobile ne télécharge pas une image desktop surdimensionnée.
  - [ ] Alias historique 49 : CLS ≤ 0,1 au 75e percentile sur pages cibles.
- **Tests :**
  - [ ] Lighthouse mobile, WebPageTest ou RUM
  - [ ] Réseau lent et petit viewport
  - [ ] Alias 47 : Lighthouse mobile, WebPageTest/production, réseau simulé.
  - [ ] Alias 48 : DevTools réseau, Lighthouse, appareils mobile/desktop.
  - [ ] Alias 49 : Lighthouse, throttling réseau, capture de layout shift.
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

**Sous-périmètres historiques fusionnés (propositions, non faits actuels) :**

**47 — Performance : optimiser l’élément LCP du hero.** identifier le LCP réel, optimiser sa ressource (format, taille, priorité) sans lazy-loading pour l’élément critique. Dépendance métier/source : données RUM/Lighthouse, item 50 si instrumentation web vitals.

**48 — Performance : servir des images responsives.** fournir `sizes` précis, dimensions/aspect ratios et formats adaptés ; vérifier les images importées statiquement. Dépendance métier/source : inventaire des assets et item 47.

**49 — Performance : empêcher les décalages de mise en page.** réserver l’espace avec `width`/`height`/`aspect-ratio` et des squelettes de même hauteur. Dépendance métier/source : audit CLS en production.

### [V2-005] Valider architecture éditoriale et nouvelles pages SEO

- **Priorité :** P2
- **Statut :** TODO
- **Domaine :** SEO
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [UX-005, TECH-012] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/(site) (cible) ; design.md
- **Contexte :** PLANNED : frontend V2 spécifié, aucune implémentation durant la migration.
- **Objectif :** Valider architecture éditoriale et nouvelles pages SEO.
- **Implémentation prévue :** Matrice intention/offre/contenu/route, domaine TECH-012, titres/descriptions/maillage/langues ; décider pages matière/niveau/tuteurs.
- **Critères d'acceptation :**
  - [ ] Pas de duplication avec /packs /book-online /how-to
  - [ ] Pages proposées justifiées et contenu attribué
  - [ ] Plan canonical/redirect et indexation validé
- **Tests :**
  - [ ] Revue intentions/contenu ; contrôles liens et structured data réels
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

## Phase 5 — Dashboards V2

### [V2-007] Moderniser dashboards élève et famille

- **Priorité :** P2
- **Statut :** TODO
- **Domaine :** FRONTEND
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [UI-001, TECH-014, TECH-017, TECH-019] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/student ; app/family ; components/Student
- **Contexte :** PLANNED : frontend V2 spécifié, aucune implémentation durant la migration.
- **Objectif :** Moderniser dashboards élève et famille.
- **Implémentation prévue :** Prochaine séance, bilan, crédit, identité élève visible ; profil pédagogique séparé de sécurité compte ; préserver guards.
- **Critères d'acceptation :**
  - [ ] Élève et parent voient bon contexte
  - [ ] Mobile liste agenda et états vides utiles
  - [ ] Aucun sélecteur multi-enfant non approuvé
- **Tests :**
  - [ ] Matrice parent sans lien/lié, élève ; calendrier/profil/paiement
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [V2-008] Moderniser dashboards tuteur et administration

- **Priorité :** P2
- **Statut :** TODO
- **Domaine :** FRONTEND
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [UI-001, TECH-006, TECH-004] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** app/tutor ; components/Tutor ; components/Admin
- **Contexte :** PLANNED : frontend V2 spécifié, aucune implémentation durant la migration.
- **Objectif :** Moderniser dashboards tuteur et administration.
- **Implémentation prévue :** Navigation cohérente et vues moins monolithiques ; demandes/bilans/actions admin ; pas de nouvelle disponibilité fictive.
- **Critères d'acceptation :**
  - [ ] Séparation actions tuteur/admin
  - [ ] Données et statuts lisibles, actions destructrices explicites
- **Tests :**
  - [ ] Matrice standard tutor/admin ; assignation, séance, bilan, avis
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [V2-009] Unifier messages, IA, notifications et classe mobile

- **Priorité :** P2
- **Statut :** TODO
- **Domaine :** FRONTEND
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [UI-001, TECH-017, TECH-018] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** components/LiveClass.tsx ; app/student/messages ; app/tutor/messages ; hooks
- **Contexte :** PLANNED : frontend V2 spécifié, aucune implémentation durant la migration.
- **Objectif :** Unifier messages, IA, notifications et classe mobile.
- **Implémentation prévue :** États connexion/envoi/erreur, accessibilité temps réel et caméra ; préserver permissions et données.
- **Critères d'acceptation :**
  - [ ] Reconnexion claire sans double envoi
  - [ ] Conversation IA privée, image validée
  - [ ] Contrôles vidéo utilisables mobile/clavier
- **Tests :**
  - [ ] Deux navigateurs, coupure réseau, refus caméra, token expiré et parent
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

## Phase 6 — Validation et déploiement

### [OPS-001] Préparer la recette Stripe et la configuration de lancement

- **Priorité :** P1
- **Statut :** BLOCKED
- **Domaine :** DEVOPS
- **Impact :** High
- **Effort :** Medium
- **Dépendances :** [TECH-002, TECH-019] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** Configuration Stripe/hébergement ; app/api/student/payments ; app/api/webhooks/stripe
- **Contexte :** Ancienne checklist Go-Live migrée ; aucune autorisation de lancement ici.
- **Objectif :** Préparer la recette Stripe et la configuration de lancement.
- **Implémentation prévue :** Vérifier activation compte, séparation test/live, endpoint/signature pour événements listés architecture, Customer Portal, domaine application, reçus, règles Radar et décision fiscale/conditions/remboursement avec responsables ; recette sandbox avant lancement autorisé.
- **Critères d'acceptation :**
  - [ ] Configuration de chaque environnement inventoriée sans secrets
  - [ ] Webhooks/Portal/factures testés
  - [ ] CGV/remboursement et traitement fiscal validés par responsable
  - [ ] Monitoring et rollback prévus
- **Tests :**
  - [ ] Stripe test succès/3DS/refus/abonnement/replay/remboursement
  - [ ] Aucun paiement réel de test ; recette sandbox selon documentation Stripe
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

### [V2-010] Recetter et préparer un déploiement progressif autorisé

- **Priorité :** P2
- **Statut :** TODO
- **Domaine :** DEVOPS
- **Impact :** Medium
- **Effort :** Medium
- **Dépendances :** [V2-006, V2-007, V2-008, V2-009, TECH-010, OPS-001] ; arbitrages éventuels précisés ci-dessous.
- **Fichiers concernés :** Pages migrées ; configuration de déploiement ; memory.md
- **Contexte :** PLANNED : frontend V2 spécifié, aucune implémentation durant la migration.
- **Objectif :** Recetter et préparer un déploiement progressif autorisé.
- **Implémentation prévue :** Matrice rôles/parcours, budgets, SEO, sécurité, monitoring et retour arrière ; proposer lancement seulement après preuve.
- **Critères d'acceptation :**
  - [ ] P0 clos avec preuves
  - [ ] E2E et recette Node 24 validés
  - [ ] Rollback et observation définis
  - [ ] Approbation de déploiement obtenue avant action
- **Tests :**
  - [ ] Parcours acquisition→séance→paiement→bilan ; replay et ownership ; responsive/CWV/SEO
- **Références :** [PRD](./PRD.md), [architecture](./architecture.md), [design](./design.md).

## Gouvernance et preuves

TODO = travail/validation restant ; IN_PROGRESS = intervention active attestée ; BLOCKED = décision ou dépendance externe manquante explicitée ; DONE = critères et preuves datées. Les options OPT ne sont pas des obligations de réalisation : leur sortie est une décision, éventuellement de ne rien développer. Les tests de recette des workflows PRD décrivent les scénarios ; seul ce fichier porte leur état opérationnel. Aucun TODO/FIXME littéral pertinent trouvé dans app/components/context/hooks/lib/types/scripts lors de la recherche ; les risques fonctionnels ci-dessus ne dépendent pas de la présence d'un commentaire TODO.

### [DOC-001] Consolider les six documents canoniques

- **Priorité :** P1
- **Statut :** DONE
- **Domaine :** DEVOPS
- **Impact :** High
- **Effort :** High
- **Dépendances :** []
- **Fichiers concernés :** docs/PRD.md, architecture.md, Rules.md, design.md, tasks.md, memory.md ; README.md, SECURITY.md, supabase/README.md ; référence documentaire lib/stripe.ts.
- **Contexte :** 21 documents sources, contradictions et tâches dispersées.
- **Objectif :** six sources maintenables, V2 spécifiée sans refonte.
- **Implémentation prévue :** migrer, vérifier couverture et liens, puis supprimer sources historiques après contrôle.
- **Critères d'acceptation :**
  - [x] Exactement six fichiers, aucun sous-dossier, matrice de migration complète.
  - [x] IDs historiques et 50 alias UX conservés, critères migrés.
  - [x] Code applicatif préservé hors référence documentaire.
- **Tests :**
  - [x] Liens/ancres, structure, secret scan documentaire et diff.
  - [x] format:check, lint, type-check exécutés ; limites consignées : format global échoue sur 271 fichiers préexistants, lint/type passent. Format des neuf Markdown contrôlé séparément.
- **Références :** [memory](./memory.md).

Preuve : contrôles du 10 octobre 2026 dans [le journal de migration](./memory.md#8-change-log). V2 spécifiée/planifiée uniquement ; aucune tâche applicative déclarée livrée par cette migration.
