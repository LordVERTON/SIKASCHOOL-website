# Polices SIKASCHOOL

Sensa Wild Fill a été téléchargée depuis Fontfabric le 21 octobre 2026, sans modification du fichier de police.

| Fichier | Rôle | Source |
| --- | --- | --- |
| `sensa-wild-fill.woff2` | Primaire : titres, display et chiffres de la méthode | [Fontfabric, Sensa Wild Fill](https://www.fontfabric.com/fonts/sensa/sensa-wild-fill-font/) |
| `source-han-serif-jp-variable.woff2` | Secondaire sur `test-ui` : corps et interfaces, graisses 200–900 | [Adobe, Source Han Serif JP variable WOFF2](https://github.com/adobe-fonts/source-han-serif/tree/release/Variable/WOFF2/OTF/Subset) |

Sensa Wild Fill fait partie des deux styles gratuits présentés dans la [famille Sensa](https://www.fontfabric.com/fonts/sensa/). L’[EULA Fontfabric pour les polices gratuites](https://www.fontfabric.com/fontfabric-commercial-eula-for-free-fonts/) autorise l’utilisation web avec `@font-face` et un nombre illimité de pages vues. Copie du texte de licence : `sensa-wild-fill-LICENSE.txt`.

La branche `test-ui` utilise Source Han Serif pour le site public et les espaces connectés. La version originale JP d’Adobe contient aussi les caractères latins et les accents français courants. Le caractère rare `Ÿ`, absent du fichier Adobe, utilise le repli Georgia. Le fichier est distribué sans modification, sous SIL Open Font License 1.1 ; la licence est fournie dans `source-han-serif-LICENSE.txt`.

Les deux polices sont déclarées dans `app/layout.tsx` avec `next/font/local` et les variables `--font-sika-display` et `--font-sika-body`. Elles sont disponibles aussi dans les modales. Aucun appel à un service de polices tiers n’est nécessaire dans le navigateur. La variante Poppins/Inter reste enregistrée sur `feat(UX/UI)` ; voir [`docs/TYPOGRAPHY_COMPARISON.md`](../../docs/TYPOGRAPHY_COMPARISON.md).
