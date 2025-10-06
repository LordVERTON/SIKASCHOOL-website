-- Test des données des étudiants pour le tuteur
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les assignations tuteur-étudiant
SELECT 'Assignations tuteur-étudiant:' as info;
SELECT 
    tsa.id as assignment_id,
    tsa.assigned_at,
    tsa.notes,
    tsa.is_active,
    u.first_name || ' ' || u.last_name as student_name,
    u.email as student_email,
    s.grade_level,
    s.academic_goals
FROM tutor_student_assignments tsa
LEFT JOIN users u ON tsa.student_id = u.id
LEFT JOIN students s ON u.id = s.user_id
WHERE tsa.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND tsa.is_active = true
ORDER BY tsa.assigned_at DESC;

-- 2. Vérifier les sessions pour chaque étudiant assigné
SELECT 'Sessions par étudiant:' as info;
SELECT 
    s.student_id,
    u.first_name || ' ' || u.last_name as student_name,
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN s.status = 'COMPLETED' THEN 1 END) as completed_sessions,
    SUM(CASE WHEN s.status = 'COMPLETED' THEN s.duration_minutes ELSE 0 END) / 60.0 as total_hours,
    AVG(CASE WHEN s.status = 'COMPLETED' AND s.student_rating IS NOT NULL THEN s.student_rating END) as avg_rating,
    MAX(s.started_at) as last_session_date
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
GROUP BY s.student_id, u.first_name, u.last_name
ORDER BY last_session_date DESC;

-- 3. Vérifier les sessions par mois pour un étudiant spécifique
SELECT 'Sessions par mois pour un étudiant:' as info;
SELECT 
    s.student_id,
    u.first_name || ' ' || u.last_name as student_name,
    DATE_TRUNC('month', s.started_at) as month,
    COUNT(*) as sessions_count,
    COUNT(CASE WHEN s.status = 'COMPLETED' THEN 1 END) as completed_count,
    SUM(CASE WHEN s.status = 'COMPLETED' THEN s.duration_minutes ELSE 0 END) / 60.0 as hours_completed
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND s.student_id = (SELECT student_id FROM tutor_student_assignments WHERE tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1) LIMIT 1)
GROUP BY s.student_id, u.first_name, u.last_name, DATE_TRUNC('month', s.started_at)
ORDER BY month DESC;

-- 4. Vérifier les détails des sessions récentes
SELECT 'Détails des sessions récentes:' as info;
SELECT 
    s.id,
    s.subject,
    s.level,
    s.session_type,
    s.status,
    s.started_at,
    s.duration_minutes,
    s.student_rating,
    u.first_name || ' ' || u.last_name as student_name
FROM sessions s
LEFT JOIN users u ON s.student_id = u.id
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
ORDER BY s.started_at DESC
LIMIT 10;

-- 5. Statistiques globales pour le tuteur
SELECT 'Statistiques globales du tuteur:' as info;
SELECT 
    COUNT(DISTINCT s.student_id) as total_students,
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN s.status = 'COMPLETED' THEN 1 END) as completed_sessions,
    COUNT(CASE WHEN s.status = 'SCHEDULED' THEN 1 END) as scheduled_sessions,
    COUNT(CASE WHEN s.status = 'PENDING' THEN 1 END) as pending_sessions,
    COUNT(CASE WHEN s.status = 'IN_PROGRESS' THEN 1 END) as in_progress_sessions,
    SUM(CASE WHEN s.status = 'COMPLETED' THEN s.duration_minutes ELSE 0 END) / 60.0 as total_hours,
    AVG(CASE WHEN s.status = 'COMPLETED' AND s.student_rating IS NOT NULL THEN s.student_rating END) as avg_rating
FROM sessions s
WHERE s.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1);

-- 6. Vérifier les assignations actives
SELECT 'Assignations actives:' as info;
SELECT 
    tsa.id,
    tsa.assigned_at,
    tsa.notes,
    u.first_name || ' ' || u.last_name as student_name,
    u.email,
    s.grade_level,
    s.academic_goals
FROM tutor_student_assignments tsa
LEFT JOIN users u ON tsa.student_id = u.id
LEFT JOIN students s ON u.id = s.user_id
WHERE tsa.tutor_id = (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1)
AND tsa.is_active = true
ORDER BY tsa.assigned_at DESC;
