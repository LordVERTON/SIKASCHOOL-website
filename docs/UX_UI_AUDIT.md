# Audit UX/UI — SikaSchool

_Audit du code au 12 septembre 2026. Aucune interface ni logique produit n'a été modifiée dans le cadre de cet audit._

## Rôle de ce document

Ce document est la **source de vérité des constats visibles par l'utilisateur** : contenu, navigation, conversion, interface, responsive et accessibilité. Il décrit le pourquoi et l'impact UX. Les vulnérabilités, couches applicatives et contrôles de données sont détaillés uniquement dans [TECHNICAL_AUDIT.md](TECHNICAL_AUDIT.md) ; les diagrammes de parcours uniquement dans [WORKFLOWS.md](WORKFLOWS.md) ; la liste de travail priorisée uniquement dans [ROADMAP.md](ROADMAP.md).

## Résumé exécutif

SikaSchool dispose d'une identité déjà reconnaissable (bleu, noir, illustrations, logo), d'un hero explicite et d'un premier parcours de réservation réellement connecté à la base. Les fondations visuelles sont toutefois encore celles d'un template : les cartes, boutons, états et contenus ne partagent pas une grammaire unique. Le principal frein n'est pas l'absence de fonctionnalités, mais la coexistence de parcours et de messages qui se contredisent.

Les priorités UX sont : rendre les tarifs exacts et comparables, consolider une seule entrée de réservation, alléger le formulaire de lead, prouver les promesses marketing, et rendre les modales/formulaires robustes au clavier et au lecteur d'écran. Les recommandations préservent logo, palette et tonalité SikaSchool.

## Forces observées

- Le H1 actuel explique le service et les niveaux : `components/Hero/index.tsx` et `lib/translations.ts`.
- Le CTA principal est déjà largement formulé « Réserver ma séance d’essai gratuite » ; les boutons principaux visent généralement 44 px de haut.
- Le catalogue partagé (`lib/payments-catalog.ts`) est une bonne source de données pour les tarifs et la page à la séance affiche prix TTC et durée.
- Les images informatives sont majoritairement servies avec `next/image`; les décoratives du hero ont `alt=""`.
- Un focus visible global, un lien d'évitement et un toast global existent : `app/globals.css`, `components/Accessibility/SkipLink.tsx`, `context/ToastContext.tsx`.

## Constats détaillés

## [UX-001] Une seule source et un seul propriétaire pour l'ouverture de réservation

**Catégories :** [UX] [CODE] [A11Y]  
**Priorité :** P0  
**Impact :** Conversion / cohérence / accessibilité

**État actuel :** `components/Hero/index.tsx` écoute `lead:open` et rend son propre `LeadCaptureModal`. `app/(site)/ClientProviders.tsx` écoute le même événement et rend une deuxième instance. Le header, le hero et la promotion émettent cet événement global.

**Problème :** une même action peut ouvrir deux modales, avec deux états, pièges de focus et soumissions potentiels. Un événement DOM rend aussi le contrat implicite et fragile.

**Fichiers concernés :**

- `components/Hero/index.tsx`
- `app/(site)/ClientProviders.tsx`
- `components/Header/index.tsx`
- `components/StagePromo/index.tsx`
- `components/Booking/LeadCaptureModal.tsx`

**Solution proposée :** conserver une seule modale dans le provider du site ; exposer une action typée via contexte ou prop de composition. Centraliser le préremplissage et la campagne dans cet unique contrôleur.

**Critères d'acceptation :**

- [ ] Un clic CTA ouvre exactement une modale.
- [ ] Fermer, Échap et retour de focus fonctionnent depuis chaque CTA.
- [ ] Le CTA garde la source/campagne uniquement pour l'analytics, sans modifier le parcours.

**Tests :**

- [ ] Desktop et mobile
- [ ] Clavier, Échap, tabulation
- [ ] Lecteur d'écran

_Principe : prévention des erreurs, visibilité de l'état du système._

## [UX-002] Rendre la promesse tarifaire complète et vérifiable

