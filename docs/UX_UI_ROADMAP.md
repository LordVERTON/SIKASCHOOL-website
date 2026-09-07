# Feuille de route UX/UI — SikaSchool

> Statut : planification. Ce document décrit des lots à valider avant toute implémentation ; il ne constitue pas un ordre d’exécution automatique.

## Garde-fous

- Ne pas modifier le logo, les couleurs de marque ni l’identité visuelle fondamentale de SikaSchool.
- Préserver les parcours existants (réservation, authentification, paiement) tant qu’un critère d’acceptation équivalent ou supérieur n’est pas validé.
- Toute statistique, réduction, promesse ou mention d’établissement doit être prouvée et approuvée avant publication.
- Travailler par petits lots, avec revue desktop, mobile et clavier avant fusion.

## Lecture et suivi

- **P0** : conversion, information essentielle, accessibilité ou dette saisonnière ; à traiter en premier.
- **P1** : cohérence, lisibilité, performance ou amélioration mesurable ; à traiter après les P0 associés.
- Les chemins indiqués sont ceux relevés lors de l’audit initial du dépôt. Les composants mutualisés doivent être privilégiés.
- Une case ne passe à `[x]` qu’après revue, tests indiqués et validation métier lorsque nécessaire.

## État initial relevé

- La page d’accueil assemble actuellement `Hero → StagePromo → About → FunFact → Testimonial → Pricing → Contact` dans `app/(site)/page.tsx`.
- Le hero réutilise des textes de `lib/translations.ts`, affiche un champ e-mail avant la réservation et ouvre `components/Booking/LeadCaptureModal.tsx`.
- Une offre de rentrée à −15 % est rendue par `components/StagePromo/index.tsx` ; son identifiant de campagne est également utilisé dans la création de leads.
- Les tarifs détaillés sont portés par `lib/payments-catalog.ts` et `components/Packs/index.tsx`; les cartes de `components/Pricing/index.tsx` restent descriptives.
- Les composants de contact et plusieurs formulaires utilisent des placeholders ; le formulaire Contact ne fournit pas de labels visibles pour ses champs.
- Les tokens de couleurs et de typographie existent dans `app/globals.css`, mais ni échelle d’espacement ni système de boutons/carte partagé n’y sont définis.
- Aucun outil d’analytics ou de mesure de funnel n’a été trouvé dans le code audité.

---

## Lot 1 — Promesse, CTA et contenu de la page d’accueil

- [x] **01 — [P0] Hero : rendre le H1 explicite.**
  - **État actuel :** le hero affiche la promesse générique « Excellence académique à votre portée » via `lib/translations.ts`.
  - **Fichiers :** `lib/translations.ts`, `components/Hero/index.tsx`.
  - **Solution :** utiliser un H1 orienté service, par exemple « Cours particuliers en ligne du collège au supérieur » ; réserver la promesse de réussite au sous-texte.
  - **Dépendances :** validation du positionnement et des versions FR/EN.
  - **Acceptation :** le H1 explique l’offre sans contexte externe et reste une unique balise `h1`.
  - **Tests :** desktop/mobile, lecteur d’écran (structure des titres).

- [x] **02 — [P0] Hero : expliciter la différenciation.**
  - **État actuel :** la description est traduite mais ne formalise pas clairement l’adaptation tuteur/niveau/matière/objectif.
  - **Fichiers :** `lib/translations.ts`, `components/Hero/index.tsx`.
  - **Solution :** ajouter une ou deux phrases maximum expliquant l’accompagnement personnalisé.
  - **Dépendances :** wording validé par l’équipe pédagogique.
  - **Acceptation :** la valeur ajoutée est comprise sans devoir ouvrir une autre page.
  - **Tests :** desktop/mobile, relecture FR/EN.

- [x] **03 — [P0] CTA : instaurer un CTA primaire unique.**
  - **État actuel :** les libellés et points d’entrée varient entre hero, header, promotions et pages d’offres.
  - **Fichiers :** `components/Hero/index.tsx`, `components/Header/index.tsx`, `components/StagePromo/index.tsx`, `lib/translations.ts`.
  - **Solution :** centraliser un libellé tel que « Réserver ma séance d’essai gratuite » et une action d’ouverture de réservation.
  - **Dépendances :** décision métier sur l’intitulé et l’éligibilité de l’essai.
  - **Acceptation :** tous les CTA d’acquisition primaires ont le même libellé et le même résultat.
  - **Tests :** desktop/mobile, clavier, suivi du clic.

