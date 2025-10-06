-- Correction rapide pour ajouter le statut PENDING
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer la contrainte CHECK existante sur le statut
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_status_check;

-- 2. Ajouter la nouvelle contrainte avec PENDING
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check 
CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

-- 3. Vérifier que ça marche
SELECT 'Contrainte mise à jour' as status;
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'sessions'::regclass 
AND conname = 'sessions_status_check';