**Catégories :** [UX] [UI] [CODE]  
**Priorité :** P0  
**Impact :** Conversion / confiance

**État actuel :** `components/Pricing/index.tsx` affiche « 8 cours/mois » et des badges « -15 % », sans prix, calcul ni lien d'action cohérent. `lib/payments-catalog.ts` porte à la fois packs, séances et abonnements ; `components/Packs/index.tsx` et `components/BookOnline/index.tsx` les présentent autrement.

**Problème :** « cours/mois » peut laisser croire à un abonnement alors que les cartes mettent en avant des packs. Une réduction est affichée sans référence publique. Validité, report, annulation et renouvellement ne sont pas expliqués avant Stripe.

**Fichiers concernés :**

- `components/Pricing/index.tsx`
- `components/Packs/index.tsx`
- `components/BookOnline/index.tsx`
- `lib/payments-catalog.ts`
- `lib/stripe.ts`

**Solution proposée :** alimenter toutes les cartes depuis une présentation unique du catalogue : niveau → quantité → prix TTC → prix/séance → économie calculée ou aucune remise → conditions → CTA. Faire de Collège/Lycée/Supérieur le titre ; NOTA/AVA/TODA deviennent secondaires si leur maintien est validé. Distinguer explicitement pack, séance et abonnement.

**Critères d'acceptation :**

- [ ] Chaque offre indique total, nombre/durée des séances et prix unitaire.
- [ ] Toute économie est calculée depuis la séance à l'unité, testée et justifiée.
- [ ] Renouvellement, « sans engagement », validité et annulation sont compréhensibles avant paiement.
- [ ] Les prix UI correspondent au catalogue transmis à Stripe.

**Tests :**

- [ ] Desktop, mobile et comparaison des cartes
- [ ] Calculs/arrondis de prix
- [ ] Checkout pack, séance et abonnement

_Principe : reconnaissance plutôt que mémorisation ; prévention des erreurs._

## [UX-003] Réduire et séquencer la demande de première séance

**Catégories :** [UX] [A11Y] [WORKFLOW]  
**Priorité :** P0  
**Impact :** Conversion / erreurs de formulaire

**État actuel :** `LeadCaptureModal` demande en une fois niveau, matière, objectif, civilité, nom, prénom, e-mail, téléphone et code postal, puis crée un compte avant le choix final de créneau.

**Problème :** la quantité d'informations personnelles demandées avant la valeur (créneau) augmente l'abandon. Les champs requis ne sont pas tous expliqués, les erreurs ne sont pas annoncées par champ et le formulaire est soumis par `onClick` plutôt que par un véritable `form`.

**Fichiers concernés :**

- `components/Booking/LeadCaptureModal.tsx`
- `app/api/leads/route.ts`
- `app/api/leads/first-session-slots/route.ts`

**Solution proposée :** un workflow progressif : 1) niveau/matière, 2) créneau, 3) coordonnées minimales et consentement, 4) confirmation. Ne demander que les données nécessaires à la réservation ; traiter les détails pédagogiques ou postaux après confirmation si réellement requis. Utiliser un `<form>`, validation Zod partagée et erreurs `aria-describedby`/`aria-live`.

**Limite de périmètre :** la preuve d'e-mail, l'anti-abus et l'atomicité de réservation sont traités dans `TECH-001` à `TECH-003`, pas dans ce constat UX.

**Critères d'acceptation :**

- [ ] L'utilisateur sait à quelle étape il se trouve et conserve ses choix après une erreur.
- [ ] Entrée soumet le formulaire ; les erreurs sont précises, associées au champ et résumées en tête.
- [ ] Aucun champ non indispensable n'est bloquant avant le créneau.
- [ ] Une indisponibilité de créneau permet de choisir un autre créneau sans recommencer.

**Tests :**

- [ ] 320, 375, 390 et 430 px
- [ ] Clavier, zoom 200 %, lecteur d'écran
- [ ] Réseau lent, erreur API, double clic

