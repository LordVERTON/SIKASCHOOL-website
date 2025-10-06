-- Script de vérification de la structure de la table sessions
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes CHECK
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'sessions'::regclass 
AND contype = 'c'
ORDER BY conname;

-- 3. Tester l'insertion d'une session PENDING
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
        RAISE NOTICE 'Aucun étudiant ou tuteur trouvé pour le test';
        RETURN;
    END IF;
    
    -- Tester l'insertion
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
    
    RAISE NOTICE 'Session PENDING créée avec succès: %', test_session_id;
    
    -- Nettoyer le test
    DELETE FROM sessions WHERE id = test_session_id;
    RAISE NOTICE 'Session de test supprimée';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors du test: %', SQLERRM;
END $$;
