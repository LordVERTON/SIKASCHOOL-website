-- Test des données du dashboard tuteur
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les informations d'un tuteur
SELECT 'Informations tuteur:' as info;
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.created_at,
    u.role
FROM users u
WHERE u.role = 'TUTOR'
ORDER BY u.created_at DESC
LIMIT 3;

-- 2. Vérifier les sessions d'un tuteur avec statistiques
SELECT 'Sessions du tuteur:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.duration_minutes,
    s.student_rating,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
ORDER BY s.started_at DESC
LIMIT 10;

-- 3. Calculer les statistiques pour un tuteur
SELECT 'Statistiques tuteur:' as info;
WITH tutor_sessions AS (
    SELECT 
        s.*,
        u.first_name || ' ' || u.last_name as student_name
    FROM sessions s
    LEFT JOIN users u ON s.student_id = u.id
    WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
)
SELECT 
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_sessions,
    COUNT(CASE WHEN status = 'SCHEDULED' OR status = 'PENDING' THEN 1 END) as upcoming_sessions,
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_sessions,
    ROUND(SUM(CASE WHEN status = 'COMPLETED' THEN duration_minutes ELSE 0 END) / 60.0, 1) as total_hours,
    COUNT(DISTINCT student_id) as unique_students,
    ROUND(AVG(CASE WHEN status = 'COMPLETED' AND student_rating IS NOT NULL THEN student_rating END), 1) as avg_rating
FROM tutor_sessions;

-- 4. Sessions à venir (7 prochains jours)
SELECT 'Sessions à venir (7j):' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.duration_minutes,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at > NOW()
AND s.started_at <= NOW() + INTERVAL '7 days'
AND s.status IN ('SCHEDULED', 'PENDING')
ORDER BY s.started_at ASC;

-- 5. Sessions récentes terminées
SELECT 'Sessions récentes terminées:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.completed_at,
    s.duration_minutes,
    s.student_rating,
    s.topics_covered,
    s.homework_assigned,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at <= NOW()
AND s.status IN ('COMPLETED', 'CANCELLED')
ORDER BY s.started_at DESC
LIMIT 5;
