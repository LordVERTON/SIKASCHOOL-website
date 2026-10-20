# Comparatif typographique

Les deux branches partagent la refonte V2. `test-ui` rétablit sa typographie initiale, avant les essais de changement de police ; `feat(UX/UI)` conserve la variante Sensa Wild Fill.

| Branche | Police primaire | Secondaire du site public | Secondaire des espaces connectés |
| --- | --- | --- | --- |
| `feat(UX/UI)` | Sensa Wild Fill | Poppins | Inter |
| `test-ui` | Archivo Black (version initiale V2) | Poppins | Inter |

La variante Sensa Wild Fill avec Poppins/Inter reste sauvegardée dans le commit `799d9dc` de `feat(UX/UI)`. L’essai Source Han Serif du commit `156fbdb` reste dans l’historique de `test-ui` ; un nouveau commit rétablit Archivo Black, Poppins et Inter sans réécrire cet historique. La branche `main` reste à son commit d’origine.

Pour comparer, arrêter le serveur entre les changements de branche puis le relancer :

```powershell
git switch 'feat(UX/UI)'
npm run dev
```

Après avoir arrêté le serveur avec Ctrl+C :

```powershell
git switch test-ui
npm run dev
```

Garder le même navigateur, la même langue, la même largeur et le même thème pour les deux versions. Comparer notamment l’accueil, les packs, la connexion et le formulaire de première séance. Le script `scripts/verify-brand-v2.mjs` attend la typographie propre à chaque branche.

La version initiale rétablit aussi les réglages typographiques de la refonte : interlignage et espacement d’Archivo Black, titres secondaires Poppins et absence de police display imposée aux espaces connectés. Les polices sont chargées via `next/font/google`. Les fichiers locaux d’essai Sensa Wild Fill et Source Han Serif ont été retirés de `test-ui`.

Validation du retour à la V2 initiale : build de production et TypeScript réussis ; ESLint sur les fichiers concernés sans erreur ; 52 contrôles d’affichage et 5 ouvertures du formulaire de réservation réussis. Le navigateur confirme Poppins pour le texte et Archivo Black pour les titres display, sans erreur JavaScript ni débordement horizontal. Rapport et captures : `artifacts/brand-v2/`.