- [ ] **04 — [P0] CTA : instaurer un CTA secondaire unique.**
  - **État actuel :** les liens vers les prix, packs et réservation sont visuellement proches selon les sections.
  - **Fichiers :** `components/Hero/index.tsx`, `components/Pricing/index.tsx`, `components/Header/index.tsx`.
  - **Solution :** adopter « Voir les tarifs » comme action secondaire, avec une variante visuelle inférieure au CTA primaire.
  - **Dépendances :** item 03 et composant bouton (item 36).
  - **Acceptation :** une action principale et une secondaire sont reconnaissables immédiatement.
  - **Tests :** desktop/mobile, contraste et focus.

- [x] **05 — [P0] Conversion : retirer l’e-mail du hero.**
  - **État actuel :** `components/Hero/index.tsx` demande un e-mail puis ouvre la modale de lead.
  - **Fichiers :** `components/Hero/index.tsx`, `components/Booking/LeadCaptureModal.tsx`, `lib/storage.ts`.
  - **Solution :** remplacer le formulaire par le CTA primaire ; recueillir les données au moment opportun dans le parcours de réservation.
  - **Dépendances :** mesure de conversion (item 50) et validation marketing.
  - **Acceptation :** aucun champ personnel n’est visible dans le hero ; la réservation conserve un préremplissage si nécessaire.
  - **Tests :** desktop/mobile, clavier, régression création de lead.

- [x] **06 — [P0] Hero : ajouter une réassurance vérifiable.**
  - **État actuel :** la mention d’essai gratuit existe, mais aucune micro-zone structurée sous les CTA.
  - **Fichiers :** `components/Hero/index.tsx`, `lib/translations.ts`.
  - **Solution :** afficher 2–3 preuves courtes (« Première séance gratuite », « Sans engagement », volume de familles) uniquement si justifiées.
  - **Dépendances :** preuves métier pour chaque affirmation ; item 28 pour les chiffres.
  - **Acceptation :** chaque affirmation est sourcée et lisible sans surcharger le hero.
  - **Tests :** desktop/mobile, contraste, relecture légale.

- [ ] **07 — [P0] Contenu : rendre les campagnes saisonnières configurables.**
  - **État actuel :** l’offre de rentrée active est affichée par `StagePromo` et le backend reconnaît la campagne `back_to_school` ; son activation reste codée en dur.
  - **Fichiers :** `components/StagePromo/index.tsx`, `lib/translations.ts`, `app/api/leads/**`, `lib/registration-emails.ts`.
  - **Solution :** introduire une configuration de campagne datée/activable avec un fallback neutre, sans supprimer l’historique de suivi.
  - **Dépendances :** calendrier marketing, libellés et règles de lead validés.
  - **Acceptation :** une campagne expirée ne s’affiche pas et une nouvelle offre peut être activée sans modification dispersée.
  - **Tests :** desktop/mobile, dates limites, création de lead et e-mails.

- [ ] **08 — [P0] Copywriting : fixer la cible de chaque bloc.**
  - **État actuel :** le ton oscille entre élève et parent dans les textes traduits et les sections publiques.
  - **Fichiers :** `lib/translations.ts`, `components/{Hero,About,FunFact,Pricing,Contact}/**`.
  - **Solution :** documenter la cible de chaque section et réécrire les formulations incohérentes.
  - **Dépendances :** décision marketing : parent, élève ou segment explicite.
  - **Acceptation :** chaque bloc public s’adresse à une seule cible identifiable.
  - **Tests :** relecture éditoriale FR/EN, desktop/mobile.

- [ ] **09 — [P1] Copywriting : remplacer les formulations génériques.**
  - **État actuel :** plusieurs accroches restent institutionnelles ou abstraites.
  - **Fichiers :** `lib/translations.ts`, composants de la homepage.
  - **Solution :** privilégier bénéfice concret, déroulé et résultat attendu ; conserver la tonalité de marque.
  - **Dépendances :** item 08.
  - **Acceptation :** chaque section répond à « ce que j’obtiens », « comment » ou « pour qui ».
  - **Tests :** relecture marketing, variantes A/B si instrumentées.

- [ ] **10 — [P0] Homepage : réordonner selon la décision.**
  - **État actuel :** les avis arrivent après About/FunFact et la promotion saisonnière est juste sous le hero.
  - **Fichiers :** `app/(site)/page.tsx`, composants de sections.
  - **Solution :** tester `Promesse → Réassurance → Avis → Fonctionnement → Tuteurs → Tarifs → FAQ → CTA final` avec ancres cohérentes.
  - **Dépendances :** contenus des items 06, 23–28 et FAQ ; mesure item 50.
  - **Acceptation :** la séquence est validée par un prototype et les ancres/navigation restent fonctionnelles. Les témoignages et la FAQ sont désormais intégrés ; la section Tuteurs reste à intégrer.
  - **Tests :** desktop/mobile, navigation par clavier, métriques de scroll et CTA.

## Lot 2 — Navigation, offres et confiance

