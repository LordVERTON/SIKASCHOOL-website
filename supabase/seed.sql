-- Demo seed, executed after migrations (`supabase db reset` locally).
-- Accounts:
--   admin@sikaschool.com    -> admin123
--   tutor@sikaschool.com    -> tutor123
--   student@sikaschool.com  -> student123

INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
  ('00000000-0000-4000-8000-000000000001'::uuid, 'admin@sikaschool.com',
   '$2a$10$yEy/PYdSQe0WpJrKYcDzHe7aU9XhhN7Eb.PWXjbcsDJZq6hegkzeO',
   'Admin', 'SikaSchool', 'ADMIN', true, true),
  ('00000000-0000-4000-8000-000000000002'::uuid, 'tutor@sikaschool.com',
   '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2',
   'Tuteur', 'Demo', 'TUTOR', true, true),
  ('00000000-0000-4000-8000-000000000003'::uuid, 'student@sikaschool.com',
   '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
   'Eleve', 'Demo', 'STUDENT', true, true);

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
  'Tuteur de demonstration SikaSchool.',
  ARRAY['Mathematiques', 'Physique'],
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
  'Lycee de demonstration',
  'Reussir le baccalaureat',
  'parent.demo@email.com'
);

INSERT INTO tutor_student_assignments (tutor_id, student_id, is_active, notes)
VALUES (
  '00000000-0000-4000-8000-000000000002'::uuid,
  '00000000-0000-4000-8000-000000000003'::uuid,
  true,
  'Attribution de demonstration'
);

INSERT INTO reviews (student_name, student_role, content, rating, is_approved) VALUES
  ('Camille R.', 'Terminale', 'Plateforme claire et tuteurs tres pedagogues.', 5, true),
  ('Thomas L.', 'Parent', 'Suivi regulier, ma fille a gagne en confiance.', 5, true);

INSERT INTO faqs (question, answer, is_active) VALUES
  ('Comment fonctionne une seance ?', 'Connexion depuis l''espace eleve ou tuteur avec le lien indique apres reservation.', true),
  ('Comment contacter le support ?', 'Via les coordonnees du site ou votre espace une fois connecte.', true);
