-- Test d'annulation de session
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer une session de test
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
    'Test Annulation - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '3 days',
    60
) RETURNING id, subject, status, session_type, started_at;

-- 2. Vérifier que la session est bien créée
SELECT 'Session créée:' as info;
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
WHERE s.subject LIKE 'Test Annulation%'
ORDER BY s.created_at DESC
LIMIT 1;

-- 3. Simuler l'annulation (mise à jour du statut)
UPDATE sessions 
SET status = 'CANCELLED', updated_at = NOW()
WHERE subject LIKE 'Test Annulation%'
RETURNING id, subject, status, updated_at;

-- 4. Vérifier que la session est bien annulée
SELECT 'Session annulée:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.session_type,
    s.started_at,
    s.updated_at,
    u1.first_name || ' ' || u1.last_name as student_name,
    u2.first_name || ' ' || u2.last_name as tutor_name
FROM sessions s
LEFT JOIN users u1 ON s.student_id = u1.id
LEFT JOIN users u2 ON s.tutor_id = u2.id
WHERE s.subject LIKE 'Test Annulation%'
ORDER BY s.updated_at DESC
LIMIT 1;

-- 5. Nettoyer les sessions de test (optionnel)
-- DELETE FROM sessions WHERE subject LIKE 'Test Annulation%';
