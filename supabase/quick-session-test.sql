-- Test rapide d'insertion de session
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Voir la structure actuelle
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- 2. Voir les contraintes CHECK
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'sessions'::regclass 
AND contype = 'c';

-- 3. Test d'insertion minimal
DO $$
DECLARE
    test_student_id UUID;
    test_tutor_id UUID;
    test_session_id UUID;
BEGIN
    -- Récupérer un étudiant et un tuteur
    SELECT id INTO test_student_id FROM users WHERE role = 'STUDENT' LIMIT 1;
    SELECT id INTO test_tutor_id FROM users WHERE role = 'TUTOR' LIMIT 1;
    
    IF test_student_id IS NULL OR test_tutor_id IS NULL THEN
        RAISE NOTICE 'Aucun étudiant ou tuteur trouvé';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Test avec étudiant: % et tuteur: %', test_student_id, test_tutor_id;
    
    -- Test 1: Insertion basique avec SCHEDULED
    BEGIN
        INSERT INTO sessions (
            student_id,
            tutor_id,
            subject,
            level,
            session_type,
            status,
            started_at,
            duration_minutes
        ) VALUES (
            test_student_id,
            test_tutor_id,
            'Test Mathématiques',
            'Lycée',
            'NOTA',
            'SCHEDULED',
            NOW() + INTERVAL '1 day',
            60
        ) RETURNING id INTO test_session_id;
        
        RAISE NOTICE 'Session SCHEDULED créée: %', test_session_id;
        
        -- Nettoyer
        DELETE FROM sessions WHERE id = test_session_id;
        RAISE NOTICE 'Session nettoyée';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erreur SCHEDULED: %', SQLERRM;
    END;
    
    -- Test 2: Insertion avec PENDING
    BEGIN
        INSERT INTO sessions (
            student_id,
            tutor_id,
            subject,
            level,
            session_type,
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
        
        RAISE NOTICE 'Session PENDING créée: %', test_session_id;
        
        -- Nettoyer
        DELETE FROM sessions WHERE id = test_session_id;
        RAISE NOTICE 'Session nettoyée';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erreur PENDING: %', SQLERRM;
    END;
    
END $$;
