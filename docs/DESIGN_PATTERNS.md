# Patterns d'architecture — SikaSchool

## Rôle de ce document

Ce document ne crée pas de tickets supplémentaires. Il explique les **choix structurels** utiles aux tickets existants : pourquoi un service, une machine d'états ou une primitive UI est justifié, et où s'arrêter pour éviter le sur-engineering. Les problèmes factuels restent dans les audits et les tâches actionnables restent dans [ROADMAP.md](ROADMAP.md).

## Patterns déjà présents

| Pattern | Localisation | Usage / qualité | Limite constatée |
| --- | --- | --- | --- |
| App Router + Route Handlers | `app/**`, `app/api/**` | Front/API co-localisés, découpage par rôle lisible. | Les routes portent souvent tous les niveaux de responsabilité. |
| Provider | `ClientProviders`, `AuthContext`, `LanguageContext`, `ToastContext` | Thème, langue et feedback globaux. | La réservation traverse un événement DOM global et duplique la modale. |
| Adapter externe | `lib/{stripe,supabase,livekit,mercure}.ts` | Centralise partiellement les SDK. | L'accès `supabaseAdmin` est ensuite répété dans les routes. |
| RBAC / guard | `auth.ts`, `lib/auth.ts`, `lib/admin-permissions.ts`, `lib/student-access.ts` | Identité Supabase Auth, session Auth.js et séparation parent/élève effective. | Les routes doivent encore appliquer systématiquement leurs contrôles de capacité et de propriété. |
| Composition UI | `StudentLayout`, `TutorLayout`, `SectionHeader`, `EmptyState`, `Skeleton` | Bons débuts de composants partagés. | Cartes, boutons, champs et dialogs restent dupliqués. |
| Event/observer | Mercure hooks et `publishUserMercureUpdate` | Bon usage pour rafraîchir messages/séances. | Les effets best-effort n'ont pas de suivi/outbox ; `lead:open` n'est pas typé. |
| Catalogue de données | `lib/payments-catalog.ts`, `lib/stripe.ts` | Les identifiants Stripe sont séparés de l'affichage client. | Trois représentations tarifaires divergent encore. |

## Patterns recommandés

## Service applicatif + adaptateur de persistance — réservation et paiement

### Problème résolu

Les routes de réservation et webhook combinent parsing HTTP, règles de rôle, requêtes, calcul de disponibilité, écritures, notifications et erreurs. Elles sont difficiles à tester et à rendre atomiques.

### Situation actuelle

`app/api/leads/first-session-slots/route.ts`, `app/api/sessions/route.ts` et `app/api/webhooks/stripe/route.ts` appellent directement Supabase et les services secondaires.

### Architecture proposée

`route handler → schema/DTO → application service → Supabase/Stripe adapters`. Les services `BookTrialSession`, `CreateSessionRequest`, `ApplyStripeEvent` retournent un résultat typé. Les requêtes transactionnelles spécifiques vivent dans une RPC Supabase plutôt que dans une abstraction générique.

### Avantages

- Règles métier testables sans Next.
- Contrôles d'autorisation et erreurs cohérents.
- Idempotence/transaction explicites pour les opérations financières.

### Inconvénients / coût

Extraction progressive et contrats de DTO à maintenir. Ne pas déplacer les simples lectures isolées dans un repository.

### Fichiers concernés

- `app/api/leads/**`, `app/api/sessions/**`, `app/api/webhooks/stripe/route.ts`
- futur `lib/application/{booking,payments}/**`
- futur `lib/data/{booking,payments}.ts`

**Tickets qui l'emploient :** `TECH-002`, `TECH-003`, `TECH-004`, `TECH-005`.

## State machine légère — cycle de réservation et séance

### Problème résolu

Le lead mélange création de compte, sélection de créneau et confirmation via de nombreux booléens ; les statuts de séance sont distribués dans API et UI.

### Situation actuelle

`LeadCaptureModal` possède notamment `showThanks`, `bookingSlot`, `bookingConfirmed`, `submitting`, `error`. Les statuts DB sont `PENDING`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

