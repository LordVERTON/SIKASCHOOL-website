-- Test de l'ordre chronologique dans les popups du calendrier
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer des sessions de test pour un même jour avec différents horaires
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
-- Sessions pour aujourd'hui avec différents horaires (ordre aléatoire d'insertion)
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Mathématiques - 20h00',
    'Lycée',
    'NOTA',
    'SCHEDULED',
    CURRENT_DATE + INTERVAL '20 hours',
    60
),
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Physique - 10h30',
    'Lycée',
    'NOTA',
    'PENDING',
    CURRENT_DATE + INTERVAL '10 hours 30 minutes',
    60
),
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Chimie - 14h15',
    'Lycée',
    'NOTA',
    'SCHEDULED',
    CURRENT_DATE + INTERVAL '14 hours 15 minutes',
    60
),
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Biologie - 09h00',
    'Lycée',
    'NOTA',
    'IN_PROGRESS',
    CURRENT_DATE + INTERVAL '9 hours',
    60
),
(
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Histoire - 16h45',
    'Lycée',
    'NOTA',
    'SCHEDULED',
    CURRENT_DATE + INTERVAL '16 hours 45 minutes',
    60
)
RETURNING id, subject, status, started_at;

-- 2. Vérifier l'ordre chronologique des sessions pour aujourd'hui
SELECT 'Sessions d\'aujourd\'hui dans l\'ordre chronologique:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::time as session_time,
    ROW_NUMBER() OVER (ORDER BY s.started_at ASC) as chronological_order,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at::date = CURRENT_DATE
ORDER BY s.started_at ASC; -- Ordre chronologique (plus tôt en premier)

-- 3. Simuler la logique du popup du calendrier (tri chronologique)
SELECT 'Sessions du popup calendrier (triées chronologiquement):' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::time as session_time,
    ROW_NUMBER() OVER (ORDER BY s.started_at ASC) as popup_order,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at::date = CURRENT_DATE
ORDER BY s.started_at ASC;

-- 4. Vérifier l'ordre dans les cellules du calendrier (2 premières sessions)
SELECT '2 premières sessions dans les cellules du calendrier:' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::time as session_time,
    ROW_NUMBER() OVER (ORDER BY s.started_at ASC) as cell_order,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at::date = CURRENT_DATE
ORDER BY s.started_at ASC
LIMIT 2;

-- 5. Vérifier l'ordre dans la liste mobile
SELECT 'Sessions dans la liste mobile (triées chronologiquement):' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    s.started_at::time as session_time,
    ROW_NUMBER() OVER (ORDER BY s.started_at ASC) as mobile_order,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.started_at::date = CURRENT_DATE
ORDER BY s.started_at ASC;

-- 6. Vérifier l'ordre attendu (doit être : 09h00, 10h30, 14h15, 16h45, 20h00)
SELECT 'Ordre attendu des sessions:' as info;
SELECT 
    '09h00 - Biologie (IN_PROGRESS)' as expected_1,
    '10h30 - Physique (PENDING)' as expected_2,
    '14h15 - Chimie (SCHEDULED)' as expected_3,
    '16h45 - Histoire (SCHEDULED)' as expected_4,
    '20h00 - Mathématiques (SCHEDULED)' as expected_5;

-- 7. Nettoyer les sessions de test (optionnel)
-- DELETE FROM sessions WHERE subject LIKE '% - %' AND subject LIKE '%h%';
