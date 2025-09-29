-- =============================================
-- Insertion des utilisateurs de démonstration SikaSchool
-- =============================================

-- Insertion des utilisateurs de démonstration
INSERT INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at) VALUES
  (uuid_generate_v4(), 'tutor@sikaschool.com', 'Tuteur', 'Démonstration', 'TUTOR', true, NOW(), NOW()),
  (uuid_generate_v4(), 'student@sikaschool.com', 'Élève', 'Démonstration', 'STUDENT', true, NOW(), NOW());

-- Insertion des credentials (mots de passe hashés)
INSERT INTO user_credentials (user_id, credential_type, credential_value, is_active, created_at, updated_at) VALUES
  ((SELECT id FROM users WHERE email = 'tutor@sikaschool.com'), 'password', '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2', true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'student@sikaschool.com'), 'password', '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq', true, NOW(), NOW());

-- Insertion du profil tuteur détaillé
INSERT INTO tutors (user_id, bio, subjects, experience_years, hourly_rate_cents, is_available, created_at, updated_at) VALUES
  ((SELECT id FROM users WHERE email = 'tutor@sikaschool.com'), 'Tuteur de démonstration pour les tests de la plateforme SikaSchool. Expert en mathématiques et sciences.', ARRAY['Mathématiques', 'Physique', 'Sciences'], 5, 6000, true, NOW(), NOW());

-- Insertion du profil élève détaillé
INSERT INTO students (user_id, grade_level, school_name, academic_goals, created_at, updated_at) VALUES
  ((SELECT id FROM users WHERE email = 'student@sikaschool.com'), 'Lycée', 'Lycée de démonstration', 'Améliorer les résultats en mathématiques et sciences', NOW(), NOW());

-- =============================================
-- CREDENTIALS POUR LES UTILISATEURS DE DÉMONSTRATION
-- =============================================
-- Conservez ces informations en sécurité :

-- Tuteur de démonstration:
--   Email: tutor@sikaschool.com
--   Mot de passe: tutor123
--   Rôle: TUTOR

-- Élève de démonstration:
--   Email: student@sikaschool.com
--   Mot de passe: student123
--   Rôle: STUDENT

-- =============================================
