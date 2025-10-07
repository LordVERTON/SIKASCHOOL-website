-- Script de test pour vérifier la cohérence entre le dashboard étudiant et l'agenda étudiant
-- concernant le nombre de séances terminées (COMPLETED)

-- Supprimer les données de test précédentes si elles existent
DELETE FROM notifications WHERE data->>'session_id' IN (SELECT id::text FROM sessions WHERE subject LIKE 'Test Dashboard Consistency%');
DELETE FROM session_participants WHERE session_id IN (SELECT id FROM sessions WHERE subject LIKE 'Test Dashboard Consistency%');
DELETE FROM sessions WHERE subject LIKE 'Test Dashboard Consistency%';
DELETE FROM users WHERE email LIKE 'test.student.dashboard.consistency%';
DELETE FROM users WHERE email LIKE 'test.tutor.dashboard.consistency%';

-- Créer un tuteur de test
INSERT INTO users (id, email, first_name, last_name, role)
VALUES
    ('tutor_dashboard_consistency_id', 'test.tutor.dashboard.consistency@example.com', 'Tutor', 'DashboardConsistency', 'TUTOR');

-- Créer un étudiant de test
INSERT INTO users (id, email, first_name, last_name, role)
VALUES
    ('student_dashboard_consistency_id', 'test.student.dashboard.consistency@example.com', 'Student', 'DashboardConsistency', 'STUDENT');

-- Assigner l'étudiant au tuteur
INSERT INTO tutor_student_assignments (tutor_id, student_id, is_active)
VALUES
    ('tutor_dashboard_consistency_id', 'student_dashboard_consistency_id', TRUE);

-- Insérer des sessions de test avec différents statuts
-- Sessions terminées (COMPLETED) - doivent être comptées dans le dashboard
INSERT INTO sessions (id, student_id, tutor_id, subject, level, session_type, status, started_at, duration_minutes, completed_at, student_rating)
VALUES
    ('session_completed_1', 'student_dashboard_consistency_id', 'tutor_dashboard_consistency_id', 'Test Dashboard Consistency - Mathématiques', 'Lycée', 'INDIVIDUAL', 'COMPLETED', NOW() - INTERVAL '5 days', 60, NOW() - INTERVAL '5 days 1 hour', 5),
    ('session_completed_2', 'student_dashboard_consistency_id', 'tutor_dashboard_consistency_id', 'Test Dashboard Consistency - Physique', 'Lycée', 'INDIVIDUAL', 'COMPLETED', NOW() - INTERVAL '3 days', 90, NOW() - INTERVAL '3 days 1.5 hours', 4),
    ('session_completed_3', 'student_dashboard_consistency_id', 'tutor_dashboard_consistency_id', 'Test Dashboard Consistency - Chimie', 'Lycée', 'INDIVIDUAL', 'COMPLETED', NOW() - INTERVAL '1 day', 60, NOW() - INTERVAL '1 day 1 hour', 5);

-- Sessions programmées (SCHEDULED) - ne doivent PAS être comptées comme terminées
INSERT INTO sessions (id, student_id, tutor_id, subject, level, session_type, status, started_at, duration_minutes)
VALUES
    ('session_scheduled_1', 'student_dashboard_consistency_id', 'tutor_dashboard_consistency_id', 'Test Dashboard Consistency - Biologie', 'Lycée', 'INDIVIDUAL', 'SCHEDULED', NOW() + INTERVAL '2 days', 60),
    ('session_scheduled_2', 'student_dashboard_consistency_id', 'tutor_dashboard_consistency_id', 'Test Dashboard Consistency - Histoire', 'Lycée', 'INDIVIDUAL', 'SCHEDULED', NOW() + INTERVAL '4 days', 45);

-- Sessions en attente (PENDING) - ne doivent PAS être comptées comme terminées
INSERT INTO sessions (id, student_id, tutor_id, subject, level, session_type, status, started_at, duration_minutes)
VALUES
    ('session_pending_1', 'student_dashboard_consistency_id', 'tutor_dashboard_consistency_id', 'Test Dashboard Consistency - Géographie', 'Lycée', 'INDIVIDUAL', 'PENDING', NOW() + INTERVAL '3 days', 60);

-- Sessions annulées (CANCELLED) - ne doivent PAS être comptées comme terminées
INSERT INTO sessions (id, student_id, tutor_id, subject, level, session_type, status, started_at, duration_minutes)
VALUES
    ('session_cancelled_1', 'student_dashboard_consistency_id', 'tutor_dashboard_consistency_id', 'Test Dashboard Consistency - Philosophie', 'Lycée', 'INDIVIDUAL', 'CANCELLED', NOW() - INTERVAL '2 days', 60);

-- Sessions où l'étudiant est participant (via session_participants)
-- Créer une session avec un autre étudiant comme titulaire, mais notre étudiant comme participant
INSERT INTO users (id, email, first_name, last_name, role)
VALUES
    ('other_student_id', 'other.student@example.com', 'Other', 'Student', 'STUDENT');

INSERT INTO sessions (id, student_id, tutor_id, subject, level, session_type, status, started_at, duration_minutes, completed_at, student_rating)
VALUES
    ('session_participant_completed', 'other_student_id', 'tutor_dashboard_consistency_id', 'Test Dashboard Consistency - Session Groupe', 'Lycée', 'GROUP', 'COMPLETED', NOW() - INTERVAL '1 week', 90, NOW() - INTERVAL '1 week 1.5 hours', 4);

-- Ajouter notre étudiant comme participant à cette session
INSERT INTO session_participants (session_id, student_id, joined_at)
VALUES
    ('session_participant_completed', 'student_dashboard_consistency_id', NOW() - INTERVAL '1 week');

-- Vérifier les sessions pour l'étudiant (logique de l'agenda)
SELECT 'Sessions pour l''étudiant (logique agenda):' as info;
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    CASE 
        WHEN s.student_id = 'student_dashboard_consistency_id' THEN 'Titulaire'
        ELSE 'Participant'
    END as role
FROM sessions s
WHERE s.student_id = 'student_dashboard_consistency_id'
UNION ALL
SELECT 
    s.id,
    s.subject,
    s.status,
    s.started_at,
    'Participant' as role
FROM sessions s
JOIN session_participants sp ON s.id = sp.session_id
WHERE sp.student_id = 'student_dashboard_consistency_id'
ORDER BY started_at DESC;

-- Compter les sessions terminées (COMPLETED) - doit être 4 (3 titulaire + 1 participant)
SELECT 'Nombre de sessions COMPLETED (doit être 4):' as info;
SELECT COUNT(*) as completed_sessions
FROM (
    SELECT s.id
    FROM sessions s
    WHERE s.student_id = 'student_dashboard_consistency_id'
      AND s.status = 'COMPLETED'
    UNION
    SELECT s.id
    FROM sessions s
    JOIN session_participants sp ON s.id = sp.session_id
    WHERE sp.student_id = 'student_dashboard_consistency_id'
      AND s.status = 'COMPLETED'
) as all_sessions;

-- Vérifier les statistiques attendues
SELECT 'Statistiques attendues:' as info;
SELECT 
    'Sessions terminées' as metric,
    '4' as expected_value,
    'Sessions programmées' as metric2,
    '2' as expected_value2,
    'Sessions en attente' as metric3,
    '1' as expected_value3,
    'Sessions annulées' as metric4,
    '1' as expected_value4;
