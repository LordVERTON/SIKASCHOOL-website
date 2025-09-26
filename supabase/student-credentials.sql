-- =============================================
-- Insertion des élèves SikaSchool dans Supabase
-- =============================================

-- Insertion des utilisateurs élèves
INSERT INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at) VALUES
  (uuid_generate_v4(), 'liele.ghoma@sikaschool.com', 'Liele', 'Ghoma', 'STUDENT', true, NOW(), NOW()),
  (uuid_generate_v4(), 'steve.kenfack@sikaschool.com', 'Steve', 'Kenfack', 'STUDENT', true, NOW(), NOW()),
  (uuid_generate_v4(), 'milly.koula@sikaschool.com', 'Milly', 'Koula', 'STUDENT', true, NOW(), NOW());

-- Insertion des credentials (mots de passe hashés)
INSERT INTO user_credentials (user_id, credential_type, credential_value, is_active, created_at, updated_at) VALUES
  ((SELECT id FROM users WHERE email = 'liele.ghoma@sikaschool.com'), 'password', '$2a$12$Bc.xrMYxSzN/y5nrIYl/b.ogg1yy0LnRKC.zaCsweA89C/utSxTl.', true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'steve.kenfack@sikaschool.com'), 'password', '$2a$12$gsSQRWzb2Rq9gLBQ8HgKjuDEH6YBNnhV/3BoWJwUOkzJOeDG88Svu', true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'milly.koula@sikaschool.com'), 'password', '$2a$12$JnrXoxdrqbOPEihtIgpVaOdNXZ4PXUqNIBkQ7sPQiGXFbOD5Av13K', true, NOW(), NOW());

-- Insertion des profils élèves détaillés
INSERT INTO students (user_id, level, subjects_of_interest, learning_goals, created_at, updated_at) VALUES
  ((SELECT id FROM users WHERE email = 'liele.ghoma@sikaschool.com'), 'CE2', ARRAY['Maths', 'Aide aux devoirs', 'Français', 'Histoire'], 'Progression et réussite scolaire', NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'steve.kenfack@sikaschool.com'), 'Supérieur', ARRAY['Mécanique', 'Électronique', 'Informatique', 'Thermodynamique', 'Électromagnétisme'], 'Progression et réussite scolaire', NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'milly.koula@sikaschool.com'), 'Supérieur', ARRAY['Préparation au concours de l'IAE'], 'Progression et réussite scolaire', NOW(), NOW());

-- =============================================
-- CREDENTIALS POUR LES ÉLÈVES
-- =============================================
-- Conservez ces informations en sécurité :

-- Liele Ghoma:
--   Email: liele.ghoma@sikaschool.com
--   Mot de passe: WrRKa^KX0&S6
--   Niveau: CE2
--   Besoins: Maths, Aide aux devoirs, Français, Histoire

-- Steve Kenfack:
--   Email: steve.kenfack@sikaschool.com
--   Mot de passe: eq^YQeT!uWG9
--   Niveau: Supérieur
--   Besoins: Mécanique, Électronique, Informatique, Thermodynamique, Électromagnétisme

-- Milly Koula:
--   Email: milly.koula@sikaschool.com
--   Mot de passe: aKP@RjA$6yD3
--   Niveau: Supérieur
--   Besoins: Préparation au concours de l'IAE

-- =============================================