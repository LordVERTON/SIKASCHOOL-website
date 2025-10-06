-- Script pour corriger la table sessions et ajouter le support du statut PENDING
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer les contraintes existantes
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_type_check;

-- 2. Ajouter la colonne subject si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sessions' AND column_name = 'subject') THEN
        ALTER TABLE sessions ADD COLUMN subject VARCHAR(100);
    END IF;
END $$;

-- 3. Renommer la colonne type en session_type si nécessaire
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'type') THEN
        ALTER TABLE sessions RENAME COLUMN type TO session_type;
    END IF;
END $$;

-- 4. Ajouter les nouvelles contraintes
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check 
CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

ALTER TABLE sessions ADD CONSTRAINT sessions_type_check 
CHECK (session_type IN ('NOTA', 'AVA', 'TODA'));

-- 5. Mettre à jour les colonnes NULL avec des valeurs par défaut
UPDATE sessions SET subject = 'Séance' WHERE subject IS NULL;
UPDATE sessions SET session_type = 'NOTA' WHERE session_type IS NULL;
UPDATE sessions SET level = 'Niveau' WHERE level IS NULL;

-- 6. Rendre les colonnes NOT NULL si elles ne le sont pas déjà
ALTER TABLE sessions ALTER COLUMN subject SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN session_type SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN level SET NOT NULL;

-- 7. Vérifier la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- 8. Vérifier les contraintes
SELECT conname, contype, confrelid
FROM pg_constraint 
WHERE conrelid = 'sessions'::regclass 
AND conname LIKE 'sessions_%_check';
