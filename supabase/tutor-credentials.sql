-- =============================================
-- Insertion des tuteurs SikaSchool dans Supabase
-- =============================================

-- Insertion des utilisateurs tuteurs
INSERT INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at) VALUES
  (uuid_generate_v4(), 'alix.tarrade@sikaschool.com', 'Alix', 'Tarrade', 'TUTOR', true, NOW(), NOW()),
  (uuid_generate_v4(), 'nolwen.verton@sikaschool.com', 'Nolwen', 'Verton', 'TUTOR', true, NOW(), NOW()),
  (uuid_generate_v4(), 'ruudy.mbouza-bayonne@sikaschool.com', 'Ruudy', 'Mbouza-Bayonne', 'TUTOR', true, NOW(), NOW()),
  (uuid_generate_v4(), 'daniel.verton@sikaschool.com', 'Daniel', 'Verton', 'TUTOR', true, NOW(), NOW()),
  (uuid_generate_v4(), 'walid.lakas@sikaschool.com', 'Walid', 'Lakas', 'TUTOR', true, NOW(), NOW());

-- Insertion des credentials (mots de passe hashés)
INSERT INTO user_credentials (user_id, credential_type, credential_value, is_active, created_at, updated_at) VALUES
  ((SELECT id FROM users WHERE email = 'alix.tarrade@sikaschool.com'), 'password', '$2a$12$t4Phh8uhFKHFa1zO4ftoe.X.srA.My5zAjvhpHEiObLSw8bgaFIke', true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'nolwen.verton@sikaschool.com'), 'password', '$2a$12$9KmjYNP9gtBzZXB1oZnfSui8f8PYt78YyS8ftoMLOvjjhOGNNZJ4S', true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'ruudy.mbouza-bayonne@sikaschool.com'), 'password', '$2a$12$kHf3WX.GrSiJ6XwW.s809.fFAJUQNqm2sIy4UysoYC1F2VsRkeVIi', true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'daniel.verton@sikaschool.com'), 'password', '$2a$12$NA3XxDxPRojVweW6yEMskewW5JV/x4vWikTyjUDikjaCuLJKtKHRe', true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'walid.lakas@sikaschool.com'), 'password', '$2a$12$BMmiEhXjLln44zuZYd2.O.uJAZkwoV3ympEePW7qqa2YYFAfy55nW', true, NOW(), NOW());

-- Insertion des profils tuteurs détaillés
INSERT INTO tutors (user_id, bio, subjects, experience_years, hourly_rate_cents, is_available, created_at, updated_at) VALUES
  ((SELECT id FROM users WHERE email = 'alix.tarrade@sikaschool.com'), 'Spécialiste en français et méthodologie, diplômée en lettres modernes et en droit. Approche pédagogique adaptée du collège au supérieur.', ARRAY['Français', 'Méthodologie', 'Droits'], 7, 6000, true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'nolwen.verton@sikaschool.com'), 'Ingénieur de formation, passionnée par les mathématiques et la mécanique. Expertise solide dans les sciences exactes avec approche pratique.', ARRAY['Mathématiques', 'Mécanique'], 5, 6000, true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'ruudy.mbouza-bayonne@sikaschool.com'), 'Expert en mécanique des fluides et physique, docteur en physique. Expérience internationale et pédagogie exceptionnelle.', ARRAY['Mécanique des fluides', 'Physique', 'Mathématiques'], 12, 7000, true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'daniel.verton@sikaschool.com'), 'Polyvalent et expérimenté, ingénieur diplômé en informatique. Méthode pédagogique structurée et approche pratique.', ARRAY['Mathématiques', 'Physique', 'Informatique', 'Sciences de l''ingénieur'], 10, 6500, true, NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'walid.lakas@sikaschool.com'), 'Spécialiste en mathématiques et informatique, diplômé en informatique et mathématiques appliquées. Approche méthodique et progressive.', ARRAY['Mathématiques', 'Informatique', 'Physique'], 8, 6000, true, NOW(), NOW());

-- =============================================
-- CREDENTIALS POUR LES TUTEURS
-- =============================================
-- Conservez ces informations en sécurité :

-- Alix Tarrade:
--   Email: alix.tarrade@sikaschool.com
--   Mot de passe: wTCvyb5*jAuD

-- Nolwen Verton:
--   Email: nolwen.verton@sikaschool.com
--   Mot de passe: 2HAt&DsC^%d5

-- Ruudy Mbouza-Bayonne:
--   Email: ruudy.mbouza-bayonne@sikaschool.com
--   Mot de passe: VeE*I2Cp&%1&

-- Daniel Verton:
--   Email: daniel.verton@sikaschool.com
--   Mot de passe: N9SUOYn@fFsw

-- Walid Lakas:
--   Email: walid.lakas@sikaschool.com
--   Mot de passe: gT1tHFSg@nfr
-- =============================================
