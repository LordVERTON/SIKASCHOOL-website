-- =============================================
-- Attribution simple élève de démo → tuteur de démo
-- =============================================

-- Vérifier que les utilisateurs de démonstration existent
DO $$
DECLARE
    tutor_exists boolean;
    student_exists boolean;
BEGIN
    -- Vérifier si le tuteur de démonstration existe
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'tutor@sikaschool.com') INTO tutor_exists;
    
    -- Vérifier si l'étudiant de démonstration existe
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'student@sikaschool.com') INTO student_exists;
    
    IF NOT tutor_exists THEN
        RAISE NOTICE 'Tuteur de démonstration non trouvé. Exécutez d''abord le script add-demo-users.sql';
        RETURN;
    END IF;
    
    IF NOT student_exists THEN
        RAISE NOTICE 'Étudiant de démonstration non trouvé. Exécutez d''abord le script add-demo-users.sql';
        RETURN;
    END IF;
END $$;

-- Attribuer le tuteur de démonstration à l'étudiant de démonstration
INSERT INTO tutor_student_assignments (tutor_id, student_id, assigned_by, notes, is_active)
SELECT 
    (SELECT id FROM users WHERE email = 'tutor@sikaschool.com'),
    (SELECT id FROM users WHERE email = 'student@sikaschool.com'),
    (SELECT id FROM users WHERE email = 'tutor@sikaschool.com'), -- Auto-attribution pour la démo
    'Attribution de démonstration - Cours de mathématiques et sciences',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM tutor_student_assignments 
    WHERE tutor_id = (SELECT id FROM users WHERE email = 'tutor@sikaschool.com')
    AND student_id = (SELECT id FROM users WHERE email = 'student@sikaschool.com')
);

-- Vérification de l'attribution créée
SELECT 
    u1.first_name || ' ' || u1.last_name as tutor_name,
    u1.email as tutor_email,
    u2.first_name || ' ' || u2.last_name as student_name,
    u2.email as student_email,
    tsa.assigned_at,
    tsa.notes,
    tsa.is_active
FROM tutor_student_assignments tsa
JOIN users u1 ON tsa.tutor_id = u1.id
JOIN users u2 ON tsa.student_id = u2.id
WHERE u1.email = 'tutor@sikaschool.com' 
AND u2.email = 'student@sikaschool.com';

-- =============================================
-- INSTRUCTIONS
-- =============================================
-- 
-- Cette query :
-- 1. Vérifie que les utilisateurs de démo existent
-- 2. Crée l'attribution tuteur → étudiant
-- 3. Affiche le résultat pour vérification
-- 
-- Après exécution :
-- - L'étudiant student@sikaschool.com verra le tuteur tutor@sikaschool.com
-- - L'API /api/student/assigned-tutors fonctionnera
-- - La page /student/tutors affichera le tuteur
-- 
-- =============================================
