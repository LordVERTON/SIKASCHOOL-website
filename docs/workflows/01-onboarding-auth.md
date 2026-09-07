# 01 — Onboarding, inscription et connexion

## Objectif

Créer un compte, vérifier l’adresse e-mail, ouvrir une session et récupérer l’accès après perte de mot de passe. Le formulaire de lead crée un compte `STUDENT` ou `PARENT`; l’inscription standard publique crée un `STUDENT`; la route interne `register` peut aussi créer un `TUTOR`.

## Inscription directe

**Entrées :** pages `app/(site)/auth/signup`, routes `POST /api/auth/signup` et `POST /api/auth/register`.

```mermaid
sequenceDiagram
  actor U as Utilisateur
  participant UI as Formulaire d'inscription
  participant API as API auth
  participant DB as Supabase
  participant Mail as Resend/SMTP
  U->>UI: prénom, nom, e-mail, mot de passe
  UI->>API: POST signup/register
  API->>API: valide et hache le mot de passe (bcrypt)
  API->>DB: crée users + profil student/tutor
  API->>DB: crée notification et token de vérification
  API-->>Mail: e-mail de vérification et bienvenue (asynchrone)
  API->>API: synchronise l'identité Supabase Auth
  API-->>U: session HttpOnly et espace selon rôle
```

### Règles

- E-mail normalisé et unique ; mot de passe minimum 6 caractères pour `signup`.
- `signup` attribue toujours le rôle `STUDENT`; `register` accepte `STUDENT`, `PARENT` ou `TUTOR`.
- Les profils `students` et `tutors` sont créés au mieux : une erreur de profil ne doit pas annuler la création de l’utilisateur.
- Une session HMAC est déposée à la fin ; le middleware redirige ensuite vers `/student`, `/family` ou `/tutor`.

## Demande de première séance (lead)

**Entrées :** `components/Booking/LeadCaptureModal.tsx`, `POST /api/leads`, `GET|POST /api/leads/first-session-slots`.

```mermaid
flowchart TD
  A[Visiteur clique Réserver] --> B[Saisit niveau, matière et coordonnées]
  B --> C[POST /api/leads]
  C --> D{E-mail existant ?}
  D -- Non --> E[Crée user + profil student]
  D -- Oui --> F[Met à jour le compte et régénère le mot de passe initial]
  E --> G[Crée notifications admin/compte]
  F --> G
  G --> H[GET créneaux : tuteurs disponibles par matière]
  H --> I[Choix du créneau]
  I --> J[POST first-session-slots]
  J --> K[Assigne tuteur-élève et crée séance TRIAL PENDING]
  K --> L[Notifie élève/parent et tuteur, e-mail tuteur]
```

### Règles

- Le mot de passe initial est généré sous la forme `prenom.nom12345`; l’utilisateur est invité à le changer.
- Le compte est `PARENT` seulement lorsque `accountType` est `PARENT`, sinon `STUDENT`.
- Les créneaux proposés couvrent au plus 14 jours, hors dimanche, de 9 h à 20 h, et excluent les conflits de tuteur.
- La première séance est une `TRIAL`, dure 60 minutes, est gratuite et reçoit `payment_status: COMPLETED`.

## Connexion, vérification et récupération

```mermaid
flowchart LR
  A[Connexion e-mail + mot de passe] --> B{2FA SMS activée ?}
  B -- Non --> C[Créer session HMAC]
  B -- Oui --> D[Créer challenge, envoyer SMS]
  D --> E[Valider ticket + code]
  E --> C
  C --> F[Redirection par rôle]
  G[Mot de passe oublié] --> H[Token à durée 1 h + e-mail]
  H --> I[POST reset-password]
  I --> J[Mot de passe hashé, token invalidé, notification]
  K[Lien vérification e-mail] --> L[GET verify-email]
  L --> M[email_verified = true]
```

| Parcours | Routes | Garanties |
| --- | --- | --- |
| Connexion | `POST /api/auth/login` | Vérifie bcrypt, déclenche 2FA si activée, synchronise Supabase Auth et crée la session |
| Déconnexion | `POST /api/auth/logout` | Supprime la session applicative |
| Vérification e-mail | `GET /api/auth/verify-email?token=` | Active la vérification si le token est valide |
| Mot de passe oublié | `POST /api/auth/forgot-password` | Réponse non énumérante, token 1 h, e-mail et notification |
| Réinitialisation | `POST /api/auth/reset-password` | Valide token, remplace le hash, invalide le token |

## Tests de recette

- Créer un élève, un parent et un tuteur via les parcours autorisés ; vérifier la redirection de rôle.
- Essayer un e-mail existant, un mot de passe invalide, un token expiré et un code 2FA expiré.
- Réserver une séance gratuite avec puis sans créneau disponible ; contrôler les notifications et l’assignation.
