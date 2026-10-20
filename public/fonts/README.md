# Polices SIKASCHOOL

Sensa Wild Fill a été téléchargée depuis Fontfabric le 21 octobre 2026, sans modification du fichier de police.

| Fichier | Rôle | Source |
| --- | --- | --- |
| `sensa-wild-fill.woff2` | Primaire : titres, display et chiffres de la méthode | [Fontfabric, Sensa Wild Fill](https://www.fontfabric.com/fonts/sensa/sensa-wild-fill-font/) |

Sensa Wild Fill fait partie des deux styles gratuits présentés dans la [famille Sensa](https://www.fontfabric.com/fonts/sensa/). L’[EULA Fontfabric pour les polices gratuites](https://www.fontfabric.com/fontfabric-commercial-eula-for-free-fonts/) autorise l’utilisation web avec `@font-face` et un nombre illimité de pages vues. Copie du texte de licence : `sensa-wild-fill-LICENSE.txt`.

Les anciennes polices secondaires ont été rétablies : Poppins pour le site public, Inter pour les espaces connectés. Elles sont chargées via `next/font/google` et hébergées par Next.js.

Sensa Wild Fill est déclarée dans `app/layout.tsx` avec `next/font/local` et la variable `--font-sika-display`. La variable `--font-sika-body` utilise Inter à la racine et Poppins dans `app/(site)/layout.tsx`. Les polices sont disponibles aussi dans les modales. Aucun appel à un service de polices tiers n’est nécessaire dans le navigateur.
