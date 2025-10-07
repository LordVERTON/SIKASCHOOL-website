-- Script pour nettoyer les threads de messages et s'assurer qu'ils respectent la règle 1:1 (1 tuteur + 1 étudiant)

-- 1. Désactiver tous les threads existants qui ne respectent pas la règle 1:1
UPDATE message_threads 
SET is_active = false 
WHERE id IN (
    SELECT thread_id 
    FROM (
        SELECT 
            thread_id,
            COUNT(DISTINCT sender_id) as participant_count,
            COUNT(DISTINCT CASE WHEN u.role = 'TUTOR' THEN sender_id END) as tutor_count,
            COUNT(DISTINCT CASE WHEN u.role = 'STUDENT' THEN sender_id END) as student_count
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        GROUP BY thread_id
        HAVING 
            participant_count != 2 
            OR tutor_count != 1 
            OR student_count != 1
    ) invalid_threads
);

-- 2. Créer des threads 1:1 pour chaque assignation tuteur-étudiant active
INSERT INTO message_threads (id, subject, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Conversation avec ' || u.first_name || ' ' || u.last_name,
    TRUE,
    NOW() - (random() * 30 || ' days')::INTERVAL,
    NOW() - (random() * 7 || ' days')::INTERVAL
FROM tutor_student_assignments tsa
JOIN users u ON tsa.student_id = u.id
WHERE tsa.is_active = true
AND NOT EXISTS (
    -- Vérifier qu'il n'existe pas déjà un thread actif entre ce tuteur et cet étudiant
    SELECT 1 FROM message_threads mt
    WHERE mt.is_active = true
    AND EXISTS (
        SELECT 1 FROM messages m1 
        WHERE m1.thread_id = mt.id 
        AND m1.sender_id = tsa.tutor_id
    )
    AND EXISTS (
        SELECT 1 FROM messages m2 
        WHERE m2.thread_id = mt.id 
        AND m2.sender_id = tsa.student_id
    )
);

-- 3. Créer des messages d'exemple pour chaque nouveau thread
WITH new_threads AS (
    SELECT 
        mt.id as thread_id,
        tsa.tutor_id,
        tsa.student_id,
        u.first_name as student_name
    FROM message_threads mt
    JOIN tutor_student_assignments tsa ON TRUE
    JOIN users u ON tsa.student_id = u.id
    WHERE mt.is_active = true
    AND mt.created_at > NOW() - INTERVAL '1 hour' -- Threads créés récemment
    AND NOT EXISTS (
        SELECT 1 FROM messages m WHERE m.thread_id = mt.id
    )
)
INSERT INTO messages (id, thread_id, sender_id, content, is_read, created_at)
SELECT 
    gen_random_uuid(),
    nt.thread_id,
    nt.tutor_id,
    'Bonjour ' || nt.student_name || ' ! Comment allez-vous ?',
    FALSE,
    NOW() - (random() * 7 || ' days')::INTERVAL
FROM new_threads nt

UNION ALL

SELECT 
    gen_random_uuid(),
    nt.thread_id,
    nt.student_id,
    'Bonjour ! Je vais bien, merci. J''ai quelques questions sur le cours d''aujourd''hui.',
    FALSE,
    NOW() - (random() * 6 || ' days')::INTERVAL
FROM new_threads nt

UNION ALL

SELECT 
    gen_random_uuid(),
    nt.thread_id,
    nt.tutor_id,
    'Parfait ! N''hésitez pas à me poser toutes vos questions. Je suis là pour vous aider.',
    FALSE,
    NOW() - (random() * 5 || ' days')::INTERVAL
FROM new_threads nt;

-- 4. Créer des notifications pour les nouveaux messages
INSERT INTO notifications (id, user_id, type, title, message, data, created_at)
SELECT 
    gen_random_uuid(),
    nt.student_id,
    'MESSAGE',
    'Nouveau message',
    'Vous avez reçu un nouveau message de votre tuteur',
    jsonb_build_object('thread_id', nt.thread_id),
    NOW() - (random() * 7 || ' days')::INTERVAL
FROM (
    SELECT DISTINCT 
        m.thread_id,
        CASE 
            WHEN m.sender_id = tsa.tutor_id THEN tsa.student_id
            ELSE tsa.tutor_id
        END as student_id
    FROM messages m
    JOIN tutor_student_assignments tsa ON (
        (m.sender_id = tsa.tutor_id AND EXISTS (
            SELECT 1 FROM messages m2 
            WHERE m2.thread_id = m.thread_id 
            AND m2.sender_id = tsa.student_id
        ))
        OR 
        (m.sender_id = tsa.student_id AND EXISTS (
            SELECT 1 FROM messages m2 
            WHERE m2.thread_id = m.thread_id 
            AND m2.sender_id = tsa.tutor_id
        ))
    )
    WHERE m.created_at > NOW() - INTERVAL '1 hour'
) nt;

-- 5. Afficher un résumé des threads créés
SELECT 
    'Threads actifs 1:1 créés' as description,
    COUNT(*) as count
FROM message_threads 
WHERE is_active = true

UNION ALL

SELECT 
    'Messages créés' as description,
    COUNT(*) as count
FROM messages m
JOIN message_threads mt ON m.thread_id = mt.id
WHERE mt.is_active = true
AND m.created_at > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
    'Notifications créées' as description,
    COUNT(*) as count
FROM notifications n
WHERE n.created_at > NOW() - INTERVAL '1 hour'
AND n.type = 'MESSAGE';
