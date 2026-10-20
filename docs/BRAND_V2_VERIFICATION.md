# Recette de l’identité SIKASCHOOL V2

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
