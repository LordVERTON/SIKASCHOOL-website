-- Script de validation des statuts de sessions
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les sessions passées (doivent être COMPLETED ou CANCELLED)
SELECT 'Validation des sessions passées:' as info;
SELECT 
    COUNT(*) as total_past_sessions,
    COUNT(CASE WHEN status IN ('COMPLETED', 'CANCELLED') THEN 1 END) as correct_past_sessions,
    COUNT(CASE WHEN status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING') THEN 1 END) as incorrect_past_sessions
FROM sessions
WHERE started_at < NOW();

-- 2. Lister les sessions passées avec des statuts incorrects (s'il y en a)
SELECT 'Sessions passées avec statuts incorrects:' as info;
SELECT 
    id,
    subject,
    status,
    started_at,
    'DEVRAIT ÊTRE COMPLETED OU CANCELLED' as expected_status
FROM sessions
WHERE started_at < NOW()
AND status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING')
ORDER BY started_at DESC;

-- 3. Vérifier les sessions futures (peuvent être SCHEDULED, PENDING, IN_PROGRESS)
SELECT 'Validation des sessions futures:' as info;
SELECT 
    COUNT(*) as total_future_sessions,
    COUNT(CASE WHEN status IN ('SCHEDULED', 'PENDING', 'IN_PROGRESS') THEN 1 END) as correct_future_sessions,
    COUNT(CASE WHEN status IN ('COMPLETED', 'CANCELLED') THEN 1 END) as incorrect_future_sessions
FROM sessions
WHERE started_at >= NOW();

-- 4. Lister les sessions futures avec des statuts incorrects (s'il y en a)
SELECT 'Sessions futures avec statuts incorrects:' as info;
SELECT 
    id,
    subject,
    status,
    started_at,
    'DEVRAIT ÊTRE SCHEDULED, PENDING OU IN_PROGRESS' as expected_status
FROM sessions
WHERE started_at >= NOW()
AND status IN ('COMPLETED', 'CANCELLED')
ORDER BY started_at ASC;

-- 5. Résumé global
SELECT 'Résumé global:' as info;
SELECT 
    'Sessions passées' as category,
    COUNT(*) as total,
    COUNT(CASE WHEN status IN ('COMPLETED', 'CANCELLED') THEN 1 END) as correct,
    COUNT(CASE WHEN status IN ('SCHEDULED', 'IN_PROGRESS', 'PENDING') THEN 1 END) as incorrect
FROM sessions
WHERE started_at < NOW()

UNION ALL

SELECT 
    'Sessions futures' as category,
    COUNT(*) as total,
    COUNT(CASE WHEN status IN ('SCHEDULED', 'PENDING', 'IN_PROGRESS') THEN 1 END) as correct,
    COUNT(CASE WHEN status IN ('COMPLETED', 'CANCELLED') THEN 1 END) as incorrect
FROM sessions
WHERE started_at >= NOW();