_Principe : divulgation progressive, utilisabilité des formulaires, WCAG 3.3._

## [UX-004] Aligner la homepage sur une décision d'achat

**Catégories :** [UX] [UI]  
**Priorité :** P1  
**Impact :** Compréhension / conversion

**État actuel :** `app/(site)/page.tsx` assemble Hero → témoignages → offre saisonnière → méthode → chiffres → tarifs → FAQ → contact. Il n'y a ni présentation publique de tuteurs ni CTA final dédié.

**Problème :** la promotion saisonnière interrompt tôt la compréhension et le visiteur ne voit pas qui l'accompagnera ni comment les tuteurs sont sélectionnés. La section contact concurrence la réservation sans rôle clair.

**Fichiers concernés :**

- `app/(site)/page.tsx`
- `components/{Hero,Testimonial,StagePromo,About,FunFact,Pricing,FAQ,Contact}/index.tsx`

**Solution proposée :** après validation des contenus, adopter : Hero → réassurance factuelle → preuves sociales → fonctionnement → tuteurs/sélection → niveaux et tarifs → avantages → FAQ → CTA final → footer. Garder l'offre comme variante de campagne activable, jamais comme structure permanente.

**Critères d'acceptation :**

- [ ] Chaque section répond à une question de décision distincte.
- [ ] Le CTA primaire reste le même et n'est pas concurrencé par le contact.
- [ ] Les ancres et la navigation correspondent à cet ordre.

**Tests :**

- [ ] Desktop et mobile
- [ ] Parcours de scroll et navigation par ancres
- [ ] Mesure de clic et abandon une fois instrumentée

## [UX-005] Documenter les preuves, tuteurs, logos et statistiques

**Catégories :** [UX] [UI] [SEO]  
**Priorité :** P1  
**Impact :** Crédibilité / conformité marketing

**État actuel :** `lib/translations.ts` et `components/FunFact/index.tsx` affichent 5+, 200+ et 95 % sans source/contexte. Les avis proviennent d'un tableau en dur (`lib/homepage-testimonials.ts`) avec avatars Pexels distants. Des logos d'écoles sont présents dans `public/images/logo/`, mais pas de contexte public identifié.

**Problème :** les statistiques et remises sont ambiguës. Les avis ne disent pas systématiquement niveau, matière et date ; les logos peuvent suggérer un partenariat si la provenance n'est pas explicitée.

**Fichiers concernés :**

- `lib/translations.ts`
- `components/FunFact/index.tsx`
- `lib/homepage-testimonials.ts`
- `app/api/testimonials/route.ts`
- `components/Brands/**`
- `public/images/logo/**`

**Solution proposée :** créer une fiche interne de preuve pour chaque chiffre/promesse, puis n'afficher que des formulations datées et expliquées. Publier des cartes tuteurs consenties (photo, matières, niveaux, formation, expérience, CTA profil) et une page profil si les données sont maintenues. Ajouter une formulation factuelle sur les écoles uniquement après validation des droits et de la véracité.

**Critères d'acceptation :**

- [ ] Chaque chiffre a une définition, période, dénominateur et propriétaire métier.
- [ ] Chaque avis public est approuvé, contextualisé et consentement vérifié.
- [ ] Aucun logo ne peut être lu comme partenariat sans preuve.

**Tests :**

- [ ] Relecture métier/juridique
- [ ] Mobile, alt des portraits et absence de données personnelles excessives

## [UX-006] Normaliser navigation, libellés et liens de pied de page

**Catégories :** [UX] [A11Y] [SEO]  
**Priorité :** P1  
**Impact :** Orientation / confiance

**État actuel :** `components/Header/menuData.tsx` propose « Packs de séances » et « A la séance » ; `lib/translations.ts` contient aussi « Qui sommes nous ? ». Le footer contient `href="#"` pour l'e-mail et la confidentialité ; la page de confidentialité existe à `/donnees-personnelles`.

**Problème :** incohérences typographiques et vocabulaire concurrent. Les faux liens nuisent au clavier, à l'accessibilité et à la confiance.

