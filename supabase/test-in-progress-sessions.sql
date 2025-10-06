-- Test de la logique des sessions IN_PROGRESS
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer des sessions de test avec différents statuts et heures
INSERT INTO sessions (
    student_id,
    tutor_id,
    subject,
    level,
    session_type,
    status,
    started_at,
    duration_minutes
) VALUES 
-- Session qui devrait être en cours maintenant (début il y a 30min, durée 60min)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test En Cours - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() - INTERVAL '30 minutes',
    60
),
-- Session qui devrait être terminée (début il y a 2h, durée 60min)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Terminée - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() - INTERVAL '2 hours',
    60
),
-- Session qui commence dans 1h
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Future - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '1 hour',
    60
),
-- Session déjà en cours (statut IN_PROGRESS)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Déjà En Cours - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'IN_PROGRESS',
    NOW() - INTERVAL '15 minutes',
    60
)
RETURNING id, subject, status, started_at, duration_minutes;

-- 2. Vérifier les sessions qui devraient être en cours
SELECT 'Sessions qui devraient être en cours:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.duration_minutes,
    NOW() as current_time,
    s.started_at + INTERVAL '1 minute' * s.duration_minutes as end_time,
    CASE 
        WHEN NOW() >= s.started_at AND NOW() <= (s.started_at + INTERVAL '1 minute' * s.duration_minutes) 
        THEN 'DEVRAIT ÊTRE EN COURS'
        WHEN NOW() > (s.started_at + INTERVAL '1 minute' * s.duration_minutes)
        THEN 'DEVRAIT ÊTRE TERMINÉE'
        ELSE 'PAS ENCORE COMMENCÉE'
    END as expected_status,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.subject LIKE 'Test %'
ORDER BY s.started_at DESC;

-- 3. Simuler la mise à jour des statuts
UPDATE sessions 
SET status = 'IN_PROGRESS', updated_at = NOW()
WHERE id IN (
    SELECT s.id 
    FROM sessions s 
    WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
    AND s.status IN ('SCHEDULED', 'PENDING')
    AND NOW() >= s.started_at 
    AND NOW() <= (s.started_at + INTERVAL '1 minute' * s.duration_minutes)
    AND s.subject LIKE 'Test %'
);

-- 4. Marquer comme terminées les sessions dépassées
UPDATE sessions 
SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW()
WHERE id IN (
    SELECT s.id 
    FROM sessions s 
    WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
    AND s.status = 'IN_PROGRESS'
    AND NOW() > (s.started_at + INTERVAL '1 minute' * s.duration_minutes)
    AND s.subject LIKE 'Test %'
);

-- 5. Vérifier les statuts après mise à jour
SELECT 'Statuts après mise à jour:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.duration_minutes,
    s.updated_at,
    NOW() as current_time,
    s.started_at + INTERVAL '1 minute' * s.duration_minutes as end_time,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.subject LIKE 'Test %'
ORDER BY s.started_at DESC;

-- 6. Nettoyer les sessions de test (optionnel)
-- DELETE FROM sessions WHERE subject LIKE 'Test %';
