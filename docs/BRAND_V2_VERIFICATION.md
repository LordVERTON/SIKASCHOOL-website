# Recette de l’identité SIKASCHOOL V2

## V2.1 — 21 octobre 2026

Travail local sur `feat(UX/UI)`, HEAD initial **`799d9dc`**. Hero et proposition de valeur clarifiés, matières à sélection unique, réassurance, nouvel ordre narratif, `TutorCard` et encart parents, FAQ basée sur `AccordionItem`, ancres et surfaces harmonisées. Aucune dépendance ajoutée ni modification des API métier, paiements ou autorisations. Droits des deux portraits confirmés explicitement par le propriétaire dans la conversation du 21 octobre ; fiches détaillées et consentements des avis restent ouverts dans UX-005.

Résultats réellement exécutés :

- **TypeScript, ESLint et build : réussis.** Build Next.js 16.3.4 de 99 pages, Node **24.22.0**, un worker via `CIRCLE_NODE_TOTAL=2` dans le shell local uniquement. Le Node système 26 et les exécutions concurrentes avaient subi des erreurs mémoire ; le serveur de développement Turbopack avait aussi échoué. La recette aboutie utilise le build de production, servi sur localhost:3100.
- **`verify-brand-v2.mjs` : 56 contrôles de rendu publics**, puis reprise des interactions après correction d’une course du script entre catalogue de repli et réponse API. Rapport de rendu conservé dans `artifacts/v2.1/after/report-render.json` ; les cinq entrées de réservation et la matrice V2.1 passent dans `report-booking.json`. Cette reprise est une exécution séparée, pas une unique exécution complète annoncée comme réussie.
- **28 combinaisons homepage** : 320, 375, 390, 430, 768, 1024, 1440 px × français/anglais × clair/sombre. Un H1, dix sections dans l’ordre demandé, image Hero chargée, boutons d’au moins 48 px, polices Sensa/Poppins, absence de scroll horizontal. Zoom 200 % et préférence de mouvement réduit vérifiés.
- **Réservation** : Hero, CTA matière, header, CTA final et menu mobile ; modale unique, fond inerte, piège de focus, Échap et retour au lanceur. Sélection native aux flèches, toutes les matières accessibles, une seule valeur cochée, préremplissage de Chimie testé avec un catalogue simulé, choix différé possible. La lecture réelle du catalogue a aussi répondu HTTP 200 ; sa disponibilité varie et peut déclencher le repli.
- **FAQ** : réponses API conservées, Entrée/Espace, flèches haut/bas, Début/Fin, `aria-expanded`, panneaux nommés, état lent, HTTP 503, tableaux vides et données invalides, repli anglais, relance et récupération. Les réponses API sans traduction restent explicitement marquées en français dans l’interface anglaise. Aucun contenu commercial réécrit dans l’API ; validation métier de ses réponses/replis historiques encore nécessaire.
- **Navigation** : quatre ancres desktop/mobile, état actif et dégagement sous le header ; destinations header/footer et protection anonyme des quatre portails contrôlées. **Aucune erreur JavaScript** dans la recette aboutie.
- **`verify-ux-roadmap.mjs` : 36 contrôles réussis**, rapport `artifacts/ux-roadmap/report.json` : 25 rendus, dialogs/clavier/sombre, parcours parent et élève FR/EN avec erreurs/reprises/conflit 409 et créneaux vides, erreur Checkout/réessai/retour après connexion simulés, navigation et liens. Les mutations sont interceptées ; aucune création réelle de compte, lead, réservation, e-mail ni paiement.

Mesures exploratoires : LCP observé **120–232 ms**, CLS maximal **0,042**, via `PerformanceObserver` avant les captures. Machine Windows locale, cache réchauffé, pas de throttling réseau/CPU, échantillon court. Ces données ne représentent ni des utilisateurs réels ni un p75, ne mesurent pas l’INP et ne permettent pas une comparaison de performance avec le serveur de développement du commit initial. PERF-001 reste ouvert pour la preview instrumentée et le RUM.