**Fichiers concernés :**

- `components/Header/menuData.tsx`
- `components/Header/index.tsx`
- `components/Footer/index.tsx`
- `lib/translations.ts`
- `app/(site)/donnees-personnelles/page.tsx`

**Solution proposée :** définir un glossaire (Tarifs, Séance à la carte, Packs, Mon espace), corriger « À la séance » et « Qui sommes-nous ? », remplacer les faux liens par des destinations valides (`mailto:` et confidentialité), puis harmoniser FR/EN.

**Critères d'acceptation :**

- [ ] Une action/destination a un libellé unique par langue.
- [ ] Aucun lien `#` n'est interactif sans fonction.
- [ ] Le menu mobile a des états actifs et des libellés compréhensibles.

**Tests :**

- [ ] Liens desktop/mobile et clavier
- [ ] Relecture FR/EN

## [UI-001] Transformer les tokens existants en système de composants

**Catégories :** [UI] [CODE] [A11Y]  
**Priorité :** P1  
**Impact :** Cohérence / vitesse d'évolution

**État actuel :** `app/globals.css` contient couleurs, tailles typographiques et ombres, mais aucun token d'espacement et les boutons/cartes sont répétés dans les pages. Exemples : `components/Pricing`, `BookOnline`, `Student/EmptyState`, `TutorSelectionModal`.

**Problème :** rayons, paddings, hauteur des boutons, bordures, focus et états disabled divergent. Les couleurs hexadécimales directes de `StagePromo`, `CTA` et plusieurs dashboards contournent la gouvernance existante.

**Fichiers concernés :**

- `app/globals.css`
- `components/{Common,Pricing,Packs,BookOnline,Booking}/**`
- `components/Student/{EmptyState,Skeleton}.tsx`
- `components/Tutor/**`

**Solution proposée :** conserver les couleurs actuelles mais formaliser des tokens de surface, texte, bordure, espacement (`4/8/12/16/24/32/48/64` après inventaire) et une échelle type. Introduire progressivement `Button`, `Card`, `Field`, `Alert`, `Modal/Dialog`, `Section` et `PageHeader`, sans migration générale en un lot.

**Critères d'acceptation :**

- [ ] Les variantes primaire, secondaire, texte et destructive définissent hover, active, focus, disabled et loading.
- [ ] Tous les contrôles importants ont une cible d'au moins 44×44 px si l'espace le permet.
- [ ] Les nouveaux composants n'introduisent aucune couleur de marque.

**Tests :**

- [ ] Contraste clair/sombre et focus
- [ ] Story/capture visuelle aux breakpoints cibles
- [ ] Clavier et lecteurs d'écran pour dialog/formulaire

## [A11Y-001] Corriger la structure de landmarks et les dialogues

**Catégories :** [A11Y] [UX]  
**Priorité :** P0  
**Impact :** Accessibilité / risques de blocage clavier

**État actuel :** `app/(site)/layout.tsx` crée `<main id="main-content">`, tandis que plusieurs pages publiques créent encore un `<main>` descendant. `LeadCaptureModal` déclare `role="dialog"` mais le code audité ne montre ni transfert/restauration de focus ni focus trap ; `TutorSelectionModal` ne porte ni rôle dialog ni `aria-modal`.

**Problème :** landmarks imbriqués et modales poreuses empêchent une navigation prévisible. Le lien d'évitement n'est visible qu'après un gestionnaire client et n'a pas de cible focalisable explicite.

**Fichiers concernés :**

- `app/(site)/layout.tsx`
- `app/(site)/{page,booking/page,book-online/page,packs/page}.tsx`
- `components/Accessibility/SkipLink.tsx`
- `components/Booking/{LeadCaptureModal,TutorSelectionModal}.tsx`

**Solution proposée :** un seul landmark `main` par document ; skip link rendu immédiatement avec une cible `tabIndex={-1}`. Standardiser le dialog natif ou un composant accessible : focus initial, boucle de tabulation, Échap, overlay, retour du focus et libellé/titre associé.