- [ ] **11 — [P1] Navigation : limiter les destinations principales.**
  - **État actuel :** `components/Header/menuData.tsx` expose Accueil, Comment ça marche, À propos, packs et séance à l’unité.
  - **Fichiers :** `components/Header/menuData.tsx`, `components/Header/index.tsx`.
  - **Solution :** prioriser Comment ça marche, Tarifs, Tuteurs, Avis, Connexion et isoler le CTA de réservation.
  - **Dépendances :** items 10 et 23 ; validation de l’architecture d’information.
  - **Acceptation :** le menu desktop/mobile comporte uniquement les destinations retenues et le CTA est distinct.
  - **Tests :** desktop/mobile, clavier, liens et menu mobile.

- [ ] **12 — [P1] Navigation : uniformiser les intitulés.**
  - **État actuel :** les destinations publiques et les ancres n’emploient pas toujours le même vocabulaire.
  - **Fichiers :** `components/Header/menuData.tsx`, `lib/translations.ts`, `app/(site)/page.tsx`.
  - **Solution :** définir un glossaire et le réutiliser dans menu, titres, CTA et fil d’Ariane éventuel.
  - **Dépendances :** item 15.
  - **Acceptation :** une destination a un seul intitulé dans chaque langue.
  - **Tests :** relecture FR/EN, liens desktop/mobile.

- [ ] **13 — [P1] Navigation : clarifier l’état actif.**
  - **État actuel :** l’état actif est géré par comparaison de pathname ; les ancres de la homepage ne sont pas suivies.
  - **Fichiers :** `components/Header/index.tsx`, `components/Header/menuData.tsx`.
  - **Solution :** renforcer le style actif et, si les ancres sont conservées, synchroniser l’état avec le scroll.
  - **Dépendances :** items 10–12.
  - **Acceptation :** page ou section courante identifiable sans ambiguïté.
  - **Tests :** desktop/mobile, clavier, scroll et thème sombre.

- [x] **14 — [P1] Navigation : vérifier le retour accueil du logo.**
  - **État actuel :** le logo est déjà un `Link` vers `/` dans le header.
  - **Fichiers :** `components/Header/index.tsx`.
  - **Solution :** conserver ce comportement, améliorer le nom accessible (`alt`/`aria-label`) et le tester.
  - **Dépendances :** aucune.
  - **Acceptation :** clic, clavier et lecteur d’écran permettent de revenir à l’accueil.
  - **Tests :** desktop/mobile, Tab/Entrée, lecteur d’écran.

- [ ] **15 — [P0] Terminologie : normaliser les offres.**
  - **État actuel :** « pack », « formule », « cours/mois » et « à la séance » coexistent ; le catalogue emploie `PACK`.
  - **Fichiers :** `components/{Pricing,Packs}/**`, `lib/{payments-catalog,stripe,translations}.ts`, pages publiques.
  - **Solution :** choisir les noms métier et créer un glossaire partagé.
  - **Dépendances :** décision commerciale et juridique.
  - **Acceptation :** mêmes termes dans UI, paiement, e-mails et documentation.
  - **Tests :** recherche textuelle, relecture FR/EN, parcours paiement.

- [x] **16 — [P0] Packs : faire du niveau l’information principale.**
  - **État actuel :** le catalogue expose `NOTA`, `AVA`, `TODA`; le niveau est déjà un badge dans les cartes.
  - **Fichiers :** `lib/payments-catalog.ts`, `components/Packs/index.tsx`, `components/HowTo/index.tsx`, `lib/stripe.ts`.
  - **Solution :** titrer les cartes par Collège/Lycée/Supérieur, garder les noms internes en secondaire ou les retirer du front.
  - **Dépendances :** item 15, compatibilité des identifiants Stripe.
  - **Acceptation :** la comparaison ne demande aucune connaissance des sigles internes.
  - **Tests :** desktop/mobile, checkout, régression des IDs produits.

- [x] **17 — [P0] Tarifs : afficher le prix unitaire.**
  - **État actuel :** les cartes promotionnelles de `Pricing` n’affichent pas de prix ; la page dédiée doit servir de source unique à vérifier.
  - **Fichiers :** `app/(site)/book-online/page.tsx`, `components/Pricing/index.tsx`, `lib/payments-catalog.ts`.
  - **Solution :** exposer le tarif de la séance, TTC et sans ambiguïté, depuis le catalogue.
  - **Dépendances :** validation prix/taxe ; item 15.
  - **Acceptation :** un visiteur connaît le prix avant prise de rendez-vous.
  - **Tests :** desktop/mobile, cohérence catalogue/Stripe.

