# Identité visuelle officielle SIKASCHOOL V2

Référence prioritaire du **20 octobre 2026**, issue de l’addendum du propriétaire. Elle remplace les hypothèses graphiques précédentes, notamment l’interdiction historique de changer la palette. [roadmap.md](roadmap.md) reste le seul backlog d’exécution.

## Sources et limites d’accès

Les visuels `1.png`, `2.png`, `3.png`, `4.png`, `10.png`, `11.png`, `12.png`, `14.png`, l’archive `carrousel stage ete-20261006T130013Z-1-001.zip` et le PDF `STRATÉGIE DE COMMUNICATION INSTA sikaschool.pdf` n’ont pas été trouvés dans le dépôt. Ils **n’ont pas été inspectés**. L’implémentation repose sur les spécifications textuelles de l’addendum ; une comparaison directe reste à faire après réception des originaux.

Ordre de référence : supports officiels et addendum SIKASCHOOL → sophistication éditoriale inspirée d’Akaru → principes techniques de DANEMO. Akaru n’est pas une identité de remplacement. Aucun site de référence n’a été inspecté pendant cette intervention.

## Palette et migration

| Token | Valeur | Rôle |
| --- | --- | --- |
| `--sika-brand-blue` | `#1E3A8A` | Couleur identitaire dominante, titres, liens, sections fortes |
| `--sika-brand-orange` | `#FFBC58` | Accent signature, mots clés, numéros, CTA |
| `--sika-brand-white` | `#FFFFFF` | Respiration et surfaces |
| `--sika-surface-muted` | `#F0F1F5` | Surfaces secondaires neutres |

Les alias Tailwind `primary`, `primaryho`, `meta`, `titlebg`, `titlebg2`, `zumthor` sont migrés dans `app/globals.css` pour préserver les composants existants. `meta` est désormais un accent orange : ne pas y associer du texte blanc. Les usages actifs publics de cet alias ont été audités. Le survol bleu `#172E6E`, le texte `#26324B`, le texte secondaire `#525D73` et les bordures sont des dérivés fonctionnels documentés. Les couleurs de succès, erreur et avertissement des formulaires conservent leur sens ; elles ne deviennent pas des accents décoratifs.

Le bleu historique `#006BFF` n’est plus le token de marque. Les variantes locales de la promotion (`#24428F`, `#FFB84D`) sont remplacées par les tokens officiels. Les badges de niveau des packs utilisent bleu, orange et neutres, avec leur libellé explicite. Les cases à cocher publiques n’utilisent plus `text-blue-600`.

Les anciennes illustrations du template restent des fichiers historiques ; elles ne sont plus utilisées dans le hero, la signature, les statistiques ou le CTA final. Le logo existant est conservé : son SVG contient une image matricielle embarquée, qui ne doit pas être recolorée automatiquement. Les photographies et logos tiers ne doivent pas subir de remplacement aveugle des couleurs.

### Contraste

Le couple bleu/orange offre environ **6,21:1**, bleu/blanc **10,36:1**. Blanc/orange offre seulement **1,67:1** : interdit pour du texte lisible. Un mot orange sur fond blanc doit donc être remplacé par du bleu sur surlignage orange ou réservé à un élément purement décoratif. Le hero et le CTA utilisent le surlignage ; la signature utilise l’orange sur bleu. Ces valeurs sont calculées à partir des luminances relatives sRGB selon la formule WCAG.

Les nouveaux boutons sont orange/bleu, ou bleu/blanc ; le focus est bleu sur fond clair, blanc en thème sombre. Les titres et surfaces ont des variantes sombres explicites. Pas de succession de grands aplats bleus : une seule grande transition identitaire, entourée de sections blanches et neutres.

En thème sombre, les textes/liens publics hérités portant `text-primary` utilisent l’orange pour rester lisibles. Leur alias de fond reste bleu : aucune substitution globale du token primaire ne transforme les boutons bleu/blanc en orange/blanc.

## Typographie et licences

