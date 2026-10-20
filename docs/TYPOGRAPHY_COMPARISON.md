# Comparatif typographique

Les deux branches partagent la même interface. Seule la police secondaire change ; Sensa Wild Fill reste la police primaire pour les titres.

| Branche | Police primaire | Secondaire du site public | Secondaire des espaces connectés |
| --- | --- | --- | --- |
| `feat(UX/UI)` | Sensa Wild Fill | Poppins | Inter |
| `test-ui` | Sensa Wild Fill | Source Han Serif | Source Han Serif |

La version actuelle avec Poppins/Inter a été sauvegardée dans le commit `799d9dc` de `feat(UX/UI)` avant la création de `test-ui`. La branche `main` reste à son commit d’origine.

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

Garder le même navigateur, la même langue, la même largeur et le même thème pour les deux versions. Comparer notamment l’accueil, les packs, la connexion et le formulaire de première séance. Le script `scripts/verify-brand-v2.mjs` attend la police secondaire propre à chaque branche.

Source Han Serif provient du dépôt officiel Adobe. Les fichiers et la licence sont présents uniquement sur `test-ui`, dans `public/fonts/`. Les détails de chargement figurent dans [`public/fonts/README.md`](../public/fonts/README.md).

Validation de `test-ui` : build de production et TypeScript réussis ; ESLint sur les fichiers modifiés sans erreur ; 52 contrôles de rendu et 5 ouvertures du formulaire de réservation réussis, sans erreur JavaScript ni débordement horizontal. Le navigateur confirme Sensa Wild Fill pour les titres et Source Han Serif pour le texte public. Captures et rapport local : `artifacts/brand-v2/`.