- [x] **18 — [P0] Tarifs : afficher le coût effectif par séance.**
  - **État actuel :** `components/Packs/index.tsx` calcule déjà « soit X €/séance » pour les packs.
  - **Fichiers :** `components/Packs/index.tsx`, `lib/payments-catalog.ts`.
  - **Solution :** conserver le calcul, le rendre systématique et le positionner au même endroit sur toutes les cartes.
  - **Dépendances :** item 21.
  - **Acceptation :** toutes les formules affichent total, nombre de séances et prix par séance.
  - **Tests :** desktop/mobile, tests de calcul, devise/arrondi.

- [ ] **19 — [P0] Tarifs : afficher l’économie réelle.**
  - **État actuel :** `Pricing` montre des pourcentages de réduction sans calcul source visible.
  - **Fichiers :** `components/Pricing/index.tsx`, `components/Packs/index.tsx`, `lib/payments-catalog.ts`.
  - **Solution :** dériver l’économie du tarif unitaire, ou supprimer toute promesse de réduction non démontrée.
  - **Dépendances :** item 17 et validation commerciale.
  - **Acceptation :** toute économie affichée correspond exactement aux prix affichés.
  - **Tests :** tests unitaires de calcul, relecture légale, desktop/mobile.

- [ ] **20 — [P0] Tarifs : définir « sans engagement ».**
  - **État actuel :** les cartes Packs affichent « Sans Engagement » sans détail de validité, report ou annulation.
  - **Fichiers :** `components/Packs/index.tsx`, `components/Pricing/index.tsx`, pages légales/FAQ à créer ou enrichir.
  - **Solution :** publier les conditions exactes près du prix et dans une FAQ accessible.
  - **Dépendances :** politique commerciale et juridique.
  - **Acceptation :** renouvellement, validité, annulation et report sont compréhensibles avant paiement.
  - **Tests :** desktop/mobile, liens FAQ, validation juridique.

- [ ] **21 — [P1] Tarifs : uniformiser les cartes.**
  - **État actuel :** les cartes `Pricing` et `Packs` ont des structures et CTA différents.
  - **Fichiers :** `components/Pricing/index.tsx`, `components/Packs/index.tsx`, futur composant partagé.
  - **Solution :** définir l’ordre niveau → séances → prix → prix/séance → avantages → CTA.
  - **Dépendances :** items 15, 17–20, 35–36.
  - **Acceptation :** cartes comparables en une lecture verticale, sans régression du paiement.
  - **Tests :** desktop/mobile, thème sombre, clavier et capture visuelle.

- [ ] **22 — [P1] Tarifs : marquer une formule recommandée seulement si justifiée.**
  - **État actuel :** les cartes sont équivalentes ; les remises colorées peuvent être interprétées comme recommandation.
  - **Fichiers :** `components/{Pricing,Packs}/**`, `lib/payments-catalog.ts`.
  - **Solution :** ajouter un champ de recommandation documenté, ou ne mettre aucune formule en avant.
  - **Dépendances :** décision commerciale, item 21.
  - **Acceptation :** une recommandation indique clairement à qui elle convient et peut être désactivée.
  - **Tests :** desktop/mobile, cohérence des données.

- [ ] **23 — [P0] Tuteurs : créer des profils de confiance.**
  - **État actuel :** les tuteurs sont accessibles côté élève ; aucune présentation publique structurée n’est reliée à la homepage auditée.
  - **Fichiers :** `components/AboutPage/index.tsx`, données/profils tuteurs, pages publiques à identifier.
  - **Solution :** créer des cartes avec photo autorisée, prénom/nom, matières, niveaux, formation et expérience.
  - **Dépendances :** consentement des tuteurs, modèle de données et modération.
  - **Acceptation :** chaque profil public est complet, exact et accessible.
  - **Tests :** desktop/mobile, alt des portraits, protection des données.

- [ ] **24 — [P0] Tuteurs : expliquer la sélection.**
  - **État actuel :** les critères de sélection ne sont pas exposés dans la homepage auditée.
  - **Fichiers :** `components/About/**` ou nouvelle section, `lib/translations.ts`.
  - **Solution :** publier les étapes réellement appliquées (académique, entretien, pédagogie, expérience, suivi).
  - **Dépendances :** validation opérationnelle de chaque critère.
  - **Acceptation :** le texte ne promet rien qui ne soit effectif.
  - **Tests :** relecture métier/juridique, desktop/mobile.

- [ ] **25 — [P0] Grandes écoles : contextualiser les logos.**
  - **État actuel :** les logos sont présents dans `public/images/logo/` ; leur contexte doit être explicité au rendu.
  - **Fichiers :** composant qui consomme ces logos, `components/Brands/**`, `lib/translations.ts`.
  - **Solution :** indiquer factuellement « Nos tuteurs et fondateurs sont notamment issus de… » si vrai ; sinon retirer les logos.
  - **Dépendances :** validation factuelle et droits d’usage des marques.
  - **Acceptation :** aucune apparence de partenariat officiel non démontré.
  - **Tests :** desktop/mobile, lecteur d’écran, validation légale.

