-- Test simple pour les sessions PENDING
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

-- 3. Créer une session PENDING de test
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
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test PENDING - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'PENDING',
    NOW() + INTERVAL '2 days',
    60
) RETURNING id, subject, status, session_type, started_at;

-- 4. Vérifier que la session est visible pour l'étudiant
SELECT 'Sessions PENDING pour étudiant:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.session_type,
    s.started_at,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.student_id = (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1)
AND s.status = 'PENDING'
ORDER BY s.created_at DESC;

-- 5. Vérifier que la session est visible pour le tuteur
SELECT 'Sessions PENDING pour tuteur:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.session_type,
    s.started_at,
    u.first_name || ' ' || u.last_name as tutor_name
FROM sessions s
LEFT JOIN users u ON s.tutor_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.status = 'PENDING'
ORDER BY s.created_at DESC;

-- 6. Nettoyer les sessions de test (optionnel)
-- DELETE FROM sessions WHERE subject LIKE 'Test PENDING%';
