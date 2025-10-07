-- Script de test pour le système de messages avec adaptation automatique
-- Ce script s'adapte à la structure réelle de la base de données

-- Supprimer les données de test précédentes si elles existent
DELETE FROM notifications WHERE data->>'thread_id' IN (SELECT id::text FROM message_threads WHERE subject LIKE 'Test Message%');
DELETE FROM messages WHERE thread_id IN (SELECT id FROM message_threads WHERE subject LIKE 'Test Message%');
DELETE FROM message_threads WHERE subject LIKE 'Test Message%';

-- Vérifier la structure de la table message_threads
SELECT 'Structure de la table message_threads:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'message_threads' 
ORDER BY ordinal_position;

-- Vérifier les utilisateurs existants
SELECT 'Utilisateurs existants dans la base:' as info;
SELECT id, email, first_name, last_name, role 
FROM users 
WHERE role IN ('TUTOR', 'STUDENT') 
ORDER BY role, created_at 
LIMIT 10;

-- Créer des threads de messages de test
-- On utilise seulement les colonnes qui existent réellement
INSERT INTO message_threads (id, subject, is_active, created_at, updated_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test Message - Question sur les dérivées', TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test Message - Planning des séances', TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 minutes'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Test Message - Révision pour l''examen', TRUE, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '15 minutes');

-- Créer des messages de test
-- Thread 1: Question sur les dérivées
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
     (SELECT id FROM users WHERE role = 'STUDENT' ORDER BY created_at LIMIT 1), 
     'Bonjour, j''ai du mal à comprendre la notion de dérivée. Pourriez-vous m''expliquer avec un exemple concret ?', 
     FALSE, NOW() - INTERVAL '2 days'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
     (SELECT id FROM users WHERE role = 'TUTOR' ORDER BY created_at LIMIT 1), 
     'Bonjour ! Bien sûr, je vais vous expliquer avec un exemple simple. Prenons la fonction f(x) = x². Sa dérivée f''(x) = 2x nous donne le coefficient directeur de la tangente en chaque point.', 
     TRUE, NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
     (SELECT id FROM users WHERE role = 'TUTOR' ORDER BY created_at LIMIT 1), 
     'Par exemple, en x = 3, f''(3) = 6, ce qui signifie que la tangente a un coefficient directeur de 6. Est-ce que cela vous aide à comprendre ?', 
     TRUE, NOW() - INTERVAL '2 days' + INTERVAL '35 minutes'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
     (SELECT id FROM users WHERE role = 'STUDENT' ORDER BY created_at LIMIT 1), 
     'Merci beaucoup ! C''est beaucoup plus clair maintenant. Est-ce que vous pourriez me donner un exercice pour m''entraîner ?', 
     FALSE, NOW() - INTERVAL '1 day'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
     (SELECT id FROM users WHERE role = 'TUTOR' ORDER BY created_at LIMIT 1), 
     'Parfait ! Voici un exercice : calculez la dérivée de f(x) = 3x² + 2x - 1. Prenez votre temps et n''hésitez pas à me poser des questions !', 
     FALSE, NOW() - INTERVAL '1 hour');

-- Thread 2: Planning des séances
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
     (SELECT id FROM users WHERE role = 'STUDENT' ORDER BY created_at LIMIT 1 OFFSET 1), 
     'Bonjour, j''aimerais planifier nos prochaines séances. Quels sont vos créneaux disponibles cette semaine ?', 
     FALSE, NOW() - INTERVAL '1 day'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
     (SELECT id FROM users WHERE role = 'TUTOR' ORDER BY created_at LIMIT 1 OFFSET 1), 
     'Bonjour ! Je suis disponible mardi et jeudi de 16h à 18h, et mercredi de 14h à 16h. Quel créneau vous convient le mieux ?', 
     TRUE, NOW() - INTERVAL '1 day' + INTERVAL '1 hour'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
     (SELECT id FROM users WHERE role = 'STUDENT' ORDER BY created_at LIMIT 1 OFFSET 1), 
     'Mercredi à 14h me convient parfaitement ! Et pour la semaine prochaine, auriez-vous des disponibilités ?', 
     FALSE, NOW() - INTERVAL '30 minutes'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
     (SELECT id FROM users WHERE role = 'TUTOR' ORDER BY created_at LIMIT 1 OFFSET 1), 
     'Parfait, je confirme mercredi à 14h. Pour la semaine prochaine, j''ai les mêmes créneaux disponibles. Voulez-vous réserver le même jour ?', 
     FALSE, NOW() - INTERVAL '15 minutes');

-- Thread 3: Révision pour l'examen
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 
     (SELECT id FROM users WHERE role = 'STUDENT' ORDER BY created_at LIMIT 1 OFFSET 2), 
     'Bonjour, j''ai un examen de mathématiques la semaine prochaine. Pourriez-vous m''aider à réviser les fonctions trigonométriques ?', 
     FALSE, NOW() - INTERVAL '3 hours'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 
     (SELECT id FROM users WHERE role = 'TUTOR' ORDER BY created_at LIMIT 1 OFFSET 2), 
     'Bien sûr ! Les fonctions trigonométriques sont essentielles. Commençons par les bases : sin(x), cos(x), et tan(x). Avez-vous des questions spécifiques ?', 
     TRUE, NOW() - INTERVAL '3 hours' + INTERVAL '20 minutes'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 
     (SELECT id FROM users WHERE role = 'STUDENT' ORDER BY created_at LIMIT 1 OFFSET 2), 
     'Je comprends les définitions, mais j''ai du mal avec les dérivées des fonctions trigonométriques. Pouvez-vous m''expliquer ?', 
     FALSE, NOW() - INTERVAL '2 hours'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 
     (SELECT id FROM users WHERE role = 'TUTOR' ORDER BY created_at LIMIT 1 OFFSET 2), 
     'Excellente question ! Les dérivées des fonctions trigonométriques sont : d/dx[sin(x)] = cos(x), d/dx[cos(x)] = -sin(x), et d/dx[tan(x)] = sec²(x). Voulez-vous que je vous montre des exemples ?', 
     FALSE, NOW() - INTERVAL '1 hour');

-- Vérifier les données créées
SELECT 'Threads de messages créés:' as info;
SELECT 
    mt.id,
    mt.subject,
    mt.created_at,
    COUNT(m.id) as message_count
FROM message_threads mt
LEFT JOIN messages m ON mt.id = m.thread_id
WHERE mt.subject LIKE 'Test Message%'
GROUP BY mt.id, mt.subject, mt.created_at
ORDER BY mt.created_at DESC;

SELECT 'Messages créés:' as info;
SELECT 
    m.id,
    m.content,
    u.first_name,
    u.last_name,
    u.role,
    m.created_at
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE m.thread_id IN (
    SELECT id FROM message_threads WHERE subject LIKE 'Test Message%'
)
ORDER BY m.created_at;