**Critères d'acceptation :**

- [ ] Navigation clavier complète sans atteindre l'arrière-plan d'une modale.
- [ ] Le focus revient au bouton lanceur après fermeture.
- [ ] La hiérarchie de titres et landmarks est unique et logique.

**Tests :**

- [ ] NVDA/VoiceOver, Tab/Shift+Tab/Échap
- [ ] Zoom 200 % et reflow à 320 px

_Référence : WCAG 2.2 — Focus Appearance, Focus Not Obscured, Name/Role/Value._

## [A11Y-002] Stabiliser les états, erreurs et mouvement réduit

**Catégories :** [A11Y] [UI] [PERF]  
**Priorité :** P1  
**Impact :** Compréhension / confort

**État actuel :** toasts et quelques skeletons existent, mais ils sont propres à certains écrans. Framer Motion est utilisé dans de nombreuses sections sans règle `prefers-reduced-motion` identifiée. L'error page publique reste en anglais et présente le titre Solid SaaS.

**Fichiers concernés :**

- `components/{Common,Student,ErrorBoundary}/**`
- `components/{Hero,About,FAQ,Testimonial,Footer}/**`
- `app/(site)/error/page.tsx`

**Solution proposée :** définir les états loading/empty/error/success dans les composants partagés, avec messages actionnables et `aria-live` si nécessaire. Respecter `prefers-reduced-motion` dans la configuration Motion. Localiser les pages d'erreur et supprimer les références au template.

**Critères d'acceptation :**

- [ ] Chaque attente réseau critique a un état visible et une reprise possible.
- [ ] Les erreurs préservent les choix de l'utilisateur.
- [ ] Les animations non essentielles sont réduites selon la préférence système.

**Tests :**

- [ ] Réseau hors ligne/500 et retry
- [ ] Préférence de mouvement réduit
- [ ] FR/EN, clavier, lecteur d'écran

## [PERF-001] Mesurer avant d'optimiser la perception de vitesse

**Catégories :** [PERF] [UI]  
**Priorité :** P2  
**Impact :** LCP / CLS / INP

**État actuel :** toutes les sections publiques sont des composants client, y compris contenu statique (`Hero`, `Pricing`, `Footer`, `FunFact`). Le hero charge deux SVG avec `priority`; les avis utilisent des avatars Pexels distants. `next.config.js` configure AVIF/WebP mais les `sizes` sont peu renseignés.

**Fichiers concernés :**

- `app/(site)/page.tsx`
- `components/{Hero,Footer,Pricing,FunFact,Testimonial}/**`
- `next.config.js`

**Solution proposée :** établir une baseline RUM/Lighthouse sur mobile, garder serveur les sections statiques, différer les composants interactifs, donner des `sizes` réels et mesurer le poids des images/fonts. Cibles indicatives : LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms au p75 lorsque la mesure est disponible.

**Critères d'acceptation :**

- [ ] Une baseline et une cible par page sont enregistrées.
- [ ] Aucun changement ne dégrade LCP/CLS au-delà du budget défini.
- [ ] Les images d'avis n'empêchent pas le rendu du contenu principal.

**Tests :**

- [ ] Lighthouse mobile, WebPageTest ou RUM
- [ ] Réseau lent et petit viewport

## Notes de contenu à valider

- Le hero est déjà explicite, mais sa description mêle « votre enfant » et « votre parcours » : choisir une cible par bloc.
- L'offre de rentrée, son -15 % et le libellé « Promo de rentrée » sont codés dans `StagePromo`, `Pricing`, traductions et lead. Les passer dans une configuration de campagne datée avec fallback neutre.
- L'ancienne documentation `docs/UX_UI_ROADMAP.md` contient des statuts `[x]` qui ne concordent pas toujours avec le rendu actuel (par exemple les prix de `components/Pricing/index.tsx`). `ROADMAP.md` est désormais la référence de priorisation ; ne pas interpréter une case historique comme une validation de recette.
