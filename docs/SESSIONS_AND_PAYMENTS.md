# Système de Séances et Paiements - SikaSchool

## 📋 Vue d'ensemble

Ce document décrit l'implémentation complète du système de séances tuteur-élève avec gestion des paiements selon les types AVA, TODA, et NOTA.

## 🗄️ Structure de la Base de Données

### Tables Principales

#### 1. **sessions** - Séances réalisées
```sql
- id: UUID (clé primaire)
- booking_id: UUID (référence vers bookings)
- student_id: UUID (référence vers users)
- tutor_id: UUID (référence vers users)
- course_id: UUID (référence vers courses)
- session_type: VARCHAR(20) ('NOTA', 'AVA', 'TODA')
- level: VARCHAR(50) ('Collège', 'Lycée', 'Supérieur')
- started_at: TIMESTAMP
- ended_at: TIMESTAMP
- duration_minutes: INTEGER
- status: VARCHAR(20) ('IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
- topics_covered: TEXT[]
- homework_assigned: TEXT
- student_notes: TEXT
- tutor_notes: TEXT
- student_rating: INTEGER (1-5)
- tutor_rating: INTEGER (1-5)
- payment_status: VARCHAR(20) ('PENDING', 'PAID', 'FAILED', 'REFUNDED')
- payment_amount_cents: INTEGER
```

#### 2. **session_payments** - Paiements détaillés
```sql
- id: UUID (clé primaire)
- session_id: UUID (référence vers sessions)
- student_id: UUID (référence vers users)
- tutor_id: UUID (référence vers users)
- amount_cents: INTEGER (montant total)
- currency: VARCHAR(3) ('EUR')
- payment_type: VARCHAR(20) ('CREDIT', 'DIRECT', 'PACK')
- payment_status: VARCHAR(20) ('PENDING', 'PAID', 'FAILED', 'REFUNDED')
- payment_method: VARCHAR(50)
- payment_reference: VARCHAR(255)
- tutor_commission_cents: INTEGER (80% du montant)
- platform_fee_cents: INTEGER (20% du montant)
- processed_at: TIMESTAMP
```

#### 3. **pricing_rules** - Règles de tarification
```sql
- id: UUID (clé primaire)
- session_type: VARCHAR(20) ('NOTA', 'AVA', 'TODA')
- level: VARCHAR(50) ('Collège', 'Lycée', 'Supérieur')
- price_per_hour_cents: INTEGER
- is_active: BOOLEAN
```

#### 4. **user_credentials** - Gestion des credentials
```sql
- id: UUID (clé primaire)
- user_id: UUID (référence vers users)
- credential_type: VARCHAR(50) ('EMAIL_PASSWORD', 'GOOGLE', etc.)
- credential_value: TEXT (mot de passe hashé ou token OAuth)
- is_active: BOOLEAN
- last_used_at: TIMESTAMP
- expires_at: TIMESTAMP
```

## 💰 Système de Tarification

### Types de Séances

1. **NOTA** (Niveau de base)
   - Collège: 50€/h
   - Lycée: 60€/h
   - Supérieur: 80€/h

2. **AVA** (Niveau avancé)
   - Collège: 60€/h
   - Lycée: 70€/h
   - Supérieur: 90€/h

3. **TODA** (Niveau expert)
   - Collège: 70€/h
   - Lycée: 80€/h
   - Supérieur: 100€/h

### Répartition des Paiements

- **Tuteur**: 80% du montant total
- **Plateforme**: 20% du montant total

## 🔌 API Routes

### Tuteur

#### `GET /api/tutor/sessions`
Récupère les séances du tuteur avec filtres et statistiques.

**Paramètres de requête:**
- `status`: 'all', 'COMPLETED', 'IN_PROGRESS', 'CANCELLED'
- `limit`: nombre maximum de résultats

**Réponse:**
```json
{
  "sessions": [...],
  "stats": {
    "total": 25,
    "completed": 20,
    "pending": 3,
    "cancelled": 2,
    "totalEarnings": 120000,
    "averageRating": "4.5"
  }
}
```

#### `POST /api/tutor/sessions`
Crée une nouvelle séance.

**Body:**
```json
{
  "booking_id": "uuid",
  "student_id": "uuid",
  "course_id": "uuid",
  "session_type": "AVA",
  "level": "Lycée",
  "topics_covered": ["Dérivées", "Limites"],
  "homework_assigned": "Exercices 1-5",
  "tutor_notes": "Élève motivé"
}
```

#### `PATCH /api/tutor/sessions/[id]`
Met à jour une séance (terminer, ajouter notes, etc.).

#### `GET /api/tutor/payments`
Récupère les paiements du tuteur avec statistiques.

### Étudiant

#### `GET /api/student/sessions`
Récupère les séances de l'étudiant.

#### `PATCH /api/student/sessions`
Met à jour les notes et évaluations de l'étudiant.

### Admin

#### `GET /api/admin/pricing`
Gère les règles de tarification.

#### `GET /api/admin/users/credentials`
Gère les credentials des utilisateurs.

## 🔧 Utilitaires

### `lib/pricing.ts`

#### `calculateSessionPrice(sessionType, level, durationMinutes)`
Calcule le prix d'une séance selon les règles de tarification.

#### `calculateTutorEarnings(tutorId, startDate?, endDate?)`
Calcule les statistiques de revenus d'un tuteur.

## 🔐 Sécurité

### Row Level Security (RLS)
- Les utilisateurs ne peuvent voir que leurs propres séances
- Les tuteurs peuvent créer et modifier leurs séances
- Les admins ont accès à toutes les données

### Gestion des Credentials
- Mots de passe hashés avec bcrypt
- Support pour différents types d'authentification
- Gestion des expirations et désactivations

## 📊 Données de Test

### Comptes de Test
- **Tuteur**: `tutor@sikaschool.com` / `Daniel`
- **Étudiant**: `student@sikaschool.com` / `Steve`
- **Admin**: `admin@sikaschool.com` / `password123`

### Séances d'Exemple
- Séance AVA Lycée terminée avec paiement
- Séance NOTA Collège en cours
- Séance TODA Supérieur programmée

## 🚀 Utilisation

### 1. Créer une Séance
```typescript
const response = await fetch('/api/tutor/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    booking_id: 'uuid',
    student_id: 'uuid',
    session_type: 'AVA',
    level: 'Lycée'
  })
});
```

### 2. Terminer une Séance
```typescript
const response = await fetch(`/api/tutor/sessions/${sessionId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'COMPLETED',
    ended_at: new Date().toISOString(),
    tutor_notes: 'Séance productive'
  })
});
```

### 3. Calculer un Prix
```typescript
import { calculateSessionPrice } from '@/lib/pricing';

const pricing = await calculateSessionPrice('AVA', 'Lycée', 60);
console.log(`Prix: ${pricing.totalPrice / 100}€`);
console.log(`Commission tuteur: ${pricing.tutorCommission / 100}€`);
```

## 📈 Statistiques et Rapports

Le système fournit des statistiques détaillées pour:
- Revenus par type de séance
- Évaluations moyennes
- Taux de completion
- Paiements en attente
- Historique des séances

## 🔄 Workflow Complet

1. **Réservation** → Création d'un `booking`
2. **Séance** → Création d'une `session` par le tuteur
3. **Terminaison** → Mise à jour du statut et création du `session_payment`
4. **Paiement** → Traitement automatique avec répartition 80/20
5. **Évaluation** → Notes mutuelles tuteur-étudiant

Ce système permet une gestion complète et sécurisée des séances avec un suivi financier précis et une répartition équitable des revenus.
