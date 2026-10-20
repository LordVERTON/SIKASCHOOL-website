# Exécution prioritaire UX/UI — 20 octobre 2026

Branche : `feat(UX/UI)`. Backlog de référence : [roadmap.md](roadmap.md). Les changements V2 déjà présents avant ce lot sont conservés. Aucun déploiement n’est effectué.

## Changements

Les P0 d’interface précèdent les améliorations de navigation :

- **A11Y-001 / UI-001** : primitives React `Button`, `Card`, `Field`, `Alert`, `Dialog`, `Section`, `Container`. La réservation et le menu mobile utilisent un dialog natif avec arrière-plan inerte, Échap, Tab/Maj+Tab et retour focus. Le composant historique de choix du tuteur utilise aussi cette primitive, sans réintroduire son ancien parcours fictif.
- **UX-002** : carte tarifaire partagée entre accueil, packs et séances ; total TTC, coût par séance et économie calculée face au prix unitaire du même niveau. Le catalogue public alimente désormais aussi les définitions de Checkout dans `lib/stripe.ts`. IDs et montants restent identiques. Les mentions non définies « Sans engagement » sont retirées des cartes. Préparation Checkout réessayable et retour de connexion vers la page d’offres d’origine.

Le retour après connexion est effectivement pris en charge par `SimpleSignin`, avec une liste fermée de deux destinations (`/packs`, `/book-online`) pour les rôles Élève/Parent. Les URL externes et les autres rôles conservent le routage habituel ; aucune redirection arbitraire fournie par `next` n’est exécutée.
- **UX-003 / A11Y-002** : besoins → coordonnées → créneau selon le contrat actuel de l’API. Les groupes de champs, titres et labels sont annoncés ; les valeurs survivent au retour arrière, à une erreur et à une fermeture/réouverture pendant la session. Le préremplissage de matière ne remplace pas un brouillon déjà modifié. Indicatif téléphonique natif, erreurs/succès sémantiques, retry et état vide des disponibilités. Un 409 retire le créneau devenu indisponible ; la demande enregistrée reste distincte d’une confirmation tuteur.
- **UX-004 / UX-006** : menu dans l’ordre avis → fonctionnement → équipe → tarifs ; état actif suivi au scroll, ancres dégagées du header fixe, libellés FR/EN typés. La page Comment ça marche reprend les étapes réelles et les destinations d’offres, sans imposer les anciens sigles commerciaux.
- **UX-004 / UX-005** : campagnes centralisées, désactivées sans dates futures approuvées ; dates zonées, début inclus et fin exclusive. L’attribution historique `back_to_school` reste reconnue. La mention non documentée de tuteurs « qualifiés » est retirée du footer FR/EN.

## Recette reproductible

```powershell
npm.cmd run type-check
npm.cmd run lint
npm.cmd run test:ux
npm.cmd run build
npm.cmd run start -- --port 3106
node scripts/verify-ux-roadmap.mjs http://localhost:3106
```

Le navigateur nécessite Playwright, sans ajout aux dépendances de production. Si Playwright est disponible ailleurs, passer son `package.json` comme troisième argument. Dans cet environnement :

```powershell
node scripts/verify-ux-roadmap.mjs http://localhost:3106 C:/Users/verto/AppData/Local/npm-cache/_npx/420ff84f11983ee5/node_modules/playwright/package.json
```

Le script bloque les écritures API autres que ses réponses simulées. Les captures et le rapport JSON sont générés dans `artifacts/ux-roadmap/`, ignoré par Git. Les tests unitaires utilisent le runner natif Node et TypeScript déjà installé ; aucun runner supplémentaire n’est ajouté.

## Résultats finaux

- `npm.cmd run type-check` : réussi ; le build final confirme aussi le contrôle TypeScript.
- `npm.cmd run lint` : réussi, sans erreur ni avertissement.
- Prettier sur les fichiers de code de ce lot : réussi. Les Markdown sont exclus par la configuration existante.
- `npm.cmd run test:ux` : **14 tests réussis**, tarifs, cohérence du catalogue serveur, bornes des campagnes et destinations de retour autorisées.
- `npm.cmd run build` : réussi, **99 pages générées**, Next.js 16.3.4.
- Chromium sur le build de production : **36 contrôles réussis**, aucune erreur JavaScript. Rapport : `artifacts/ux-roadmap/report.json`.
- **25 rendus responsive** : accueil, packs, séances, réservation et fonctionnement à 320/390/768/1280/1440 px ; un seul `main`, un seul `h1`, aucun débordement horizontal.
- **5 contrôles de dialogs** : clavier, focus programmatique bloqué sur l’arrière-plan, Échap, retour focus, thème sombre et préférence de mouvement réduit. Le menu mobile utilise la même primitive.
- **3 parcours de réservation simulés** : parent FR à 320/390 px, élève EN à 1440 px ; validation, double clic, brouillon conservé, erreur de lead puis retry, échec de disponibilités puis retry, état vide, conflit puis demande enregistrée. Les payloads de rôle, matière, objectif et indicatif sont vérifiés.
- Préparation Checkout en erreur puis retry, connexion simulée et retour effectif à `/packs` ; ordre et état actif des ancres ; **15 destinations** du header/footer inventoriées, liens internes HTTP 200 et ancres présentes.

## Portée et limites

Le protocole backend est conservé : aucune preuve de vérification d’identité, de concurrence en base, de création parent/élève réelle, d’envoi d’e-mails ou d’attribution de crédits n’est apportée par les simulations. Les deux sessions de connexion sont également simulées. Ces dépendances restent dans TECH-002/003, SK-001/003/008/011 et UX-003.

Les conditions de validité/annulation et de résiliation attendent une validation commerciale et juridique dans UX-002. Les sources, consentements et supports graphiques restent à fournir dans UX-005. La recette clavier automatisée et l’inspection des captures ne remplacent pas un audit complet avec lecteur d’écran ; A11Y-001 reste partiellement ouvert. UI-001 et A11Y-002 conservent la migration des autres écrans. Les performances en production restent dans PERF-001.

Pendant les essais, un défaut de boucle Maj+Tab sur le titre focalisé d’une étape a été corrigé, ainsi que la visibilité des autres créneaux après conflit. Un essai simultané de serveur de développement et de lint a épuisé la mémoire disponible ; les contrôles finaux sont exécutés séparément sur le build de production.
