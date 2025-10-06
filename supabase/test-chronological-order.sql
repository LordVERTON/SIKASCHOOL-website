-- Test de l'ordre chronologique des sessions
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer des sessions de test avec différents horaires
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
-- Session d'aujourd'hui 20h (la plus tardive)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Aujourd\'hui 20h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '10 hours',
    60
),
-- Session d'aujourd'hui 10h (la plus tôt)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Aujourd\'hui 10h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '2 hours',
    60
),
-- Session d'aujourd'hui 14h (entre les deux)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Aujourd\'hui 14h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'PENDING',
    NOW() + INTERVAL '6 hours',
    60
),
-- Session demain 9h
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Demain 9h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
    60
),
-- Session demain 15h
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Demain 15h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'IN_PROGRESS',
    NOW() + INTERVAL '1 day' + INTERVAL '7 hours',
    60
),
-- Session dans 3 jours
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test +3j - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '3 days',
    60
)
RETURNING id, subject, status, started_at;

-- 2. Vérifier l'ordre chronologique des prochaines séances
SELECT 'Prochaines séances dans l\'ordre chronologique:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::date as session_date,
    s.started_at::time as session_time,
    CASE 
        WHEN s.started_at::date = CURRENT_DATE THEN 'Aujourd\'hui'
        WHEN s.started_at::date = CURRENT_DATE + INTERVAL '1 day' THEN 'Demain'
        ELSE 'Dans ' || EXTRACT(DAY FROM (s.started_at::date - CURRENT_DATE)) || ' jour(s)'
    END as relative_date,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at::date >= CURRENT_DATE
AND s.started_at::date <= CURRENT_DATE + INTERVAL '7 days'
AND s.status IN ('SCHEDULED', 'PENDING', 'IN_PROGRESS')
ORDER BY s.started_at ASC; -- Ordre chronologique (plus proches en premier)

-- 3. Vérifier l'ordre chronologique inverse des sessions récentes
SELECT 'Sessions récentes dans l\'ordre chronologique inverse:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::date as session_date,
    s.started_at::time as session_time,
    CASE 
        WHEN s.started_at::date = CURRENT_DATE - INTERVAL '1 day' THEN 'Hier'
        WHEN s.started_at::date = CURRENT_DATE - INTERVAL '2 days' THEN 'Il y a 2 jours'
        ELSE 'Il y a ' || EXTRACT(DAY FROM (CURRENT_DATE - s.started_at::date)) || ' jour(s)'
    END as relative_date,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at::date < CURRENT_DATE
AND s.status IN ('COMPLETED', 'CANCELLED')
ORDER BY s.started_at DESC; -- Ordre chronologique inverse (plus récentes en premier)

-- 4. Simuler exactement la logique du dashboard avec tri
SELECT 'Sessions du dashboard (triées):' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::date as session_date,
    s.started_at::time as session_time,
    ROW_NUMBER() OVER (ORDER BY s.started_at ASC) as chronological_order,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at::date >= CURRENT_DATE
AND s.started_at::date <= CURRENT_DATE + INTERVAL '7 days'
AND s.status IN ('SCHEDULED', 'PENDING', 'IN_PROGRESS')
ORDER BY s.started_at ASC
LIMIT 4;

-- 5. Nettoyer les sessions de test (optionnel)
-- DELETE FROM sessions WHERE subject LIKE 'Test %';
