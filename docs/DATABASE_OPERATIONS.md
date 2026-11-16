# Disponibilité de la base — SK-008

## Sonde locale et serveur

`GET /api/admin/health` exige une session avec rôle `ADMIN` actif et relu
en base. La requête DB utilise HEAD sur `profiles`, limite 1, délai maximal
5 secondes. La lecture d'autorisation est elle aussi bornée à 5 secondes,
soit au plus 10 secondes d'attente DB pour l'ensemble de la route.
Elle ne retourne aucun enregistrement et n'effectue aucune
écriture, aucun e-mail, aucune facturation. `Cache-Control: no-store`.

Réponses : 200 `{ app: "up", database: "up" }`, 503
`{ app: "up", database: "unavailable" }`, 403 sans privilège.
Une panne de résolution de l'identité renvoie aussi 503 : ce contrôle
interactif ne prouve donc pas à lui seul la disponibilité
de l'application. Aucun message d'erreur SQL n'est envoyé au navigateur.

L'administration affiche le résultat et un bouton de relance. Le contrôle
se lance à l'ouverture de cet écran et à la demande, sans polling. Cette
vérification ponctuelle ne remplace pas un dispositif de surveillance.

## Dépendances critiques

| Parcours | Tables / services | Reprise |
| --- | --- | --- |
| Connexion / autorisation | Auth, profiles | Réessayer après rétablissement ; accès refusé en cas de profil non vérifiable |
| Lead / première séance | profiles, students, tutors, sessions, assignations | Contrôler les écritures existantes avant de resoumettre |
| Paiement | payments, student_credit_ledger, student_credits | Rejouer le webhook signé après rétablissement ; contrôler référence et ledger |
| Espaces métier | sessions, participants, messages, notifications | Vérifier lecture puis écriture contrôlée sur environnement de test |

## Procédure préparée

1. Distinguer application, Auth, API DB et base PostgreSQL. Vérifier URL,
   disponibilité Supabase et journaux restreints sans copier de secrets.
2. Suspendre les actions manuelles qui pourraient dupliquer les écritures.
   Contrôler les références Stripe et les séances persistées avant reprise.
3. Pour un paiement, retrouver le ledger via `stripe_source_ref`, puis
   `payment_id`. Un solde inclut aussi la consommation de séances et les
   ajustements ; ne pas remplacer le solde par le seul total des achats.
4. Les paiements historiques sans référence Stripe fiable exigent une
   réconciliation manuelle avec Stripe avant toute régularisation du ledger.
5. Tester les flux sur une copie isolée et réactiver après contrôle des
   permissions, crédits, séances et file de retries.

À définir avec l'exploitation avant activation : responsable, destinataire
et escalade, maintenance, cadence (proposition 5 minutes), alerte après
3 échecs et rétablissement après 2 succès, RPO/RTO, rétention, chiffrement
et emplacement des sauvegardes. Aucun ordonnanceur, envoi d'alerte ou
service payant n'a été activé. Aucune restauration n'a été exécutée : SK-008
reste ouvert pour cette recette et la surveillance réelle.
