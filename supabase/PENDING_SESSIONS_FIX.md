# Fix pour l'affichage des sessions PENDING

## Problème
Les sessions créées par les étudiants avec le statut PENDING ne s'affichent pas correctement dans les agendas (étudiant et tuteur) avec la couleur rouge pâle.

## ✅ Corrections apportées

### 1. APIs de récupération des sessions
- **`app/api/student/sessions/route.ts`** : Ajout du statut 'PENDING' dans les filtres
- **`app/api/tutor/sessions/route.ts`** : Correction pour utiliser `session_type` au lieu de `type`
- **`app/api/sessions/route.ts`** : API de création adaptée pour utiliser `session_type`

### 2. Structure de la base de données
- Scripts de migration pour ajouter le statut PENDING
- Correction des contraintes CHECK
- Adaptation aux colonnes existantes (`session_type` vs `type`)

### 3. Affichage visuel
- Les calendriers affichent déjà les sessions PENDING en rouge pâle
- Légendes mises à jour pour inclure "En attente"

## 🔧 Scripts de vérification

### 1. Diagnostic complet
```sql
-- Exécuter dans Supabase SQL Editor
-- Contenu de supabase/verify-pending-sessions.sql
```

### 2. Test d'affichage
```sql
-- Exécuter dans Supabase SQL Editor  
-- Contenu de supabase/test-pending-display.sql
```

### 3. Correction rapide
```sql
-- Exécuter dans Supabase SQL Editor
-- Contenu de supabase/quick-fix-pending.sql
```

## 🎯 Flux attendu

1. **Étudiant** crée une séance → Statut PENDING + Notification au tuteur
2. **Sessions PENDING** apparaissent en **rouge pâle** dans les deux agendas
3. **Tuteur** peut accepter/refuser depuis :
   - Page notifications (`/tutor/notifications`)
   - Agenda tuteur (`/tutor/calendar`)
4. **Statut mis à jour** : PENDING → SCHEDULED (accepté) ou CANCELLED (refusé)

## 🚀 Test final

1. Exécuter `supabase/verify-pending-sessions.sql`
2. Créer une séance depuis l'interface étudiant
3. Vérifier qu'elle apparaît en rouge pâle dans les deux agendas
4. Tester l'acceptation/refus depuis l'agenda tuteur

## 📋 Statuts supportés

- **PENDING** : En attente d'approbation (rouge pâle)
- **SCHEDULED** : Confirmée (bleu)
- **IN_PROGRESS** : En cours (jaune)
- **COMPLETED** : Terminée (vert)
- **CANCELLED** : Annulée (gris)
