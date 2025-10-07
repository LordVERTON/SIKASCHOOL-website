-- Script de test pour le système de messages entre étudiants et tuteurs
-- Ce script crée des utilisateurs de test, des assignations, et des conversations

-- Supprimer les données de test précédentes si elles existent
DELETE FROM notifications WHERE data->>'thread_id' IN (SELECT id::text FROM message_threads WHERE subject LIKE 'Test Message%');
DELETE FROM messages WHERE thread_id IN (SELECT id FROM message_threads WHERE subject LIKE 'Test Message%');
DELETE FROM message_threads WHERE subject LIKE 'Test Message%';
DELETE FROM tutor_student_assignments WHERE student_id IN (SELECT id FROM users WHERE email LIKE 'test.student.message%');
DELETE FROM users WHERE email LIKE 'test.student.message%';
DELETE FROM users WHERE email LIKE 'test.tutor.message%';

-- Créer des tuteurs de test
INSERT INTO users (id, email, password_hash, first_name, last_name, role, avatar_url)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'test.tutor.message1@example.com', '$2a$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'Jean', 'Dupont', 'TUTOR', '/images/user/user-01.png'),
    ('22222222-2222-2222-2222-222222222222', 'test.tutor.message2@example.com', '$2a$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'Marie', 'Martin', 'TUTOR', '/images/user/user-02.png'),
    ('33333333-3333-3333-3333-333333333333', 'test.tutor.message3@example.com', '$2a$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'Pierre', 'Leroy', 'TUTOR', '/images/user/user-03.png');

-- Créer des étudiants de test
INSERT INTO users (id, email, password_hash, first_name, last_name, role, avatar_url)
VALUES
    ('44444444-4444-4444-4444-444444444444', 'test.student.message1@example.com', '$2a$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'Alice', 'Durand', 'STUDENT', '/images/user/user-04.png'),
    ('55555555-5555-5555-5555-555555555555', 'test.student.message2@example.com', '$2a$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'Bob', 'Moreau', 'STUDENT', '/images/user/user-05.png'),
    ('66666666-6666-6666-6666-666666666666', 'test.student.message3@example.com', '$2a$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'Claire', 'Petit', 'STUDENT', '/images/user/user-06.png');

-- Assigner les étudiants aux tuteurs
INSERT INTO tutor_student_assignments (tutor_id, student_id, is_active, assigned_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', TRUE, NOW() - INTERVAL '7 days'),
    ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', TRUE, NOW() - INTERVAL '5 days'),
    ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', TRUE, NOW() - INTERVAL '3 days'),
    ('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', TRUE, NOW() - INTERVAL '2 days'),
    ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', TRUE, NOW() - INTERVAL '1 day'),
    ('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', TRUE, NOW() - INTERVAL '6 hours');

-- Créer des threads de messages de test
INSERT INTO message_threads (id, subject, student_id, tutor_id, is_active, created_at, updated_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test Message - Question sur les dérivées', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test Message - Planning des séances', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 minutes'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Test Message - Correction du devoir', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', TRUE, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Test Message - Problème de physique', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '15 minutes'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Test Message - Aide en français', '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', TRUE, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '5 minutes'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Test Message - Révision pour l''examen', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', TRUE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 minute');

-- Créer des messages de test avec des échanges réalistes
-- Thread 1: Question sur les dérivées (Alice - Jean Dupont)
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Bonjour M. Dupont, j''ai du mal à comprendre la notion de dérivée. Pourriez-vous m''expliquer avec un exemple concret ?', FALSE, NOW() - INTERVAL '2 days'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Bonjour Alice ! Bien sûr, je vais vous expliquer avec un exemple simple. Prenons la fonction f(x) = x². Sa dérivée f''(x) = 2x nous donne le coefficient directeur de la tangente en chaque point.', TRUE, NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Par exemple, en x = 3, f''(3) = 6, ce qui signifie que la tangente a un coefficient directeur de 6. Est-ce que cela vous aide à comprendre ?', TRUE, NOW() - INTERVAL '2 days' + INTERVAL '35 minutes'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Merci beaucoup ! C''est beaucoup plus clair maintenant. Est-ce que vous pourriez me donner un exercice pour m''entraîner ?', FALSE, NOW() - INTERVAL '1 day'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Parfait ! Voici un exercice : calculez la dérivée de f(x) = 3x² + 2x - 1. Prenez votre temps et n''hésitez pas à me poser des questions !', FALSE, NOW() - INTERVAL '1 hour');

-- Thread 2: Planning des séances (Alice - Marie Martin)
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'Bonjour Mme Martin, j''aimerais planifier nos prochaines séances de physique. Quels sont vos créneaux disponibles cette semaine ?', FALSE, NOW() - INTERVAL '1 day'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Bonjour Alice ! Je suis disponible mardi et jeudi de 16h à 18h, et mercredi de 14h à 16h. Quel créneau vous convient le mieux ?', TRUE, NOW() - INTERVAL '1 day' + INTERVAL '1 hour'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'Mercredi à 14h me convient parfaitement ! Et pour la semaine prochaine, auriez-vous des disponibilités ?', FALSE, NOW() - INTERVAL '30 minutes'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Parfait, je confirme mercredi à 14h. Pour la semaine prochaine, j''ai les mêmes créneaux disponibles. Voulez-vous réserver le même jour ?', FALSE, NOW() - INTERVAL '15 minutes');

-- Thread 3: Correction du devoir (Bob - Jean Dupont)
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'M. Dupont, j''ai rendu mon devoir de maths hier. Pourriez-vous me dire quand vous l''aurez corrigé ?', FALSE, NOW() - INTERVAL '3 days'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Bonjour Bob ! J''ai bien reçu votre devoir. Je vais le corriger d''ici demain et vous enverrai les corrections par message.', TRUE, NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Voici les corrections de votre devoir. Vous avez bien compris la plupart des concepts, mais attention aux erreurs de calcul dans l''exercice 3. Voulez-vous qu''on revoie ensemble ?', TRUE, NOW() - INTERVAL '2 days'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'Merci pour les corrections ! Oui, j''aimerais bien qu''on revoie l''exercice 3 ensemble. Quand seriez-vous disponible ?', FALSE, NOW() - INTERVAL '2 hours');

-- Thread 4: Problème de physique (Bob - Pierre Leroy)
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'Bonjour M. Leroy, j''ai un problème avec l''exercice de mécanique que vous m''avez donné. Je n''arrive pas à calculer la vitesse finale.', FALSE, NOW() - INTERVAL '1 day'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Bonjour Bob ! Pas de problème, c''est un exercice classique. Pouvez-vous me dire quelle formule vous utilisez et où vous bloquez exactement ?', TRUE, NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'J''utilise v = v₀ + at, mais je ne trouve pas la bonne valeur. J''ai v₀ = 0, a = 9.8, et t = 2s, donc v = 19.6 m/s, mais ce n''est pas la bonne réponse.', FALSE, NOW() - INTERVAL '15 minutes'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Ah je vois le problème ! Vous avez oublié de prendre en compte la direction. Dans cet exercice, l''accélération est vers le bas, donc elle est négative. Essayez avec a = -9.8 m/s².', FALSE, NOW() - INTERVAL '5 minutes');

-- Thread 5: Aide en français (Claire - Marie Martin)
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '66666666-6666-6666-6666-666666666666', 'Bonjour Mme Martin, j''ai besoin d''aide pour mon commentaire de texte. Je ne sais pas comment structurer mon introduction.', FALSE, NOW() - INTERVAL '4 hours'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Bonjour Claire ! Pour une bonne introduction de commentaire, il faut : 1) Situer le texte, 2) Présenter l''auteur, 3) Annoncer votre problématique. Voulez-vous qu''on travaille ensemble ?', TRUE, NOW() - INTERVAL '4 hours' + INTERVAL '1 hour'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '66666666-6666-6666-6666-666666666666', 'Oui, j''aimerais beaucoup ! J''ai commencé à rédiger, mais je ne suis pas sûre de ma problématique. Pouvez-vous m''aider à la reformuler ?', FALSE, NOW() - INTERVAL '5 minutes'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Bien sûr ! Envoyez-moi votre problématique actuelle et je vous aiderai à l''améliorer. N''oubliez pas qu''elle doit être claire et précise.', FALSE, NOW() - INTERVAL '1 minute');

