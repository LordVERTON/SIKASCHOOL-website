-- Script de nettoyage des sessions passées (version détaillée)
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Identifier les sessions passées avec des statuts incorrects
SELECT 'Sessions passées avec statuts incorrects:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    NOW() as current_time,
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

-- 4. Statistiques des statuts pour les sessions passées
SELECT 'Statistiques des sessions passées:' as info;
SELECT 
    status,
    COUNT(*) as count,
    CASE 
        WHEN status = 'COMPLETED' THEN '✅ Correct'
        WHEN status = 'CANCELLED' THEN '✅ Correct'
        ELSE '❌ Incorrect'
    END as validation
FROM sessions
WHERE started_at < NOW()
GROUP BY status
ORDER BY count DESC;

-- 5. Statistiques des statuts pour les sessions futures
SELECT 'Statistiques des sessions futures:' as info;
SELECT 
    status,
    COUNT(*) as count,
    CASE 
        WHEN status = 'SCHEDULED' THEN '✅ Correct'
        WHEN status = 'PENDING' THEN '✅ Correct'
        WHEN status = 'IN_PROGRESS' THEN '✅ Correct'
        ELSE '❌ Incorrect'
    END as validation
FROM sessions
WHERE started_at >= NOW()
GROUP BY status
ORDER BY count DESC;

-- 6. Résumé global
SELECT 'Résumé global des statuts:' as info;
SELECT 
    status,
    COUNT(*) as total_count,
    COUNT(CASE WHEN started_at < NOW() THEN 1 END) as past_count,
    COUNT(CASE WHEN started_at >= NOW() THEN 1 END) as future_count
FROM sessions
GROUP BY status
ORDER BY total_count DESC;
