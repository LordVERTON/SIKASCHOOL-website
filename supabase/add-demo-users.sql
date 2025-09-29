-- =============================================
-- Script SQL pour ajouter les utilisateurs de démonstration
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- =============================================

-- Vérifier si les utilisateurs existent déjà
DO $$
DECLARE
    tutor_exists boolean;
    student_exists boolean;
BEGIN
    -- Vérifier si le tuteur existe
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'tutor@sikaschool.com') INTO tutor_exists;
    
    -- Vérifier si l'étudiant existe
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'student@sikaschool.com') INTO student_exists;
    
    -- Supprimer les utilisateurs existants s'ils existent
    IF tutor_exists THEN
        DELETE FROM user_credentials WHERE user_id = (SELECT id FROM users WHERE email = 'tutor@sikaschool.com');
        DELETE FROM tutors WHERE user_id = (SELECT id FROM users WHERE email = 'tutor@sikaschool.com');
        DELETE FROM users WHERE email = 'tutor@sikaschool.com';
        RAISE NOTICE 'Utilisateur tuteur existant supprimé';
    END IF;
    
    IF student_exists THEN
        DELETE FROM user_credentials WHERE user_id = (SELECT id FROM users WHERE email = 'student@sikaschool.com');
        DELETE FROM students WHERE user_id = (SELECT id FROM users WHERE email = 'student@sikaschool.com');
        DELETE FROM users WHERE email = 'student@sikaschool.com';
        RAISE NOTICE 'Utilisateur étudiant existant supprimé';
    END IF;
END $$;

-- Insertion des utilisateurs de démonstration
INSERT INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at) VALUES
  (uuid_generate_v4(), 'tutor@sikaschool.com', 'Tuteur', 'Démonstration', 'TUTOR', true, NOW(), NOW()),
  (uuid_generate_v4(), 'student@sikaschool.com', 'Élève', 'Démonstration', 'STUDENT', true, NOW(), NOW());

-- Insertion des credentials (mots de passe hashés avec bcrypt)
INSERT INTO user_credentials (user_id, credential_type, credential_value, is_active, created_at, updated_at) VALUES
  ((SELECT id FROM users WHERE email = 'tutor@sikaschool.com'), 'password', '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2', true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'student@sikaschool.com'), 'password', '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq', true, NOW(), NOW());

-- Insertion du profil tuteur détaillé
INSERT INTO tutors (user_id, bio, subjects, experience_years, hourly_rate_cents, is_available, created_at, updated_at) VALUES
  ((SELECT id FROM users WHERE email = 'tutor@sikaschool.com'), 'Tuteur de démonstration pour les tests de la plateforme SikaSchool. Expert en mathématiques et sciences.', ARRAY['Mathématiques', 'Physique', 'Sciences'], 5, 6000, true, NOW(), NOW());

-- Insertion du profil élève détaillé
INSERT INTO students (user_id, grade_level, school_name, academic_goals, created_at, updated_at) VALUES
  ((SELECT id FROM users WHERE email = 'student@sikaschool.com'), 'Lycée', 'Lycée de démonstration', 'Améliorer les résultats en mathématiques et sciences', NOW(), NOW());

-- Vérification des insertions
SELECT 
    u.email,
    u.role,
    u.is_active,
    CASE 
        WHEN u.role = 'TUTOR' THEN (SELECT bio FROM tutors WHERE user_id = u.id)
        WHEN u.role = 'STUDENT' THEN (SELECT academic_goals FROM students WHERE user_id = u.id)
    END as profile_info
FROM users u 
WHERE u.email IN ('tutor@sikaschool.com', 'student@sikaschool.com');

-- =============================================
-- CREDENTIALS POUR LES UTILISATEURS DE DÉMONSTRATION
-- =============================================
-- 
-- Tuteur de démonstration:
--   Email: tutor@sikaschool.com
--   Mot de passe: tutor123
--   Rôle: TUTOR
--
-- Élève de démonstration:
--   Email: student@sikaschool.com
--   Mot de passe: student123
--   Rôle: STUDENT
--
-- =============================================
