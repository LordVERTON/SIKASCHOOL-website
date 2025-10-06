-- Test pour vérifier l'affichage des sessions PENDING
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer une session PENDING de test
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
    
    -- Créer une session PENDING
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
        'Test PENDING - Mathématiques',
        'Lycée',
        'NOTA',
        'PENDING',
        NOW() + INTERVAL '2 days',
        60
    ) RETURNING id INTO test_session_id;
    
    RAISE NOTICE 'Session PENDING créée: %', test_session_id;
    
    -- Vérifier que la session est visible pour l'étudiant
    RAISE NOTICE 'Sessions pour étudiant:';
    PERFORM id, subject, status, session_type, started_at 
    FROM sessions 
    WHERE student_id = test_student_id 
    AND status = 'PENDING'
    ORDER BY created_at DESC;
    
    -- Vérifier que la session est visible pour le tuteur
    RAISE NOTICE 'Sessions pour tuteur:';
    PERFORM id, subject, status, session_type, started_at 
    FROM sessions 
    WHERE tutor_id = test_tutor_id 
    AND status = 'PENDING'
    ORDER BY created_at DESC;
    
    -- Nettoyer (optionnel - commentez si vous voulez garder la session)
    -- DELETE FROM sessions WHERE id = test_session_id;
    -- RAISE NOTICE 'Session de test supprimée';
    
END $$;
