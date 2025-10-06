# Fix pour le statut PENDING des sessions

## Problème
L'erreur "Failed to create session" se produit car la table `sessions` n'accepte pas le statut "PENDING" dans sa contrainte CHECK.

## Solution

### 1. Diagnostic de la structure actuelle
Exécuter le fichier `supabase/diagnose-sessions-table.sql` pour identifier la structure exacte de votre table sessions.

### 2. Migration adaptative (recommandée)
Exécuter le fichier `supabase/adaptive-sessions-fix.sql` qui s'adapte automatiquement à votre structure existante.

### 3. Alternative simple
Si vous préférez une approche plus simple, exécuter seulement `supabase/add-pending-status.sql`.

### 4. Vérification
Exécuter le fichier `supabase/test-sessions-insert.sql` pour tester que l'insertion fonctionne.

### 5. Changements apportés

#### Base de données
- Ajout du statut "PENDING" aux contraintes CHECK
- Ajout de la colonne `subject` si elle n'existe pas
- Renommage de `type` en `session_type` pour la cohérence
- Mise à jour des contraintes de validation

#### API (`app/api/sessions/route.ts`)
- Utilisation de `session_type` au lieu de `type`
- Meilleur logging des erreurs
- Retour d'erreurs détaillées

#### Frontend (`app/student/calendar/page.tsx`)
- Affichage des erreurs détaillées à l'utilisateur
- Meilleur debugging

## Statuts de session supportés
- `PENDING` : En attente d'approbation du tuteur
- `SCHEDULED` : Confirmée par le tuteur
- `IN_PROGRESS` : En cours
- `COMPLETED` : Terminée
- `CANCELLED` : Annulée

## Test
Après la migration, tester la création d'une séance depuis l'interface étudiant pour vérifier que :
1. La séance est créée avec le statut PENDING
2. Une notification est envoyée au tuteur
3. La séance apparaît en rouge pâle dans les agendas
