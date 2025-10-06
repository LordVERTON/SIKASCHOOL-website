-- Test de la restriction des 24h pour l'annulation
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer des sessions de test avec différents délais
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
-- Session dans 2 jours (peut être annulée)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test 48h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '2 days',
    60
),
-- Session dans 12 heures (ne peut pas être annulée)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test 12h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '12 hours',
    60
),
-- Session dans 6 heures (ne peut pas être annulée)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test 6h - ' || NOW()::text,
    'Lycée',
    'NOTA',
    'SCHEDULED',
    NOW() + INTERVAL '6 hours',
    60
)
RETURNING id, subject, status, started_at;

-- 2. Vérifier les sessions créées avec calcul du temps restant
SELECT 'Sessions de test créées:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    EXTRACT(EPOCH FROM (s.started_at - NOW())) / 3600 as hours_until_start,
    CASE 
        WHEN EXTRACT(EPOCH FROM (s.started_at - NOW())) / 3600 >= 24 THEN 'Peut être annulée'
        ELSE 'Ne peut pas être annulée (< 24h)'
    END as cancellation_status,
    u1.first_name || ' ' || u1.last_name as student_name,
    u2.first_name || ' ' || u2.last_name as tutor_name
FROM sessions s
LEFT JOIN users u1 ON s.student_id = u1.id
LEFT JOIN users u2 ON s.tutor_id = u2.id
WHERE s.subject LIKE 'Test %h%'
ORDER BY s.started_at ASC;

-- 3. Nettoyer les sessions de test (optionnel)
-- DELETE FROM sessions WHERE subject LIKE 'Test %h%';
