-- Script de nettoyage des sessions passées
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Identifier les sessions passées avec des statuts incorrects
SELECT 'Sessions passées avec statuts incorrects:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.duration_minutes,
    NOW() as current_time,
    s.started_at + INTERVAL '1 minute' * s.duration_minutes as end_time,
    CASE 
        WHEN s.started_at < NOW() AND s.status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING')
        THEN 'INCORRECT - DEVRAIT ÊTRE COMPLETED OU CANCELLED'
        ELSE 'CORRECT'
    END as status_check,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.started_at < NOW()
AND s.status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING')
ORDER BY s.started_at DESC;

-- 2. Corriger les sessions passées - les marquer comme COMPLETED
UPDATE sessions 
SET 
    status = 'COMPLETED',
    completed_at = NOW(),
    updated_at = NOW()
WHERE started_at < NOW()
AND status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING');

-- 3. Vérifier le résultat après nettoyage
SELECT 'Sessions après nettoyage:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.completed_at,
    s.updated_at,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.started_at < NOW()
ORDER BY s.started_at DESC
LIMIT 10;

-- 4. Statistiques des statuts après nettoyage
SELECT 'Statistiques des statuts:' as info;
SELECT 
    status,
    COUNT(*) as count,
    CASE 
        WHEN status = 'COMPLETED' THEN '✅ Correct'
        WHEN status = 'CANCELLED' THEN '✅ Correct'
        WHEN status = 'SCHEDULED' THEN '✅ Correct (futures)'
        WHEN status = 'PENDING' THEN '✅ Correct (futures)'
        WHEN status = 'IN_PROGRESS' THEN '✅ Correct (futures)'
        ELSE '❌ Incorrect'
    END as validation
FROM sessions
GROUP BY status
ORDER BY count DESC;