- [x] **26 — [P0] Témoignages : remonter les preuves sociales.**
  - **État actuel :** `Testimonial` est après About et FunFact ; les avis proviennent de `/api/testimonials`.
  - **Fichiers :** `app/(site)/page.tsx`, `components/Testimonial/index.tsx`, `app/api/testimonials/route.ts`.
  - **Solution :** placer un aperçu d’avis crédibles plus tôt et conserver une section complète plus bas si utile.
  - **Dépendances :** item 10, données d’avis modérées.
  - **Acceptation :** plusieurs avis s’affichent avant l’analyse détaillée des offres, avec état de chargement approprié.
  - **Tests :** desktop/mobile, chargement réseau lent, clavier du carousel.

- [ ] **27 — [P1] Témoignages : ajouter du contexte.**
  - **État actuel :** le modèle expose nom, rôle, contenu, note et avatar ; le contexte pédagogique est facultatif.
  - **Fichiers :** `components/Testimonial/**`, API et schéma Supabase si nécessaire.
  - **Solution :** ajouter niveau/matière/objectifs avec consentement, ou utiliser un rôle descriptif standardisé.
  - **Dépendances :** migration/données, consentement et modération.
  - **Acceptation :** chaque avis affiché aide à identifier le cas d’usage sans surexposer la personne.
  - **Tests :** desktop/mobile, données absentes, confidentialité.

- [ ] **28 — [P0] Preuves : sourcer les statistiques.**
  - **État actuel :** `FunFact` affiche notamment 5+, 200+ et 95 % ; les libellés se trouvent dans `lib/translations.ts`.
  - **Fichiers :** `components/FunFact/index.tsx`, `lib/translations.ts`, source de données/documentation.
  - **Solution :** préciser population, période et définition, ou remplacer par une information vérifiable moins ambiguë.
  - **Dépendances :** données métier et validation juridique.
  - **Acceptation :** chaque chiffre public est traçable à une source interne datée.
  - **Tests :** desktop/mobile, relecture légale, mise à jour annuelle.

- [ ] **29 — [P1] Crédibilité : privilégier les photos authentiques.**
  - **État actuel :** le dépôt contient des portraits dans `public/images/team/` et des illustrations génériques.
  - **Fichiers :** `components/AboutPage/index.tsx`, `public/images/team/`, futurs profils tuteurs.
  - **Solution :** utiliser des photos autorisées et optimisées lorsque la personne présentée délivre le service.
  - **Dépendances :** consentement, droits à l’image, item 47.
  - **Acceptation :** chaque image de personne est exacte, pertinente et dispose d’un texte alternatif adapté.
  - **Tests :** desktop/mobile, performance, accessibilité.

- [ ] **30 — [P1] Contact : utiliser l’adresse du domaine.**
  - **État actuel :** le footer contient `sikaschoolservice@gmail.com`; `dpo@sikaschool.com` est déjà utilisé pour les données personnelles.
  - **Fichiers :** `components/Footer/index.tsx`, `lib/constants.ts`, `lib/registration-emails.ts`.
  - **Solution :** mettre en place et centraliser une adresse `@sikaschool.com` réellement délivrable.
  - **Dépendances :** configuration DNS/boîte mail et gestion de réception.
  - **Acceptation :** les adresses publiques du site utilisent le domaine et les liens `mailto:` fonctionnent.
  - **Tests :** desktop/mobile, test de délivrabilité, relecture légale.

## Lot 3 — Design system, mobile et accessibilité

- [ ] **31 — [P1] Typographie : documenter une échelle globale.**
  - **État actuel :** `app/globals.css` définit plusieurs tokens de texte ; les composants utilisent aussi des tailles Tailwind locales.
  - **Fichiers :** `app/globals.css`, `components/Common/SectionHeader.tsx`, composants publics.
  - **Solution :** définir et documenter H1/H2/H3/corps/meta/label, puis migrer progressivement.
  - **Dépendances :** inventaire des pages ; ne pas modifier les polices de marque sans validation.
  - **Acceptation :** une même fonction éditoriale emploie le même style sur les pages publiques.
  - **Tests :** desktop/mobile, zoom 200 %, thème sombre.

- [ ] **32 — [P1] Typographie : limiter la largeur des textes longs.**
  - **État actuel :** plusieurs sections utilisent des conteneurs larges ; les largeurs de lecture ne sont pas systématisées.
  - **Fichiers :** composants de sections publiques, `app/globals.css`.
  - **Solution :** ajouter une utilitaire de largeur de lecture et l’appliquer aux paragraphes longs.
  - **Dépendances :** item 31.
  - **Acceptation :** les textes courants restent confortables sur desktop et ne créent pas de rupture sur mobile.
  - **Tests :** 320 px, 768 px, 1440 px, zoom 200 %.