Les captures et rapports sont locaux et ignorés par Git. Les premiers essais ont manqué d’espace disque ; seul le cache généré `.next/dev/cache/turbopack` a été supprimé après contrôle du chemin, sans suppression de source. La preview Vercel fournie n’était pas accessible via l’outil web ; aucun déploiement, aucune fusion ni modification de production. La recette DOM/clavier ne remplace pas celle d’un lecteur d’écran réel ni la relecture commerciale des contenus.

Comparaison visuelle réellement inspectée à **390 et 1440 px** : source `799d9dc` extraite dans un dossier temporaire isolé, dépendances existantes partagées, serveur Webpack local avec cache disque désactivé. Les premières captures de référence utilisaient une police de repli car Google Fonts était bloqué ; elles ont été remplacées après relance avec accès réseau et chargement correct de Poppins. Le code de la branche n’a pas été remplacé pour réaliser cet avant/après. Les captures comparatives utilisent les mêmes trois questions déjà présentes dans le repli de `lib/translations.ts`, injectées uniquement au navigateur ; la préservation du contenu dynamique est vérifiée séparément par la recette.

- `artifacts/v2.1/before/home-390.png` et `home-1440.png` : homepage du commit initial ; captures ciblées `hero-*`, `tutors-*`, `faq-*`.
- `artifacts/v2.1/after/home-390.png` et `home-1440.png` : version finale, mêmes captures ciblées ; matrice complète `home-{fr|en}-{largeur}-{light|dark}.png`.
- Constats : niveaux et essai mieux hiérarchisés, CTA secondaires cohérents sur mobile, accès direct aux matières, portraits et citation intégrés aux cartes, encart parents distinct, témoignages sur blanc entre tuteurs neutres et signature bleue, FAQ à séparateurs fins sans pointillés. Pas de défaut de mise en page identifié dans les captures inspectées. Le script fait défiler la page pour charger les portraits avant les captures longues ; les éléments fixes sont masqués seulement dans les captures ciblées pour éviter leur superposition artificielle.

La recette historique ci-dessous reste conservée avec son contexte et ses limites.

Date : **20 octobre 2026**. Référence : [charte V2](BRAND_IDENTITY_V2.md). Cette recette porte sur le frontend local, sans déploiement.

Mise à jour typographique du **21 octobre 2026**, branche `feat(UX/UI)` : Sensa Wild Fill remplace Archivo Black pour les titres. Après un essai de Source Han Serif, le propriétaire a demandé de rétablir **Poppins** pour les textes et interfaces publiques et **Inter** dans les espaces connectés. Sensa Wild Fill reste chargée via `next/font/local` ; Poppins et Inter sont hébergées par Next.js via `next/font/google`. Les contrôles initiaux sur la variante Sensa/Source Han avaient réussi (52 rendus et 5 ouvertures du formulaire). Les détails ci-dessous décrivent la recette initiale du 20 octobre.

## Périmètre et méthode

Parcours vérifié : CTA public → contrôleur de réservation partagé → formulaire existant, avec transmission de la matière du catalogue. La recette finale utilise le build de production **Next.js 16.3.4** servi localement. Les contrôles navigateur sont automatisés par `scripts/verify-brand-v2.mjs`, avec Chromium/Playwright déjà disponible dans l’environnement ; aucune dépendance de production n’a été ajoutée.

La matrice cible les routes `/`, `/about`, `/how-to`, `/packs`, `/book-online`, `/booking`, `/support`, `/donnees-personnelles`, `/error` et les quatre écrans publics d’authentification. Largeurs : 320, 768 et 1440 px ; thème sombre à 1440 px ; préférence de mouvement réduit. Les captures et le rapport JSON sont générés dans `artifacts/brand-v2/` (artefacts locaux ignorés par Git).

## Résultats

Contrôles exécutés :

