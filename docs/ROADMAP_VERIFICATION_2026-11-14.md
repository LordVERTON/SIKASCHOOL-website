# Recette du lot priorisé — 14 novembre 2026

Cette recette accompagne le seul backlog d'exécution, [roadmap.md](roadmap.md).
Un ticket soldé : **TECH-002**. Avancées partielles sur TECH-007, TECH-004/005/006/010,
UI-001, A11Y-001/002, SK-001/002/003/006/008. Les cases non satisfaites restent ouvertes.

## Ce qui est vérifiable visuellement

Serveur de développement : `https://localhost:3000`.

| Écran | Changement |
| --- | --- |
| `/auth/signin` → Mot de passe oublié | Dialog natif, clavier, Échap, retour du focus, erreur réessayable sans perte de l'e-mail, succès non énumérant annoncé |
| Historiques élève/parent/tuteur | Statuts centralisés ; titres et badges lisibles sur mobile ; réservation de l'état vide vers le calendrier du bon rôle |
| Dashboards, calendriers, paiements | Libellés de statut français, fallback neutre, aucun enum brut dans les rendus migrés |
| Calendrier élève/parent → Annuler | Confirmation et alerte d'échec dans le dialog partagé, focus piégé, défilement mobile préservé |
| `/student/paiements/success`, `/family/paiements/success` | Retour neutre vers le statut réel du paiement ; aucun crédit confirmé sur la seule base de l'URL |
| Pages `paiements/cancel` | Achat interrompu, vérification du statut avant reprise, liens adaptés au rôle |
| `/tutor/administration` avec rôle ADMIN | Sonde DB en lecture seule, résultat annoncé et relance |

Le thème sombre n'entraîne plus de divergence d'hydratation sur `aria-pressed`
du bouton de thème. Les alertes, confirmations et la récupération adoptent
les primitives existantes et une variante compacte de dialog. Logo et charte conservés.

## Intégrité et autorisation

Le webhook signé appelle une seule RPC pour paiement, ledger et solde.
La transaction verrouille une source Stripe, vérifie l'événement et sa source,
et incrémente le solde en SQL. Les contraintes uniques et le rollback couvrent
la concurrence et les reprises. Un checkout d'abonnement ne crée pas de seconde
ligne comptable en plus de la première facture ; un checkout impayé ne crédite pas.
L'événement asynchrone de succès est pris en charge.

La migration `20261114154431_stripe_atomic_credits.sql` est appliquée et inscrite
dans l'historique **local** uniquement. Aucun doublon de facture n'existait dans
la base locale contrôlée. Elle échouerait volontairement en présence de doublons
historiques ; aucune suppression automatique de paiement n'est prévue.
Un ancien paiement déjà payé/remboursé sans ledger Stripe fiable exige une
réconciliation avant replay. Voir aussi [le workflow](workflows/04-payments.md).

Les administrateurs sont reconnus par le rôle persistant `ADMIN`, sans exception
d'adresse e-mail. Le helper serveur relit rôle et activation avant accès ; un ancien
JWT ADMIN ne conserve pas les privilèges après révocation en base. Les anciens
tuteurs admis par e-mail n'ont pas été promus automatiquement.

## Preuves exécutées

Environnement : Windows, Node **26.8.2**, npm **12.0.2**, Next **16.4.6**,
PostgreSQL **17** local sous Docker. La cible déclarée par le projet et la CI est
Node 24 ; le pipeline distant n'a pas été exécuté pendant ce lot.

