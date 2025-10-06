-- Test de redirection après déconnexion
-- Ce script vérifie que les sessions sont correctement gérées

-- 1. Vérifier les sessions en cours
SELECT 'Sessions en cours:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    u1.first_name || ' ' || u1.last_name as student_name,
    u2.first_name || ' ' || u2.last_name as tutor_name
FROM sessions s
LEFT JOIN users u1 ON s.student_id = u1.id
LEFT JOIN users u2 ON s.tutor_id = u2.id
WHERE s.status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING')
ORDER BY s.started_at DESC
LIMIT 5;

-- 2. Vérifier les sessions terminées récemment
SELECT 'Sessions terminées récemment:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.completed_at,
    u1.first_name || ' ' || u1.last_name as student_name,
    u2.first_name || ' ' || u2.last_name as tutor_name
FROM sessions s
LEFT JOIN users u1 ON s.student_id = u1.id
LEFT JOIN users u2 ON s.tutor_id = u2.id
WHERE s.status = 'COMPLETED'
AND s.completed_at > NOW() - INTERVAL '1 hour'
ORDER BY s.completed_at DESC
LIMIT 5;

-- 3. Vérifier les sessions annulées récemment
SELECT 'Sessions annulées récemment:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.updated_at,
    u1.first_name || ' ' || u1.last_name as student_name,
    u2.first_name || ' ' || u2.last_name as tutor_name
FROM sessions s
LEFT JOIN users u1 ON s.student_id = u1.id
LEFT JOIN users u2 ON s.tutor_id = u2.id
WHERE s.status = 'CANCELLED'
AND s.updated_at > NOW() - INTERVAL '1 hour'
ORDER BY s.updated_at DESC
LIMIT 5;
