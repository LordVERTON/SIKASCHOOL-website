-- Script de diagnostic pour identifier la structure de la table sessions
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier l'existence de la table sessions
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'sessions'
) as table_exists;

-- 2. Lister toutes les colonnes de la table sessions
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes CHECK existantes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'sessions'::regclass 
AND contype = 'c'
ORDER BY conname;

-- 4. Tester l'insertion avec les colonnes disponibles
DO $$
DECLARE
    test_student_id UUID;
    test_tutor_id UUID;
    test_session_id UUID;
    column_list TEXT;
BEGIN
    -- Récupérer un étudiant et un tuteur
    SELECT id INTO test_student_id FROM users WHERE role = 'STUDENT' LIMIT 1;
    SELECT id INTO test_tutor_id FROM users WHERE role = 'TUTOR' LIMIT 1;
    
    IF test_student_id IS NULL OR test_tutor_id IS NULL THEN
        RAISE NOTICE 'Aucun étudiant ou tuteur trouvé pour le test';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Test avec étudiant: % et tuteur: %', test_student_id, test_tutor_id;
    
    -- Tester l'insertion basique
    BEGIN
        INSERT INTO sessions (
            student_id,
            tutor_id,
            subject,
            level,
            type,
            status,
            started_at,
            duration_minutes
        ) VALUES (
            test_student_id,
            test_tutor_id,
            'Test Mathématiques',
            'Lycée',
            'NOTA',
            'PENDING',
            NOW() + INTERVAL '1 day',
            60
        ) RETURNING id INTO test_session_id;
        
        RAISE NOTICE 'Session PENDING créée avec succès: %', test_session_id;
        
        -- Nettoyer le test
        DELETE FROM sessions WHERE id = test_session_id;
        RAISE NOTICE 'Session de test supprimée';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erreur lors du test: %', SQLERRM;
    END;
    
END $$;
