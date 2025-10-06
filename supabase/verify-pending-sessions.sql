-- Vérification complète des sessions PENDING
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure de la table
SELECT 'Structure de la table sessions:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes CHECK
SELECT 'Contraintes CHECK:' as info;
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'sessions'::regclass 
AND contype = 'c';

-- 3. Lister toutes les sessions PENDING existantes
SELECT 'Sessions PENDING existantes:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.session_type,
    s.started_at,
    u1.first_name || ' ' || u1.last_name as student_name,
    u2.first_name || ' ' || u2.last_name as tutor_name
FROM sessions s
LEFT JOIN users u1 ON s.student_id = u1.id
LEFT JOIN users u2 ON s.tutor_id = u2.id
WHERE s.status = 'PENDING'
ORDER BY s.created_at DESC;

-- 4. Test d'insertion d'une nouvelle session PENDING
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
        'Test PENDING - ' || NOW()::text,
        'Lycée',
        'NOTA',
        'PENDING',
        NOW() + INTERVAL '3 days',
        60
    ) RETURNING id INTO test_session_id;
    
    RAISE NOTICE 'Session PENDING créée avec succès: %', test_session_id;
    
    -- Vérifier que la session est bien créée
    RAISE NOTICE 'Nouvelle session PENDING créée avec succès: %', test_session_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création: %', SQLERRM;
END $$;