- `npm.cmd run type-check` : réussi.
- `npm.cmd run lint` : réussi, sans erreur ni avertissement lors du contrôle final.
- `npm.cmd run build` : réussi, compilation et génération de 99 pages. Le premier essai dans le sandbox a échoué au lancement du processus TypeScript (`spawn UNKNOWN`) ; l’exécution hors sandbox a terminé.
- Script Chromium complet sur le build de production : réussi, **aucune erreur JavaScript** ; rapport `artifacts/brand-v2/report.json` et captures locales. Le catalogue de matières a répondu HTTP 200, avec les 14 matières du catalogue partagé.
- Contraste calculé : bleu/orange **6,21:1**, bleu/blanc **10,36:1**, texte secondaire/blanc **6,62:1**. Blanc/orange **1,67:1**, couple exclu des nouveaux CTA et textes.
- Après la dernière correction CSS : contrôle Chromium sur accueil, connexion, packs et séances. Les textes publics `text-primary` sont orange en thème sombre ; les boutons de fond primaire restent bleus. **4 contrôles réussis**, trace locale `artifacts/brand-v2/dark-contrast.json`. Le build final a été relancé et a réussi.
- Débordements initiaux du footer et positionnement des décors corrigés ; titre du hero ajusté pour garder le mot « PROGRESSER » lisible à 320 px.
- **52 contrôles de rendu** : 13 routes × 3 largeurs en thème clair + 13 contrôles en thème sombre. Réponse HTTP 200, une seule balise `main`, palette V2 et Poppins, absence de défilement horizontal.
- **5 entrées de réservation** : hero, CTA matière, header desktop, CTA final, menu mobile. Une seule modale ; matière `Mathématiques` transmise ; arrière-plan inerte ; Échap ; piège et retour de focus desktop. Le retour mobile se fait sur le bouton du menu, puisque le CTA du panneau disparaît à sa fermeture.
- **Zoom CSS 200 %** à 640 px (largeur de contenu équivalente à 320 px) : les grilles s’adaptent à la largeur réellement disponible, sans débordement.
- **Contrôle d’accès anonyme** : les six URL publiques corrigées répondent 200 ; `/student`, `/family`, `/tutor`, `/admin` redirigent vers la connexion (307).
- Lien d’évitement : premier Tab → lien visible → Entrée → focus sur `main-content`. Bascule anglaise de la nouvelle copy et attribut HTML `lang` synchronisé.

Les premiers essais ont servi à corriger le footer, le zoom et les URL publiques manquantes. Le refus de connexion sur `/how-to` provenait d’une redirection vers un autre port de connexion, et non de l’arrêt du serveur. Un contrôle de texte anglais a été corrigé pour tenir compte des capitales CSS attendues. Les scripts de recette ne soumettent aucun formulaire.

Exécution reproductible, avec Playwright disponible dans le projet :

```sh
npm run build
npm run start -- --port 3104
node scripts/verify-brand-v2.mjs http://localhost:3104
```

Si Playwright est installé ailleurs dans l’environnement, passer son chemin `package.json` comme troisième argument. L’option `--booking-only` permet de reprendre uniquement les contrôles d’interaction/navigation/zoom. Aucune installation globale ni modification des dépendances n’est effectuée par le script.

## Limites explicites

- Les originaux Instagram/ZIP/PDF sont absents ; aucune comparaison visuelle directe ne peut être revendiquée.
- Le choix provisoire Archivo Black de la recette initiale a été remplacé le 21 octobre par Sensa Wild Fill, conformément au choix du propriétaire ; sources et licences dans `public/fonts/README.md`.
- La disponibilité de Supabase est intermittente dans cet environnement. Les endpoints existants peuvent servir leur catalogue/FAQ de repli. Une réponse 200 de repli n’établit pas l’accès à des tuteurs réellement disponibles.
- Aucun compte, lead, réservation, paiement ou message n’a été créé. La soumission du formulaire, l’attribution réelle d’un créneau, les e-mails et Stripe ne sont pas validés par cette recette d’interface.
- Les témoignages et portraits sont ceux du dépôt existant ; leurs justificatifs et autorisations ne sont pas ajoutés par cette intervention. Aucune qualification vérifiée n’est affirmée.
- Le contrôle des couleurs et de la navigation ne remplace pas un audit WCAG complet avec lecteur d’écran. LCP/CLS/INP et tests utilisateurs en production restent à mesurer dans PERF-001/SK-006.
- Le cache Turbopack a rencontré une erreur d’espace disque (`os error 112`). Les seuls caches Turbopack générés dans `.next` ont été nettoyés après vérification de leurs chemins ; le développement a repris sous Webpack avant la recette finale sur build de production. Aucun fichier utilisateur n’a été supprimé.
