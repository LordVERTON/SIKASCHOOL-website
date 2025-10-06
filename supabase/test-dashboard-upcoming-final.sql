-- Test final des prochaines séances du dashboard
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer des sessions de test avec différentes dates et heures
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
-- Session d'hier (ne doit pas apparaître)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Hier 14h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'COMPLETED',
    NOW() - INTERVAL '1 day' + INTERVAL '14 hours',
    60
),
-- Session d'aujourd'hui 10h (doit apparaître)
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
-- Session d'aujourd'hui 16h (doit apparaître)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Aujourd\'hui 16h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'PENDING',
    NOW() + INTERVAL '6 hours',
    60
),
-- Session d'aujourd'hui 20h (doit apparaître)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Aujourd\'hui 20h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'IN_PROGRESS',
    NOW() + INTERVAL '10 hours',
    60
),
-- Session demain 9h (doit apparaître)
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
-- Session dans 3 jours (doit apparaître)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test +3j - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '3 days',
    60
),
-- Session dans 8 jours (ne doit pas apparaître)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test +8j - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '8 days',
    60
)
RETURNING id, subject, status, started_at;

-- 2. Vérifier la logique complète
SELECT 'Logique complète des prochaines séances:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::date as session_date,
    s.started_at::time as session_time,
    CURRENT_DATE as today,
    CURRENT_TIME as current_time,
    CASE 
        WHEN s.started_at::date = CURRENT_DATE THEN 'Aujourd\'hui'
        WHEN s.started_at::date = CURRENT_DATE + INTERVAL '1 day' THEN 'Demain'
        ELSE 'Dans ' || EXTRACT(DAY FROM (s.started_at::date - CURRENT_DATE)) || ' jour(s)'
    END as relative_date,
    CASE 
        WHEN s.started_at::date >= CURRENT_DATE 
        AND s.started_at::date <= CURRENT_DATE + INTERVAL '7 days'
        AND s.status IN ('SCHEDULED', 'PENDING', 'IN_PROGRESS')
        THEN '✅ DOIT APPARAÎTRE'
        ELSE '❌ NE DOIT PAS APPARAÎTRE'
    END as should_appear,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.subject LIKE 'Test %'
ORDER BY s.started_at ASC;

-- 3. Simuler exactement la logique du dashboard
SELECT 'Sessions qui DOIVENT apparaître dans le dashboard:' as info;
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
ORDER BY s.started_at ASC
LIMIT 4;

-- 4. Nettoyer les sessions de test (optionnel)
-- DELETE FROM sessions WHERE subject LIKE 'Test %';
