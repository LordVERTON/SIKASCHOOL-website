-- Test des actions du dashboard tuteur
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer des sessions de test avec différents statuts
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
-- Session en cours (peut être rejointe)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test En Cours - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'IN_PROGRESS',
    NOW() - INTERVAL '30 minutes',
    60
),
-- Session confirmée (peut être rejointe et annulée)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Confirmée - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '2 hours',
    60
),
-- Session en attente (peut être annulée)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test En Attente - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'PENDING',
    NOW() + INTERVAL '1 day',
    60
),
-- Session terminée (aucune action)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Terminée - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'COMPLETED',
    NOW() - INTERVAL '1 day',
    60
)
RETURNING id, subject, status, started_at;

-- 2. Vérifier les sessions avec leurs actions possibles
SELECT 'Sessions avec actions possibles:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    CASE 
        WHEN s.status = 'IN_PROGRESS' THEN '✅ Peut rejoindre'
        WHEN s.status = 'SCHEDULED' THEN '✅ Peut rejoindre + annuler'
        WHEN s.status = 'PENDING' THEN '✅ Peut annuler'
        WHEN s.status = 'COMPLETED' THEN '❌ Aucune action'
        WHEN s.status = 'CANCELLED' THEN '❌ Aucune action'
        ELSE '❓ Statut inconnu'
    END as available_actions,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.subject LIKE 'Test %'
ORDER BY s.started_at DESC;

-- 3. Tester l'annulation d'une session
UPDATE sessions 
SET 
    status = 'CANCELLED',
    updated_at = NOW()
WHERE id = (
    SELECT id FROM sessions 
    WHERE tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
    AND subject LIKE 'Test %'
    AND status = 'PENDING'
    LIMIT 1
);

-- 4. Vérifier le résultat après annulation
SELECT 'Sessions après annulation:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.updated_at,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.subject LIKE 'Test %'
ORDER BY s.started_at DESC;

-- 5. Nettoyer les sessions de test (optionnel)
-- DELETE FROM sessions WHERE subject LIKE 'Test %';
