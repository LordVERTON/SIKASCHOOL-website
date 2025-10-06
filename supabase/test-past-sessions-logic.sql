-- Test de la logique des sessions passées
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer des sessions de test avec différents statuts et dates
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
-- Session d'hier avec statut SCHEDULED (incorrect)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Hier SCHEDULED - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() - INTERVAL '1 day',
    60
),
-- Session d'hier avec statut IN_PROGRESS (incorrect)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Hier IN_PROGRESS - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'IN_PROGRESS',
    NOW() - INTERVAL '2 hours',
    60
),
-- Session d'hier avec statut PENDING (incorrect)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Hier PENDING - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'PENDING',
    NOW() - INTERVAL '3 hours',
    60
),
-- Session d'hier avec statut COMPLETED (correct)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Hier COMPLETED - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'COMPLETED',
    NOW() - INTERVAL '1 day',
    60
),
-- Session d'hier avec statut CANCELLED (correct)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Hier CANCELLED - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'CANCELLED',
    NOW() - INTERVAL '1 day',
    60
),
-- Session future avec statut SCHEDULED (correct)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Future SCHEDULED - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '1 day',
    60
)
RETURNING id, subject, status, started_at;

-- 2. Vérifier les sessions avec statuts incorrects
SELECT 'Sessions avec statuts incorrects:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    NOW() as current_time,
    CASE 
        WHEN s.started_at < NOW() AND s.status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING')
        THEN '❌ INCORRECT - Session passée avec statut actif'
        WHEN s.started_at >= NOW() AND s.status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING')
        THEN '✅ CORRECT - Session future avec statut actif'
        WHEN s.started_at < NOW() AND s.status IN ('COMPLETED', 'CANCELLED')
        THEN '✅ CORRECT - Session passée avec statut final'
        ELSE '❓ INCONNU'
    END as validation,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.subject LIKE 'Test %'
ORDER BY s.started_at DESC;

-- 3. Appliquer la correction - marquer les sessions passées comme COMPLETED
UPDATE sessions 
SET 
    status = 'COMPLETED',
    completed_at = NOW(),
    updated_at = NOW()
WHERE started_at < NOW()
AND status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING')
AND subject LIKE 'Test %';

-- 4. Vérifier le résultat après correction
SELECT 'Sessions après correction:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.completed_at,
    s.updated_at,
    CASE 
        WHEN s.started_at < NOW() AND s.status IN ('COMPLETED', 'CANCELLED')
        THEN '✅ CORRECT'
        WHEN s.started_at >= NOW() AND s.status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING')
        THEN '✅ CORRECT'
        ELSE '❌ INCORRECT'
    END as validation,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.subject LIKE 'Test %'
ORDER BY s.started_at DESC;

-- 5. Nettoyer les sessions de test (optionnel)
-- DELETE FROM sessions WHERE subject LIKE 'Test %';