### Architecture proposée

Utiliser un union type/reducer local, pas une nouvelle librairie : `details | slotsLoading | slotSelected | booking | confirmed | error`. Côté domaine, définir une table des transitions autorisées et une commande par transition.

### Avantages

- États impossibles réduits ; retry et restauration de contexte simples.
- Tests de transition concis.

### Inconvénients / coût

N'appliquer qu'aux workflows à étapes/effets réels ; pas à chaque menu ou champ.

### Fichiers concernés

- `components/Booking/LeadCaptureModal.tsx`
- `app/api/{leads/first-session-slots,sessions,tutor/sessions/action}/**`
- `docs/WORKFLOWS.md`

**Tickets qui l'emploient :** `UX-003`, `TECH-008` et la formalisation des transitions de Phase 4.

## Command schemas + Result applicatif — frontière API

### Problème résolu

La validation est inégale et les réponses d'erreur ne sont pas stables pour les formulaires.

### Situation actuelle

Zod est local à certaines routes ; erreurs strings, `any` et détails DB sont retournés ou loggés de façon disparate.

### Architecture proposée

Un schéma Zod par commande, avec `safeParse`; un résultat minimal : `{ ok: true, value } | { ok: false, code, message, fieldErrors? }`. La route convertit seulement ce résultat en HTTP.

### Avantages

- Éviter duplications frontend/backend.
- Erreurs sûres, localisables et accessibles.

### Inconvénients / coût

Ne pas transformer toute exception interne en hiérarchie de classes ; conserver les erreurs inattendues dans les logs.

### Fichiers concernés

- `lib/validation.ts`, `app/api/**/route.ts`
- futur `lib/contracts/**`

**Tickets qui l'emploient :** `TECH-005`, `TECH-006`.

## UI primitives composables — fondations design system

### Problème résolu

Les mêmes boutons, cartes et champs sont rendus avec des classes différentes, dont des couleurs hors tokens.

### Situation actuelle

`PricingCard`, `BookOnline`, `EmptyState`, modales et dashboards reproduisent des structures similaires.

### Architecture proposée

Construire des primitives petites : `Button`, `Card`, `Field`, `Dialog`, `Alert`, `Section`, `Container`, avec variantes limitées et `className` de composition. S'appuyer sur les tokens Tailwind déjà présents, puis enrichir espacement/type/états.

### Avantages

- Cohérence UI, focus et loading accessibles.
- Réduction de la duplication sans figer les écrans.

### Inconvénients / coût

Une migration globale serait risquée ; adopter uniquement lors d'un écran modifié.

### Fichiers concernés

- `app/globals.css`, `components/Common/**`
- `components/{Booking,Packs,Pricing,BookOnline}/**`

**Tickets qui l'emploient :** `UI-001`, `A11Y-001`, `A11Y-002`.

## Outbox légère pour effets secondaires critiques

### Problème résolu

E-mails, Mercure et notifications peuvent échouer après une écriture métier réussie, sans observabilité ni retry contrôlé.

### Situation actuelle

`void sendRegistrationResendEmails(...)`, appels Mercure et inserts de notifications sont souvent best-effort dans les routes.

### Architecture proposée

Pour réservation/paiement/auth, enregistrer un événement d'outbox transactionnel avec l'opération, puis le traiter/rejouer par worker/cron. Commencer par logs structurés et un tableau d'administration si l'infrastructure worker n'est pas encore justifiée.

### Avantages

- Moins de notifications perdues et meilleure traçabilité.
- Pas de retry HTTP qui duplique l'écriture métier.

### Inconvénients / coût

Infrastructure et exploitation supplémentaires : n'introduire qu'après sécurisation des P0 et mesure des échecs.

### Fichiers concernés

- `lib/{registration-emails,mercure}.ts`
- `app/api/{leads,sessions,webhooks}/**`
- migration dédiée si adoptée

**Décision différée :** ce pattern ne doit être évalué qu'après `TECH-001` à `TECH-003`, tests et mesure des échecs. Il n'est pas une dépendance obligatoire de la roadmap actuelle.