| Contrôle | Résultat |
| --- | --- |
| `npm run lint` | Succès, aucun avertissement au dernier passage |
| `npm run type-check` | Succès |
| `npm test` | 63 tests : catalogue, auth, rôles, retours Checkout, statuts et webhook |
| `npm run build` | Succès après les derniers changements, Next 16.4.6, 99 routes générées |
| `npm run test:db` | 12 replays concurrents : une attribution ; deux événements d'une facture : une attribution ; 10 achats distincts : aucun incrément perdu ; solde/ledger = 22 ; rollback forcé et retry réussis ; historique ambigu bloqué |
| `npm run test:webhook-local` | Requête HTTP signée synthétique → handler réel → RPC Supabase réelle → paiement/ledger/solde vérifiés ; signature invalide 400, impayé ignoré, 4 replays 200, métadonnées invalides 500 |
| `scripts/verify-ux-roadmap.mjs` | 36 contrôles publics : cinq largeurs 320–1440, navigation, modales, besoins/coordonnées/créneaux simulés FR/EN, conflit et relance Checkout |
| `npm run test:browser` | 14 scénarios : récupération 375/1440 clair/sombre, rôles élève/parent/tuteur/admin, liens d'état vide, confirmation/alerte d'annulation, pages de retour paiement et révocation ADMIN |
| `npm audit` après corrections | 0 critique, 3 hautes (Nodemailer et sa chaîne Auth.js : `@auth/core`, `next-auth`), 7 modérées (chaîne TypeScript-ESLint/minimatch) |
| `supabase db advisors` local | 4 avertissements de performance RLS préexistants sur messages/threads/participants ; aucun avis sur la nouvelle RPC |

Les événements du test webhook sont générés et signés **localement**. Aucun appel
à l'API Stripe, paiement ou envoi d'e-mail réel n'est réalisé. La recette navigateur
intercepte les demandes de récupération et d'annulation ; authentification et sonde
sont réelles sur Supabase local. Comptes et crédits de test sont supprimés après
chaque scénario ; aucune remise à zéro de la base n'est utilisée.
Le contrôle SQL final confirme zéro profil de test `roadmap-*`/`webhook-*` restant.

Captures/rapports ignorés par Git :

- `artifacts/roadmap-2026-11/report.json` et captures `forgot-*`, `parent-status`,
  `*-confirm-cancel`, `*-alert-cancel`, `*-payment-*`, `admin-health*`.
- `artifacts/ux-roadmap/report.json` pour la recette publique existante.

Les captures ont été ouvertes et inspectées. Le chevauchement du badge et du titre
de l'historique parent a été corrigé puis recapturé. Le premier scénario admin
utilisait un format de fixture incorrect ; il a été corrigé selon le contrat réel
avant le passage réussi. Les premières tentatives d'annulation visaient l'action
mobile depuis l'affichage desktop ; le scénario ouvre désormais l'agenda mobile.

## Limites et suite prioritaire

- **TECH-003 / SK-011** : preuve d'identité et atomicité de la réservation publique,
  anti-abus et reprise différée sécurisée restent à implémenter. Ce lot ne sécurise
  pas l'ancien POST de réservation par e-mail.
- **SK-001** : aucune recette Stripe avec carte de test, facture réelle ou remboursement
  de crédits consommés ; les règles commerciales et le go-live restent à valider.
- **SK-003** : le lien de l'historique vers `/student/booking` est corrigé. Le scénario
  original depuis un tuteur n'est pas reproduit ; aucune clôture globale du ticket.
- **SK-008** : sonde interactive et runbook livrés ; ordonnanceur, alertes, responsables,
  sauvegarde/restauration et RPO/RTO restent à valider. Voir [DATABASE_OPERATIONS.md](DATABASE_OPERATIONS.md).
- **TECH-010** : workflow CI ajouté, mais ni protection de branche ni tests DB/E2E en CI.
  Génération complète des types échouée dans pg-meta local (authentification PostgreSQL) ;
  ajouts RPC/ledger typés manuellement depuis la migration et contrôlés par TypeScript.
  Une migration locale antérieure du 9 novembre était déjà absente de l'historique appliqué ;
  elle n'a pas été exécutée ni réparée dans ce lot.
- **A11Y / SK-002** : lecteur d'écran réel, autres formulaires, inventaire complet des
  notifications/e-mails et validation du glossaire restent ouverts.
- **TECH-007** : les vulnérabilités non critiques restantes demandent des vérifications
  de compatibilité. En-têtes documentés depuis la configuration et le runtime local ;
  aucune vérification de l'hébergement en production.

Aucun déploiement, campagne, modification de production, commit ni push effectué.