-- Thread 6: Révision pour l'examen (Claire - Pierre Leroy)
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', 'Bonjour M. Leroy, j''ai mon examen de sciences demain et je suis un peu stressée. Avez-vous des conseils pour bien réviser ?', FALSE, NOW() - INTERVAL '2 hours'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'Bonjour Claire ! Pas de panique, vous êtes bien préparée. Mes conseils : 1) Relisez vos fiches, 2) Faites des exercices pratiques, 3) Dormez bien cette nuit. Vous avez des questions précises ?', TRUE, NOW() - INTERVAL '2 hours' + INTERVAL '30 minutes'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', 'Merci pour les conseils ! J''ai une question sur la photosynthèse : je ne comprends pas bien la différence entre les réactions lumineuses et sombres.', FALSE, NOW() - INTERVAL '1 minute'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'Excellente question ! Les réactions lumineuses ont besoin de lumière et produisent ATP et NADPH. Les réactions sombres (cycle de Calvin) utilisent ces produits pour fixer le CO₂. C''est plus clair ?', FALSE, NOW() - INTERVAL '30 seconds');

-- Vérifier les données créées
SELECT 'Threads de messages créés:' as info;
SELECT 
    mt.id,
    mt.subject,
    CONCAT(s.first_name, ' ', s.last_name) as student,
    CONCAT(t.first_name, ' ', t.last_name) as tutor,
    mt.created_at,
    COUNT(m.id) as message_count
FROM message_threads mt
JOIN users s ON mt.student_id = s.id
JOIN users t ON mt.tutor_id = t.id
LEFT JOIN messages m ON mt.id = m.thread_id
WHERE mt.subject LIKE 'Test Message%'
GROUP BY mt.id, mt.subject, s.first_name, s.last_name, t.first_name, t.last_name, mt.created_at
ORDER BY mt.created_at DESC;

SELECT 'Messages non lus par étudiant:' as info;
SELECT 
    CONCAT(s.first_name, ' ', s.last_name) as student,
    CONCAT(t.first_name, ' ', t.last_name) as tutor,
    mt.subject,
    COUNT(m.id) as unread_count
FROM message_threads mt
JOIN users s ON mt.student_id = s.id
JOIN users t ON mt.tutor_id = t.id
LEFT JOIN messages m ON mt.id = m.thread_id AND m.is_read = FALSE AND m.sender_id != s.id
WHERE mt.subject LIKE 'Test Message%'
GROUP BY s.first_name, s.last_name, t.first_name, t.last_name, mt.subject
ORDER BY unread_count DESC;
