-- Script adaptatif pour corriger la table sessions
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure actuelle
SELECT 'Structure actuelle de la table sessions:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- 2. Supprimer les contraintes CHECK existantes sur le statut
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_type_check;

-- 3. Ajouter la colonne subject si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sessions' AND column_name = 'subject') THEN
        ALTER TABLE sessions ADD COLUMN subject VARCHAR(100);
        RAISE NOTICE 'Colonne subject ajoutée';
    ELSE
        RAISE NOTICE 'Colonne subject existe déjà';
    END IF;
END $$;

-- 4. Renommer type en session_type si la colonne type existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'type') THEN
        -- Vérifier si session_type existe déjà
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'sessions' AND column_name = 'session_type') THEN
            ALTER TABLE sessions RENAME COLUMN type TO session_type;
            RAISE NOTICE 'Colonne type renommée en session_type';
        ELSE
            RAISE NOTICE 'Colonne session_type existe déjà, suppression de type';
            ALTER TABLE sessions DROP COLUMN type;
        END IF;
    END IF;
END $$;

-- 5. Ajouter les nouvelles contraintes
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check 
CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

-- Vérifier si la colonne session_type existe pour la contrainte
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'session_type') THEN
        ALTER TABLE sessions ADD CONSTRAINT sessions_type_check 
        CHECK (session_type IN ('NOTA', 'AVA', 'TODA'));
        RAISE NOTICE 'Contrainte session_type ajoutée';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sessions' AND column_name = 'type') THEN
        ALTER TABLE sessions ADD CONSTRAINT sessions_type_check 
        CHECK (type IN ('NOTA', 'AVA', 'TODA'));
        RAISE NOTICE 'Contrainte type ajoutée';
    END IF;
END $$;

-- 6. Mettre à jour les colonnes NULL avec des valeurs par défaut
UPDATE sessions SET subject = 'Séance' WHERE subject IS NULL;
UPDATE sessions SET level = 'Niveau' WHERE level IS NULL;

-- 7. Rendre les colonnes NOT NULL si elles ne le sont pas déjà
ALTER TABLE sessions ALTER COLUMN subject SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN level SET NOT NULL;

-- 8. Vérifier la structure finale
SELECT 'Structure finale de la table sessions:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- 9. Vérifier les contraintes
SELECT 'Contraintes CHECK:' as info;
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'sessions'::regclass 
AND contype = 'c'
ORDER BY conname;
