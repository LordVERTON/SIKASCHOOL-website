-- Script de test pour le système de messages avec toutes les conversations
-- Ce script crée des conversations entre tous les tuteurs et leurs étudiants assignés

-- Supprimer les données de test précédentes si elles existent
DELETE FROM notifications WHERE data->>'thread_id' IN (SELECT id::text FROM message_threads WHERE subject LIKE 'Test Message%');
DELETE FROM messages WHERE thread_id IN (SELECT id FROM message_threads WHERE subject LIKE 'Test Message%');
DELETE FROM message_threads WHERE subject LIKE 'Test Message%';

-- Vérifier les assignations existantes
SELECT 'Assignations tuteur-étudiant existantes:' as info;
SELECT 
    tsa.id,
    t.first_name as tutor_name,
    t.last_name as tutor_last_name,
    s.first_name as student_name,
    s.last_name as student_last_name,
    tsa.assigned_at,
    tsa.is_active
FROM tutor_student_assignments tsa
JOIN users t ON tsa.tutor_id = t.id
JOIN users s ON tsa.student_id = s.id
WHERE tsa.is_active = true
ORDER BY tsa.assigned_at;

-- Créer des threads de messages pour chaque assignation active
-- On crée d'abord une table temporaire pour les assignations
CREATE TEMP TABLE temp_assignments AS
SELECT 
    tsa.id as assignment_id,
    tsa.tutor_id,
    tsa.student_id,
    t.first_name as tutor_name,
    s.first_name as student_name,
    ROW_NUMBER() OVER (ORDER BY tsa.assigned_at) as conv_number
FROM tutor_student_assignments tsa
JOIN users t ON tsa.tutor_id = t.id
JOIN users s ON tsa.student_id = s.id
WHERE tsa.is_active = true;

-- Créer une table temporaire pour les sujets
CREATE TEMP TABLE temp_subjects AS
SELECT 'Test Message - Questions sur les mathématiques' as subject, 1 as subject_num
UNION ALL SELECT 'Test Message - Planning des séances', 2
UNION ALL SELECT 'Test Message - Révision pour l''examen', 3
UNION ALL SELECT 'Test Message - Exercices supplémentaires', 4
UNION ALL SELECT 'Test Message - Projet de fin de semestre', 5
UNION ALL SELECT 'Test Message - Disponibilités cette semaine', 6
UNION ALL SELECT 'Test Message - Questions sur la physique', 7
UNION ALL SELECT 'Test Message - Aide aux devoirs', 8
UNION ALL SELECT 'Test Message - Préparation aux concours', 9
UNION ALL SELECT 'Test Message - Suivi des progrès', 10;

