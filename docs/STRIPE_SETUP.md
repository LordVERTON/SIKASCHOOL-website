# 💳 Intégration Stripe – Guide complet

Cette intégration permet aux familles (rôle `STUDENT`) d'acheter depuis la plateforme :

- **Packs** de 4 ou 8 séances (paiement unique)
- **Séances à l'unité** (paiement unique)
- **Abonnement mensuel** (4 séances / mois, résiliable à tout moment)

L'expérience utilisateur repose sur **Stripe Checkout** (page hébergée) + **Stripe Customer Portal** (gestion des factures, carte, résiliation), ce qui garantit :

- Apple Pay / Google Pay / Link activés automatiquement
- PCI-DSS géré par Stripe (aucun numéro de carte ne touche notre serveur)
- 3D Secure natif
- Factures PDF générées automatiquement
- Portail en français

---

## 1. Prérequis

- Un compte Stripe : <https://dashboard.stripe.com/register>
- Le mode **Test** suffit pour développer — les cartes de test ne déclenchent aucun vrai prélèvement.
- **Stripe CLI** pour tester les webhooks en local : <https://stripe.com/docs/stripe-cli>

---

## 2. Configuration des variables d'environnement

Ajoute dans `.env.local` (déjà préparé) les valeurs suivantes depuis le [Dashboard Stripe](https://dashboard.stripe.com/test/apikeys) :

```dotenv
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXX      # rempli à l'étape 4
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Important** : ne jamais commit `STRIPE_SECRET_KEY`. Il est déjà ignoré via `.gitignore` (`.env.local`).

---

## 3. Migration base de données

Exécute la migration SQL une seule fois :

1. Ouvre ton projet dans [Supabase Studio](https://supabase.com/dashboard) → **SQL Editor**
2. Copie-colle le contenu de [`supabase/migrations/2026-04-20-001_stripe_payments.sql`](../supabase/migrations/2026-04-20-001_stripe_payments.sql)
3. Clique sur **Run**

Tables créées :

| Table | Rôle |
|---|---|
| `payments` | Journal de tous les paiements (1 row = 1 checkout / 1 invoice) |
| `student_credits` | Solde de séances disponibles par élève et par niveau |
| `student_credit_ledger` | Audit (+ achat / − consommation) |
| `subscriptions` | Projection des abonnements Stripe actifs |
| `users.stripe_customer_id` | Association user ↔ Stripe Customer |

---

## 4. Webhook Stripe (obligatoire)

Le webhook est **la source de vérité** : c'est lui qui crédite les packs et active les abonnements après paiement réussi. Sans webhook, aucun pack ne sera crédité.

### En local (développement)

```powershell
# 1. Installer Stripe CLI : https://stripe.com/docs/stripe-cli
stripe login

# 2. Forwarder les événements vers ton app Next.js
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

La commande affiche un `whsec_...`. Colle-le dans `.env.local` :

```dotenv
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

Puis relance `npm run dev`.

### En production

1. Dashboard Stripe → **Developers → Webhooks → Add endpoint**
2. URL : `https://tondomaine.com/api/webhooks/stripe`
3. Cocher ces événements :
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `charge.refunded`
4. Copier le **Signing secret** dans l'env de prod (`STRIPE_WEBHOOK_SECRET`).

---

## 5. Activer le Customer Portal

Une seule fois, côté Dashboard Stripe :

1. <https://dashboard.stripe.com/test/settings/billing/portal>
2. Active les fonctions que tu veux proposer : mise à jour CB, téléchargement factures, résiliation d'abonnement
3. Clique sur **Save**

Sans cette étape, `/api/student/payments/portal` renverra une erreur.

---

## 6. Tester de bout en bout

1. Lance `npm run dev`
2. Lance `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (laisse tourner)
3. Connecte-toi avec un compte `STUDENT`
4. Va sur `/student/paiements` → onglet **Packs**
5. Clique "Acheter maintenant" → tu es redirigé sur Stripe Checkout
6. Utilise une carte de test :

| Numéro | Scénario |
|---|---|
| `4242 4242 4242 4242` | Paiement réussi |
| `4000 0025 0000 3155` | 3D Secure requis |
| `4000 0000 0000 9995` | Paiement refusé |
| `4000 0000 0000 0002` | Carte refusée (fonds insuffisants) |

Date d'expiration : n'importe quelle date future. CVC : 3 chiffres au choix. Code postal : 42424.

7. Après succès → redirection `/student/paiements/success` avec animation confetti
8. Ton webhook CLI affiche `✔ checkout.session.completed`
9. Retourne sur `/student/paiements` : ton solde de séances est crédité, la facture PDF est téléchargeable.

---

## 7. Architecture rapide

```
Famille (STUDENT)
    │
    ├── /packs (page publique)          ─┐
    ├── /student/paiements (dashboard)  ─┤  clique "Acheter"
    │                                    │
    ▼                                    ▼
POST /api/student/payments/checkout  →  Stripe crée Checkout Session
                                           │
                                           ▼
                             Famille paie sur checkout.stripe.com
                                           │
                                           ▼
                            Stripe appelle POST /api/webhooks/stripe
                                           │
                                           ▼
                     Crée/MAJ row payments + crédite student_credits
                                           │
                                           ▼
                     Redirection /student/paiements/success
```

---

## 8. Catalogue des produits

Les prix sont définis côté code dans `lib/stripe.ts` (source de vérité) et dupliqués dans `lib/payments-catalog.ts` pour les composants client.

Pour modifier un prix ou ajouter un produit :

1. Édite `lib/stripe.ts` (constante `PLANS`)
2. Édite `lib/payments-catalog.ts` (constante `CLIENT_PLANS`)
3. Relance `npm run dev`

> 💡 **Pour la prod**, il est recommandé de migrer les `price_data` vers des **Stripe Prices** persistants (Dashboard → Products). Cela permet d'utiliser les promotions, les coupons avancés, et de conserver un historique propre côté Stripe.

---

## 9. Checklist Go-Live

- [ ] Compte Stripe activé (KYC validé)
- [ ] Remplacer les clés `sk_test_` / `pk_test_` par les clés `sk_live_` / `pk_live_`
- [ ] Créer le webhook en mode Live (`STRIPE_WEBHOOK_SECRET` dédié)
- [ ] Activer le Customer Portal en mode Live
- [ ] Renseigner les CGV et politique de remboursement dans le Dashboard Stripe
- [ ] Configurer l'email d'envoi des reçus (Dashboard → Settings → Emails)
- [ ] Tester un vrai paiement (puis rembourser) avec ta carte perso
- [ ] Activer Radar (anti-fraude) avec les règles par défaut
- [ ] Vérifier que `NEXT_PUBLIC_APP_URL` pointe vers le domaine de prod
- [ ] Configurer Tax (TVA) si tu vends en UE et dépasses les seuils

---

## 10. Endpoints API

| Route | Méthode | Auth | Description |
|---|---|---|---|
| `/api/student/payments/checkout` | POST | STUDENT | Crée une Checkout Session pour un plan |
| `/api/student/payments/portal` | POST | STUDENT | Ouvre le Customer Portal |
| `/api/student/payments/overview` | GET | STUDENT | Renvoie crédits + historique + abonnement |
| `/api/webhooks/stripe` | POST | Stripe (HMAC) | Réception des événements Stripe |

---

## 11. Sécurité

- ✅ Clé secrète jamais exposée côté client (seul `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est public)
- ✅ Signature du webhook vérifiée via `stripe.webhooks.constructEvent`
- ✅ Idempotence garantie par les index UNIQUE sur `stripe_checkout_session` et `stripe_invoice_id`
- ✅ Aucune information bancaire ne transite par notre backend
- ✅ Tous les events webhooks sont loggés même si non traités

---

## 12. Roadmap possible

- **Stripe Connect** : redistribuer automatiquement la commission tuteur (mode `destination_charge`)
- **Coupons & promotions** : activer `allow_promotion_codes: true` est déjà fait, il suffit de créer les codes dans le Dashboard
- **Paiement en plusieurs fois** : intégrer Stripe Klarna ou Alma Pay in 4
- **Virement SEPA** : activer `payment_method_types: ['card', 'sepa_debit']` dans la Checkout Session

Bon dev ! 🚀
