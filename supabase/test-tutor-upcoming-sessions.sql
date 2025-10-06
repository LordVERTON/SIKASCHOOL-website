-- Test des prochaines séances du dashboard tuteur
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer des sessions de test avec différentes dates
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
    'Test Hier - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'COMPLETED',
    NOW() - INTERVAL '1 day',
    60
),
-- Session d'aujourd'hui matin (doit apparaître)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Aujourd\'hui Matin - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '2 hours',
    60
),
-- Session d'aujourd'hui après-midi (doit apparaître)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Aujourd\'hui Après-midi - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'PENDING',
    NOW() + INTERVAL '4 hours',
    60
),
-- Session demain (doit apparaître)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Demain - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '1 day',
    60
),
-- Session dans 3 jours (doit apparaître)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test +3j - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'IN_PROGRESS',
    NOW() + INTERVAL '3 days',
    60
),
-- Session dans 8 jours (ne doit pas apparaître - au-delà de 7j)
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

-- 2. Vérifier la logique des prochaines séances
SELECT 'Prochaines séances (aujourd\'hui + 7j):' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::date as session_date,
    CURRENT_DATE as today,
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

-- 3. Simuler la logique du dashboard
SELECT 'Logique du dashboard (sessions à afficher):' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::date as session_date,
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
