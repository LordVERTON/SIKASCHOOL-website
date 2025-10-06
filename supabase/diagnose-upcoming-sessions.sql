-- Diagnostic des prochaines séances
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les sessions d'aujourd'hui
SELECT 'Sessions d\'aujourd\'hui:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::date as session_date,
    CURRENT_DATE as today,
    CASE 
        WHEN s.started_at::date = CURRENT_DATE THEN '✅ Aujourd\'hui'
        ELSE '❌ Pas aujourd\'hui'
    END as is_today,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at::date = CURRENT_DATE
ORDER BY s.started_at ASC;

-- 2. Vérifier les sessions futures (demain à +7j)
SELECT 'Sessions futures (demain à +7j):' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::date as session_date,
    CURRENT_DATE as today,
    EXTRACT(DAY FROM (s.started_at::date - CURRENT_DATE)) as days_from_today,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at::date > CURRENT_DATE
AND s.started_at::date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY s.started_at ASC;

-- 3. Vérifier la logique complète (aujourd'hui + 7j)
SELECT 'Logique complète (aujourd\'hui + 7j):' as info;
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
ORDER BY s.started_at ASC;

-- 4. Statistiques par statut
SELECT 'Statistiques par statut:' as info;
SELECT 
    status,
    COUNT(*) as total,
    COUNT(CASE WHEN started_at::date >= CURRENT_DATE AND started_at::date <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as upcoming_7d,
    COUNT(CASE WHEN started_at::date = CURRENT_DATE THEN 1 END) as today
FROM sessions
WHERE tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
GROUP BY status
ORDER BY total DESC;