- Police primaire : **Sensa Wild Fill**, pour les titres et les accents graphiques, en graisse 400 sans gras synthétique.
- Police secondaire : retour à **Poppins** pour le corps, les formulaires et les interfaces publiques, en graisses 400/500/600/700 ; **Inter** dans les espaces connectés.
- Choix confirmé le 21 octobre 2026 : Sensa Wild Fill remplace Archivo Black pour les titres ; les anciennes polices secondaires sont rétablies à la demande du propriétaire.
- Chargement de Sensa Wild Fill via `next/font/local`, de Poppins et Inter via `next/font/google`, avec `display: swap`. Next.js héberge les fichiers avec le site ; le navigateur ne contacte pas Google Fonts.
- Sensa Wild Fill est proposé gratuitement par [Fontfabric](https://www.fontfabric.com/fonts/sensa/) ; son [EULA pour les polices gratuites](https://www.fontfabric.com/fontfabric-commercial-eula-for-free-fonts/) autorise l’intégration web. Poppins et Inter sont distribués sous SIL OFL 1.1. Source Sensa et licence : [`public/fonts/README.md`](../public/fonts/README.md).

Les capitales sont appliquées en CSS uniquement aux grands titres éditoriaux (`sika-display`) et aux courts surtitres. Champs, longs paragraphes et contenus fonctionnels restent en casse normale. Les tailles utilisent `clamp()`, les largeurs de lecture sont limitées, les retours se répartissent avec `text-wrap: balance` et `overflow-wrap`. Aucun mot long ne doit déborder à 320 px ou au zoom.

## Langage visuel et composants

Les compositions Instagram sont réinterprétées en HTML/React/CSS : grands titres, accentuation orange, numérotation 01–03, flèche typographique, courts encarts et alternance élèves/parents. Les images sociales ne servent pas de bannières. Les contenus restent indexables et les contrôles natifs restent utilisables au clavier.

Primitives CSS : `sika-container`, `sika-section`, `sika-display`, `sika-section-title`, `sika-eyebrow`, `sika-lead`, `sika-highlight`, `sika-button`, `sika-button-secondary`, `sika-button-blue`, `sika-text-link`. Les boutons partagent hauteur minimale 48 px, focus, survol et état désactivé. Les espacements structurants suivent 8/16/24/32/48/64 px, avec respiration fluide des sections.

React, Tailwind et Framer Motion sont les fondations réellement installées. Radix, shadcn/ui et Lucide restent une direction technique pour les futures primitives ; ils ne sont pas déclarés comme installés. Les contrôles natifs couvrent le besoin actuel sans ajouter une bibliothèque pour des éléments décoratifs. Les flèches sont masquées aux technologies d’assistance. `MotionConfig reducedMotion="user"` et la règle CSS `prefers-reduced-motion` respectent la préférence système.

## Homepage et parcours réel

Ordre : **Hero → témoignages → fonctionnement → signature → équipe → tarifs → FAQ → contact → CTA final**.

| Zone | Implémentation et garde-fous |
| --- | --- |
| Hero | Service « Cours particuliers en ligne » explicite ; accroche display, surlignage orange, photo déjà utilisée sur le site, première séance gratuite. La photo illustre l’usage, sans prétendre représenter une cliente réelle. |
| Matières | Vrai `select` avec label ; `/api/tutor-subjects` et repli `TUTOR_SUBJECTS`. Le catalogue actuel sépare `Physiques` et `Chimie`, et ne contient pas `Anglais` : aucun ajout marketing fictif. Les futures matières remontent depuis l’API. |
| Transmission | `useBooking({ subject })` transmet le choix à `LeadCaptureModal.initialSubject`. La modale revalide ce choix contre les options de l’API. |
| Fonctionnement | Niveau/matière/besoins → coordonnées → créneaux proposés → réservation de l’essai ; aucune mise en relation automatisée supplémentaire annoncée. La progression pédagogique vient ensuite. |
| Signature | « COMPRENDRE. PROGRESSER. RÉUSSIR. » en texte HTML ; bleu profond et orange. |
| Équipe | Identités et portraits déjà publiés sur la page À propos ; conseil pédagogique de Walid repris de cette page. Aucun diplôme, matière individuelle ou badge « vérifié » inféré. |
| Témoignages | Textes de `lib/homepage-testimonials.ts`, contexte conservé, présentation éditoriale statique. Aucune note ajoutée, pas d’avatar de banque d’images, pas de carrousel automatique. Consentement et pièces sources restent à contrôler. |
| Tarifs | Prix des packs Eco calculés depuis `CLIENT_PLANS`, TTC, total et prix par séance ; liens réels vers `/packs` et `/book-online`. Aucune réduction saisonnière réactivée. |
| CTA final | « Réservez votre première séance gratuite » ; même modale que le hero et le header. Vouvoiement cohérent avec le site, tutoiement limité à l’accroche secondaire « Tu galères en… ? ». |

`BookingContext` expose une action typée. Une seule instance de `LeadCaptureModal` vit dans `ClientProviders`. L’événement historique `lead:open` reste un adaptateur de compatibilité ; les CTA internes utilisent le contexte. Campagne et e-mail sont conservés. Le fond devient `inert` pendant l’ouverture ; le dialog conserve Échap, piège et retour de focus. Le header est sous le dialog. Le blocage tactile global est supprimé pour permettre le défilement du formulaire mobile.

Le formulaire Contact utilisait l’URL de démonstration `formbold.com/s/unique_form_id`. Il est remplacé par les coordonnées déjà présentes dans le dépôt (`mailto:`, WhatsApp) et une entrée vers le vrai formulaire de première séance. Aucun message de contact n’a été envoyé pendant la vérification. Le footer reprend ces destinations et le lien réel de confidentialité, avec retour à la ligne sur mobile.

`/booking` propose désormais l’entrée du vrai formulaire partagé au lieu d’un calendrier de janvier 2024 qui annonçait une confirmation fictive. Les pages publiques partagent une seule balise `main`, une cible d’évitement focalisable, les polices et les tokens ; À propos, fonctionnement, packs et séances ont un titre de page H1. Support et page d’erreur ont des métadonnées SIKASCHOOL.

Les URL réelles `/how-to`, `/booking`, `/book-online`, `/support`, `/donnees-personnelles` et `/error` sont déclarées dans `PUBLIC_ROUTES`, au lieu d’être redirigées vers la connexion. Le contrôle des rôles des portails conserve son périmètre existant.

## Stratégie éditoriale

Objectifs : excellence académique accessible, valeur de l’apprentissage, confiance fondée sur des preuves. Pour les élèves/étudiants : difficultés concrètes, méthode, progression et messages directs. Pour les parents : première séance, objectifs et modalités d’accompagnement expliqués factuellement. Aucune offre institutionnelle n’est annoncée sans offre existante.

Le concept de méthode des élèves obtenant de bonnes notes peut inspirer des conseils pédagogiques futurs, sans transformer `+15/20`, `70 %` ou toute autre note en garantie. Les anciens chiffres `5+`, `200+`, `95 %` ne sont plus rendus sur la homepage. Aucun nouveau résultat, diplôme, partenariat ou statistique n’est inventé.

## Suivi et recette

L’implémentation locale ne vaut ni publication ni validation métier. Les résultats de vérification sont consignés dans [BRAND_V2_VERIFICATION.md](BRAND_V2_VERIFICATION.md). Les tâches restantes sont rattachées à **UI-001, UX-004, UX-005, A11Y-001, A11Y-002, SK-006 et PERF-001** dans la roadmap.

La livraison complète des portraits détaillés reste conditionnée aux fiches authentiques (parcours, matières, méthodologie, qualifications vérifiées) et à leurs autorisations. Le dépôt fournit des noms, photos et conseils, sans justificatifs de diplômes ni registre de droits. Cette absence ne doit pas être masquée par un badge de vérification. Même règle pour les témoignages et les consentements. Les logos d’écoles sont retirés de la page À propos tant que leur contexte et leurs droits ne sont pas établis.