- [ ] **33 — [P1] Spacing : créer une échelle réutilisable.**
  - **État actuel :** les espacements sont majoritairement déclarés directement dans les classes Tailwind.
  - **Fichiers :** `app/globals.css`, composants publics.
  - **Solution :** documenter les pas 4/8/12/16/24/32/48/64 et les introduire par lots.
  - **Dépendances :** audit visuel, item 34.
  - **Acceptation :** les nouvelles sections n’introduisent plus de valeurs arbitraires non justifiées.
  - **Tests :** captures desktop/mobile, thème sombre.

- [ ] **34 — [P1] Sections : renforcer la séparation spatiale.**
  - **État actuel :** les sections s’enchaînent avec des marges variables sans règle documentée.
  - **Fichiers :** `app/(site)/page.tsx`, composants de sections, `app/globals.css`.
  - **Solution :** utiliser whitespace, conteneurs et séparateurs existants plutôt que de nouvelles couleurs.
  - **Dépendances :** item 33 et nouvel ordre item 10.
  - **Acceptation :** les groupes de contenu sont perceptibles sans toucher à la palette.
  - **Tests :** desktop/mobile, contraste, capture visuelle.

- [ ] **35 — [P1] Composants : standardiser les cartes.**
  - **État actuel :** `PricingCard`, cartes Packs, avis et contenus ont leur propre padding/rayon/ombre.
  - **Fichiers :** `components/{Pricing,Packs,Testimonial}/**`, futur `components/Common/Card.tsx`.
  - **Solution :** définir variantes de carte et tokens (padding, radius, bordure, CTA), sans uniformiser abusivement les contenus.
  - **Dépendances :** items 21, 31, 33.
  - **Acceptation :** les cartes de même nature partagent une API et des règles visuelles.
  - **Tests :** desktop/mobile, thème sombre, capture visuelle.

- [ ] **36 — [P1] Boutons : standardiser les variantes.**
  - **État actuel :** les classes de boutons sont répétées dans Hero, Header, StagePromo, Packs et Contact.
  - **Fichiers :** composants publics, futur `components/Common/Button.tsx` ou classes utilitaires.
  - **Solution :** créer `primary`, `secondary`, `text/link`, `disabled`, `loading`, `hover`, `focus` avec la palette existante.
  - **Dépendances :** item 03–04 ; audit des boutons d’actions sensibles.
  - **Acceptation :** aucun CTA public ne masque son état focus/loading/disabled.
  - **Tests :** desktop/mobile, clavier, contraste, lecteur d’écran.

- [ ] **37 — [P0] Mobile : assurer des cibles tactiles confortables.**
  - **État actuel :** certaines commandes ont des paddings réduits et aucun minimum de taille partagé.
  - **Fichiers :** `components/{Header,Hero,StagePromo,Packs,Contact}/**`, styles communs.
  - **Solution :** viser environ 44×44 px pour les contrôles principaux, sans casser leur densité sur desktop.
  - **Dépendances :** item 36.
  - **Acceptation :** les contrôles essentiels atteignent 24×24 CSS px au minimum, 44 px cible quand possible.
  - **Tests :** 320 px, appareil tactile, audit WCAG 2.2 cible tactile.

- [x] **38 — [P0] Accessibilité : rendre le focus visible.**
  - **État actuel :** de nombreuses occurrences de `focus:outline-hidden`/`focus-visible:outline-hidden` ont été relevées ; le focus n’est pas garanti partout.
  - **Fichiers :** `app/globals.css`, composants contenant boutons/liens/champs.
  - **Solution :** définir un focus ring global visible avec les couleurs existantes et un `scroll-margin-top` compatible header sticky.
  - **Dépendances :** inventaire des contrôles, item 36.
  - **Acceptation :** chaque élément interactif focalisé est visible et non masqué par le header.
  - **Tests :** Tab/Shift+Tab sur desktop, mobile clavier, thème clair/sombre.

- [ ] **39 — [P0] Accessibilité : valider tous les parcours au clavier.**
  - **État actuel :** Header et certaines modales gèrent Échap, mais le parcours entier n’est pas couvert par des tests.
  - **Fichiers :** `components/Header/index.tsx`, `components/Booking/LeadCaptureModal.tsx`, composants Auth, accordéons et carrousels.
  - **Solution :** établir une matrice de navigation clavier, ajouter piège de focus/retour de focus dans les modales si manquants.
  - **Dépendances :** item 38 ; tests E2E à choisir.
  - **Acceptation :** réservation, connexion, menu, modales et FAQ sont réalisables sans souris.
  - **Tests :** parcours Tab/Entrée/Espace/Échap, lecteur d’écran.