-- Insérer les threads de messages
INSERT INTO message_threads (id, subject, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    ts.subject,
    TRUE,
    NOW() - (ta.conv_number * 2 || ' days')::INTERVAL - (ta.conv_number * 30 || ' minutes')::INTERVAL,
    NOW() - (ta.conv_number * 2 || ' days')::INTERVAL - (ta.conv_number * 30 || ' minutes')::INTERVAL
FROM temp_assignments ta
CROSS JOIN temp_subjects ts
WHERE ts.subject_num = ((ta.conv_number - 1) % 10) + 1;

-- Créer des messages pour chaque conversation
-- Messages initiaux des étudiants
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
SELECT 
    mt.id,
    ta.student_id,
    CASE 
        WHEN mt.subject LIKE '%mathématiques%' THEN 'Bonjour, j''ai des difficultés avec les équations du second degré. Pourriez-vous m''expliquer la méthode de résolution ?'
        WHEN mt.subject LIKE '%Planning%' THEN 'Bonjour, j''aimerais planifier nos prochaines séances. Quels sont vos créneaux disponibles ?'
        WHEN mt.subject LIKE '%examen%' THEN 'Bonjour, j''ai un examen important la semaine prochaine. Pourriez-vous m''aider à réviser ?'
        WHEN mt.subject LIKE '%Exercices%' THEN 'Bonjour, j''aimerais avoir des exercices supplémentaires pour m''entraîner. Avez-vous des recommandations ?'
        WHEN mt.subject LIKE '%Projet%' THEN 'Bonjour, j''ai un projet de fin de semestre à rendre. Pourriez-vous me donner des conseils ?'
        WHEN mt.subject LIKE '%Disponibilités%' THEN 'Bonjour, quelles sont vos disponibilités cette semaine pour nos séances ?'
        WHEN mt.subject LIKE '%physique%' THEN 'Bonjour, j''ai du mal avec les lois de Newton. Pourriez-vous m''expliquer avec des exemples ?'
        WHEN mt.subject LIKE '%devoirs%' THEN 'Bonjour, j''ai des difficultés avec mes devoirs de chimie. Pourriez-vous m''aider ?'
        WHEN mt.subject LIKE '%concours%' THEN 'Bonjour, je prépare un concours important. Avez-vous des conseils pour la préparation ?'
        WHEN mt.subject LIKE '%progrès%' THEN 'Bonjour, j''aimerais faire le point sur mes progrès. Comment évaluez-vous mon niveau actuel ?'
        ELSE 'Bonjour, j''ai une question importante à vous poser. Pourriez-vous m''aider ?'
    END,
    FALSE,
    mt.created_at
FROM message_threads mt
JOIN temp_assignments ta ON TRUE
WHERE mt.subject LIKE 'Test Message%'
AND NOT EXISTS (
    SELECT 1 FROM messages m 
    WHERE m.thread_id = mt.id 
    AND m.sender_id = ta.student_id
);

-- Réponses des tuteurs
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
SELECT 
    mt.id,
    ta.tutor_id,
    CASE 
        WHEN mt.subject LIKE '%mathématiques%' THEN 'Bonjour ! Bien sûr, je vais vous expliquer les équations du second degré. La méthode générale est ax² + bx + c = 0. Voulez-vous que je vous montre avec un exemple concret ?'
        WHEN mt.subject LIKE '%Planning%' THEN 'Bonjour ! Je suis disponible mardi et jeudi de 16h à 18h, et mercredi de 14h à 16h. Quel créneau vous convient le mieux ?'
        WHEN mt.subject LIKE '%examen%' THEN 'Bonjour ! Bien sûr, je vais vous aider à réviser. Quels sont les chapitres qui vous posent le plus de difficultés ?'
        WHEN mt.subject LIKE '%Exercices%' THEN 'Bonjour ! Excellente initiative ! Je vais vous préparer une série d''exercices adaptés à votre niveau. Commençons par les bases.'
        WHEN mt.subject LIKE '%Projet%' THEN 'Bonjour ! Je serais ravi de vous aider avec votre projet. Pouvez-vous me donner plus de détails sur le sujet et les exigences ?'
        WHEN mt.subject LIKE '%Disponibilités%' THEN 'Bonjour ! Cette semaine, je suis disponible mardi de 15h à 17h et jeudi de 14h à 16h. Cela vous convient-il ?'
        WHEN mt.subject LIKE '%physique%' THEN 'Bonjour ! Les lois de Newton sont fondamentales. Je vais vous expliquer avec des exemples de la vie quotidienne pour que ce soit plus clair.'
        WHEN mt.subject LIKE '%devoirs%' THEN 'Bonjour ! Bien sûr, je vais vous aider avec vos devoirs de chimie. Quels sont les exercices qui vous posent problème ?'
        WHEN mt.subject LIKE '%concours%' THEN 'Bonjour ! La préparation aux concours nécessite une stratégie spécifique. Je vais vous donner un plan de révision adapté.'
        WHEN mt.subject LIKE '%progrès%' THEN 'Bonjour ! C''est une excellente question. Je vais faire un bilan de vos progrès et vous donner des conseils pour continuer à progresser.'
        ELSE 'Bonjour ! Bien sûr, je suis là pour vous aider. Pouvez-vous me donner plus de détails sur votre question ?'
    END,
    TRUE,
    mt.created_at + INTERVAL '30 minutes'
FROM message_threads mt
JOIN temp_assignments ta ON TRUE
WHERE mt.subject LIKE 'Test Message%'
AND NOT EXISTS (
    SELECT 1 FROM messages m 
    WHERE m.thread_id = mt.id 
    AND m.sender_id = ta.tutor_id
);

-- Messages de suivi des étudiants
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
SELECT 
    mt.id,
    ta.student_id,
    CASE 
        WHEN mt.subject LIKE '%mathématiques%' THEN 'Merci beaucoup ! C''est beaucoup plus clair maintenant. Est-ce que vous pourriez me donner un exercice pour m''entraîner ?'
        WHEN mt.subject LIKE '%Planning%' THEN 'Parfait ! Mercredi à 14h me convient très bien. Et pour la semaine prochaine, auriez-vous des disponibilités ?'
        WHEN mt.subject LIKE '%examen%' THEN 'Merci ! Les chapitres sur les dérivées et les intégrales me posent le plus de difficultés. Pouvez-vous m''aider ?'
        WHEN mt.subject LIKE '%Exercices%' THEN 'Parfait ! J''ai hâte de commencer. Combien d''exercices me conseillez-vous de faire par jour ?'
        WHEN mt.subject LIKE '%Projet%' THEN 'Merci ! C''est un projet sur l''histoire de l''art. Je dois analyser trois œuvres et faire une présentation de 15 minutes.'
        WHEN mt.subject LIKE '%Disponibilités%' THEN 'Excellent ! Jeudi à 14h me convient parfaitement. Dois-je préparer quelque chose de particulier ?'
        WHEN mt.subject LIKE '%physique%' THEN 'Merci ! Les exemples de la vie quotidienne m''aident beaucoup. Avez-vous d''autres exemples ?'
        WHEN mt.subject LIKE '%devoirs%' THEN 'Merci ! Ce sont les exercices sur les réactions chimiques qui me posent problème. Pouvez-vous m''expliquer ?'
        WHEN mt.subject LIKE '%concours%' THEN 'Merci ! J''ai vraiment besoin d''un plan structuré. Le concours est dans 3 mois.'
        WHEN mt.subject LIKE '%progrès%' THEN 'Merci ! J''aimerais vraiment savoir où j''en suis et comment continuer à progresser.'
        ELSE 'Merci beaucoup ! Votre aide me sera très précieuse.'
    END,
    FALSE,
    mt.created_at + INTERVAL '1 hour'
FROM message_threads mt
JOIN temp_assignments ta ON TRUE
WHERE mt.subject LIKE 'Test Message%'
AND NOT EXISTS (
    SELECT 1 FROM messages m 
    WHERE m.thread_id = mt.id 
    AND m.sender_id = ta.student_id
    AND m.created_at > mt.created_at + INTERVAL '30 minutes'
);

-- Réponses finales des tuteurs
INSERT INTO messages (thread_id, sender_id, content, is_read, created_at)
SELECT 
    mt.id,
    ta.tutor_id,
    CASE 
        WHEN mt.subject LIKE '%mathématiques%' THEN 'Parfait ! Voici un exercice : résolvez 2x² - 5x + 3 = 0. Prenez votre temps et n''hésitez pas à me poser des questions !'
        WHEN mt.subject LIKE '%Planning%' THEN 'Parfait ! Je confirme mercredi à 14h. Pour la semaine prochaine, j''ai les mêmes créneaux disponibles. Voulez-vous réserver ?'
        WHEN mt.subject LIKE '%examen%' THEN 'Parfait ! Je vais vous préparer un plan de révision spécifique pour les dérivées et intégrales. Commençons par les bases.'
        WHEN mt.subject LIKE '%Exercices%' THEN 'Je recommande 3-4 exercices par jour pour commencer. L''important est la régularité plutôt que la quantité.'
        WHEN mt.subject LIKE '%Projet%' THEN 'Excellent sujet ! Je vais vous aider à structurer votre analyse et votre présentation. Commençons par choisir les œuvres.'
        WHEN mt.subject LIKE '%Disponibilités%' THEN 'Parfait ! Pour jeudi, préparez vos questions sur le chapitre que nous avons vu la semaine dernière.'
        WHEN mt.subject LIKE '%physique%' THEN 'Bien sûr ! Par exemple, quand vous freinez en voiture, c''est la première loi de Newton en action. Voulez-vous d''autres exemples ?'
        WHEN mt.subject LIKE '%devoirs%' THEN 'Parfait ! Les réactions chimiques suivent des règles précises. Je vais vous expliquer avec des exemples simples.'
        WHEN mt.subject LIKE '%concours%' THEN 'Parfait ! 3 mois, c''est un bon délai. Je vais vous préparer un planning de révision intensif et adapté.'
        WHEN mt.subject LIKE '%progrès%' THEN 'Parfait ! Je vais faire un bilan complet de vos progrès et vous donner des objectifs pour la suite.'
        ELSE 'Parfait ! Je suis là pour vous accompagner. N''hésitez pas à me poser toutes vos questions !'
    END,
    FALSE,
    mt.created_at + INTERVAL '2 hours'
FROM message_threads mt
JOIN temp_assignments ta ON TRUE
WHERE mt.subject LIKE 'Test Message%'
AND NOT EXISTS (
    SELECT 1 FROM messages m 
    WHERE m.thread_id = mt.id 
    AND m.sender_id = ta.tutor_id
    AND m.created_at > mt.created_at + INTERVAL '1 hour'
);

-- Vérifier les données créées
SELECT 'Résumé des conversations créées:' as info;
SELECT 
    COUNT(DISTINCT mt.id) as total_threads,
    COUNT(m.id) as total_messages,
    COUNT(DISTINCT m.sender_id) as unique_senders
FROM message_threads mt
LEFT JOIN messages m ON mt.id = m.thread_id
WHERE mt.subject LIKE 'Test Message%';

SELECT 'Threads de messages créés par assignation:' as info;
SELECT 
    ta.assignment_id,
    ta.tutor_name,
    ta.student_name,
    COUNT(mt.id) as thread_count,
    COUNT(m.id) as message_count
FROM temp_assignments ta
LEFT JOIN message_threads mt ON TRUE
LEFT JOIN messages m ON mt.id = m.thread_id
WHERE mt.subject LIKE 'Test Message%'
GROUP BY ta.assignment_id, ta.tutor_name, ta.student_name
ORDER BY thread_count DESC;

SELECT 'Derniers messages créés:' as info;
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
ORDER BY m.created_at DESC
LIMIT 10;

-- Nettoyer les tables temporaires
DROP TABLE IF EXISTS temp_assignments;
DROP TABLE IF EXISTS temp_subjects;
