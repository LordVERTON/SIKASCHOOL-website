-- Script pour ajouter le statut PENDING à la table sessions
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer la contrainte CHECK existante sur le statut
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_status_check;

-- Ajouter la nouvelle contrainte CHECK qui inclut PENDING
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check 
CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

-- Vérifier que la contrainte a été appliquée
SELECT conname, contype, confrelid
FROM pg_constraint 
WHERE conrelid = 'sessions'::regclass 
AND conname = 'sessions_status_check';