- [ ] **40 — [P0] Formulaires : fournir des labels persistants.**
  - **État actuel :** Hero et Contact s’appuient sur les placeholders ; Contact n’a pas de labels de champs visibles.
  - **Fichiers :** `components/{Hero,Contact}/**`, `components/Booking/LeadCaptureModal.tsx`, Auth.
  - **Solution :** ajouter `label` associé, visuellement visible ou au minimum conforme au design, et conserver le placeholder comme exemple.
  - **Dépendances :** inventaire de tous les champs.
  - **Acceptation :** aucun champ public n’a le placeholder pour unique étiquette.
  - **Tests :** lecteur d’écran, zoom, desktop/mobile.

- [ ] **41 — [P0] Formulaires : réduire les champs avant réservation.**
  - **État actuel :** la modale de lead collecte niveau, matière, identité, e-mail, téléphone, code postal, objectif et parfois concours.
  - **Fichiers :** `components/Booking/LeadCaptureModal.tsx`, `app/api/leads/route.ts`.
  - **Solution :** conserver avant choix de créneau seulement les informations indispensables ; différer le reste après engagement ou confirmation.
  - **Dépendances :** contraintes opérationnelles, RGPD, instrumentation item 50.
  - **Acceptation :** chaque champ a une finalité justifiée et le backend accepte le nouvel ordre.
  - **Tests :** desktop/mobile, API, données incomplètes, taux d’abandon.

- [ ] **42 — [P0] Formulaires : découper la réservation en étapes.**
  - **État actuel :** `LeadCaptureModal` concentre un volume important de saisies dans une même modale.
  - **Fichiers :** `components/Booking/LeadCaptureModal.tsx`, éventuellement sous-composants `components/Booking/**`.
  - **Solution :** créer des étapes `Niveau → Matière → Créneau → Coordonnées → Confirmation` avec progression lisible et retour possible.
  - **Dépendances :** item 41, persistance temporaire, validation API.
  - **Acceptation :** l’utilisateur peut revenir, conserver ses données et comprendre son avancement.
  - **Tests :** desktop/mobile, clavier, rafraîchissement, réseau lent.

- [ ] **43 — [P0] Formulaires : indiquer les champs requis/facultatifs.**
  - **État actuel :** les règles de validité existent dans la modale mais le caractère obligatoire n’est pas uniformément annoncé.
  - **Fichiers :** `components/Booking/LeadCaptureModal.tsx`, Auth, Contact.
  - **Solution :** afficher « obligatoire »/« facultatif » dans les labels et une légende non fondée uniquement sur la couleur.
  - **Dépendances :** item 40–42, validation métier des données requises.
  - **Acceptation :** l’utilisateur sait avant saisie quelles données sont nécessaires.
  - **Tests :** lecteur d’écran, desktop/mobile, validation de formulaire.

- [ ] **44 — [P0] Formulaires : afficher des erreurs actionnables.**
  - **État actuel :** le hero journalise une erreur de validation dans la console ; la modale bloque l’envoi si invalide.
  - **Fichiers :** `components/Hero/index.tsx`, `components/Booking/LeadCaptureModal.tsx`, Auth, Contact.
  - **Solution :** afficher un message précis lié au champ via `aria-describedby` et un résumé si nécessaire.
  - **Dépendances :** item 40 et un composant d’erreur commun.
  - **Acceptation :** toute erreur explique quoi corriger et où, sans erreur technique vague.
  - **Tests :** lecteur d’écran, clavier, desktop/mobile, réponses API 4xx/5xx.

- [ ] **45 — [P0] Formulaires : conserver les valeurs après erreur.**
  - **État actuel :** certains états sont gérés localement ; ce comportement doit être garanti pour toutes les erreurs client/serveur.
  - **Fichiers :** `components/Booking/LeadCaptureModal.tsx`, Auth, Contact, routes API concernées.
  - **Solution :** dissocier les valeurs de formulaire des états de soumission/erreur et ne réinitialiser qu’après succès confirmé.
  - **Dépendances :** items 42 et 44.
  - **Acceptation :** une erreur réseau ou métier ne supprime aucune saisie utile.
  - **Tests :** erreur client, 400, 500, perte réseau, retour d’étape.

## Lot 4 — Images, performance et validation continue

