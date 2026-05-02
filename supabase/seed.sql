-- Seed de démo — exécuté après les migrations (`supabase db reset` en local).
-- Sur projet distant vide : appliquer les migrations puis coller ce fichier dans SQL Editor si besoin.
--
-- Comptes (mot de passe → voir commentaires) :
--   admin@sikaschool.com    → admin123
--   tutor@sikaschool.com    → tutor123
--   student@sikaschool.com  → student123

INSERT INTO subjects (id, name, description, level) VALUES
  (uuid_generate_v4(), 'Mathématiques', 'Soutien mathématiques', 'Lycée'),
  (uuid_generate_v4(), 'Français', 'Soutien français', 'Lycée'),
  (uuid_generate_v4(), 'Physique', 'Soutien physique-chimie', 'Lycée');

INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
  ('00000000-0000-4000-8000-000000000001'::uuid, 'admin@sikaschool.com',
   '$2a$10$yEy/PYdSQe0WpJrKYcDzHe7aU9XhhN7Eb.PWXjbcsDJZq6hegkzeO',
   'Admin', 'SikaSchool', 'ADMIN', true, true),
  ('00000000-0000-4000-8000-000000000002'::uuid, 'tutor@sikaschool.com',
   '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2',
   'Tuteur', 'Démo', 'TUTOR', true, true),
  ('00000000-0000-4000-8000-000000000003'::uuid, 'student@sikaschool.com',
   '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
   'Élève', 'Démo', 'STUDENT', true, true);

INSERT INTO user_credentials (user_id, credential_type, credential_value, is_active) VALUES
  ('00000000-0000-4000-8000-000000000001'::uuid, 'password',
   '$2a$10$yEy/PYdSQe0WpJrKYcDzHe7aU9XhhN7Eb.PWXjbcsDJZq6hegkzeO', true),
  ('00000000-0000-4000-8000-000000000002'::uuid, 'password',
   '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2', true),
  ('00000000-0000-4000-8000-000000000003'::uuid, 'password',
   '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq', true);

INSERT INTO tutors (user_id, bio, subjects, experience_years, hourly_rate_cents, is_available, rating, total_reviews)
VALUES (
  '00000000-0000-4000-8000-000000000002'::uuid,
  'Tuteur de démonstration SikaSchool.',
  ARRAY['Mathématiques', 'Physique'],
  5,
  6000,
  true,
  4.9,
  3
);

INSERT INTO students (user_id, grade_level, school_name, academic_goals, parent_email)
VALUES (
  '00000000-0000-4000-8000-000000000003'::uuid,
  'Terminale',
  'Lycée de démonstration',
  'Réussir le baccalauréat',
  'parent.demo@email.com'
);

INSERT INTO tutor_student_assignments (tutor_id, student_id, is_active, notes)
VALUES (
  '00000000-0000-4000-8000-000000000002'::uuid,
  '00000000-0000-4000-8000-000000000003'::uuid,
  true,
  'Attribution de démonstration'
);

INSERT INTO pricing_rules (session_type, level, price_per_hour_cents, is_active) VALUES
  ('NOTA', 'Collège', 5000, true),
  ('NOTA', 'Lycée', 6000, true),
  ('NOTA', 'Supérieur', 8000, true),
  ('AVA', 'Collège', 6000, true),
  ('AVA', 'Lycée', 7000, true),
  ('AVA', 'Supérieur', 9000, true),
  ('TODA', 'Collège', 7000, true),
  ('TODA', 'Lycée', 8000, true),
  ('TODA', 'Supérieur', 10000, true);

INSERT INTO plans (name, description, type, price_cents, duration_hours, level, is_active) VALUES
  ('Pack Lycée', 'Pack séances lycée', 'PACK', 60000, 1, 'Lycée', true),
  ('Séance unitaire', 'Une séance', 'SINGLE', 4500, 1, 'Lycée', true);

INSERT INTO reviews (student_name, student_role, content, rating, is_approved) VALUES
  ('Camille R.', 'Terminale', 'Plateforme claire et tuteurs très pédagogues.', 5, true),
  ('Thomas L.', 'Parent', 'Suivi régulier, ma fille a gagné en confiance.', 5, true);

INSERT INTO faqs (question, answer, is_active) VALUES
  ('Comment fonctionne une séance ?', 'Connexion depuis l''espace élève ou tuteur avec le lien indiqué après réservation.', true),
  ('Comment contacter le support ?', 'Via les coordonnées du site ou votre espace une fois connecté.', true);