- [ ] **46 — [P1] Images : corriger les textes alternatifs.**
  - **État actuel :** des images décoratives sont nommées « Man », « Doodle » ou « Dotted » dans `FunFact`, `Pricing` et `Contact`.
  - **Fichiers :** `components/{FunFact,Pricing,Contact}/**`, autres usages de `next/image`.
  - **Solution :** passer les visuels décoratifs à `alt=""` et décrire uniquement l’information réellement transmise.
  - **Dépendances :** inventaire des images publiques.
  - **Acceptation :** aucun alt générique ne pollue la lecture, aucune image informative n’est silencieuse.
  - **Tests :** lecteur d’écran, audit axe/Lighthouse.

- [ ] **47 — [P1] Performance : optimiser l’élément LCP du hero.**
  - **État actuel :** le hero audité est surtout textuel ; l’élément LCP réel doit être mesuré sur production avant optimisation.
  - **Fichiers :** `components/Hero/index.tsx`, assets du hero éventuels, `next.config.js`.
  - **Solution :** identifier le LCP réel, optimiser sa ressource (format, taille, priorité) sans lazy-loading pour l’élément critique.
  - **Dépendances :** données RUM/Lighthouse, item 50 si instrumentation web vitals.
  - **Acceptation :** LCP ≤ 2,5 s au 75e percentile pour les parcours ciblés.
  - **Tests :** Lighthouse mobile, WebPageTest/production, réseau simulé.

- [ ] **48 — [P1] Performance : servir des images responsives.**
  - **État actuel :** le projet utilise largement `next/image`, mais plusieurs usages `fill` ne documentent pas encore systématiquement `sizes`.
  - **Fichiers :** composants utilisant `next/image`, `next.config.js`.
  - **Solution :** fournir `sizes` précis, dimensions/aspect ratios et formats adaptés ; vérifier les images importées statiquement.
  - **Dépendances :** inventaire des assets et item 47.
  - **Acceptation :** mobile ne télécharge pas une image desktop surdimensionnée.
  - **Tests :** DevTools réseau, Lighthouse, appareils mobile/desktop.

- [ ] **49 — [P1] Performance : empêcher les décalages de mise en page.**
  - **État actuel :** de nombreuses images ont des dimensions, mais les contenus dynamiques (avis, sections) doivent être mesurés.
  - **Fichiers :** `components/{Testimonial,Hero,Contact,FunFact}/**`, composants chargés dynamiquement.
  - **Solution :** réserver l’espace avec `width`/`height`/`aspect-ratio` et des squelettes de même hauteur.
  - **Dépendances :** audit CLS en production.
  - **Acceptation :** CLS ≤ 0,1 au 75e percentile sur pages cibles.
  - **Tests :** Lighthouse, throttling réseau, capture de layout shift.

- [ ] **50 — [P1] Validation UX : mesurer et tester les lots.**
  - **État actuel :** aucun outil analytics/funnel n’a été trouvé dans le code audité.
  - **Fichiers :** provider d’analytics à choisir, `components/{Hero,Header,Booking}/**`, politique de confidentialité/cookies.
  - **Solution :** instrumenter `clic CTA → démarrage réservation → niveau/matière → créneau → coordonnées → confirmation`, puis mener des tests avec environ 5 utilisateurs représentatifs.
  - **Dépendances :** choix de l’outil, consentement RGPD, définition des événements et baseline avant changement.
  - **Acceptation :** un tableau permet de suivre succès, erreurs, abandons et retours qualitatifs par lot.
  - **Tests :** contrôle des événements, opt-in/opt-out cookies, test utilisateur desktop/mobile/clavier.

## Ordre de réalisation conseillé

1. **Fondations de conversion :** 01–08, 15–20, 37–45.
2. **Information et confiance :** 10–14, 23–30.
3. **Système visuel cohérent :** 31–36.
4. **Optimisation et validation :** 46–50.

Ne lancer un lot que lorsque ses dépendances métier sont validées. Après chaque lot P0, vérifier les parcours de réservation, d’authentification et de paiement avant le lot suivant.

## Références

- [Nielsen Norman Group — 10 heuristiques d’utilisabilité](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Nielsen Norman Group — Hiérarchie visuelle](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)
- [Nielsen Norman Group — Cohérence et standards](https://www.nngroup.com/articles/consistency-and-standards/)
- [Baymard Institute — Réduire les champs de formulaire](https://baymard.com/blog/checkout-flow-average-form-fields)
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C — Tutoriel formulaires](https://www.w3.org/WAI/tutorials/forms/)
- [GOV.UK Design System — Messages d’erreur](https://design-system.service.gov.uk/components/error-message/)
- [web.dev — Optimiser le LCP](https://web.dev/articles/optimize-lcp?hl=fr)
- [web.dev — Images responsives](https://web.dev/articles/preload-responsive-images)
- [web.dev — Optimiser le CLS](https://web.dev/articles/optimize-cls?hl=en)
- [Nielsen Norman Group — Nombre d’utilisateurs pour les tests](https://www.nngroup.com/articles/how-many-test-users/)
