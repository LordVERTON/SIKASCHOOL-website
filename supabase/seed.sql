-- Demo seed, executed after migrations (`supabase db reset` locally).
-- Accounts:
--   admin@sikaschool.com    -> admin123
--   tutor@sikaschool.com    -> tutor123
--   student@sikaschool.com  -> student123
--   parent@sikaschool.com   -> parent123
--   camille@sikaschool.com  -> student123
--   thomas@sikaschool.com   -> student123

INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
  ('00000000-0000-4000-8000-000000000001'::uuid, 'admin@sikaschool.com',
   '$2a$10$yEy/PYdSQe0WpJrKYcDzHe7aU9XhhN7Eb.PWXjbcsDJZq6hegkzeO',
   'Admin', 'SikaSchool', 'ADMIN', true, true),
  ('00000000-0000-4000-8000-000000000002'::uuid, 'tutor@sikaschool.com',
   '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2',
   'Tuteur', 'Demo', 'TUTOR', true, true),
  ('00000000-0000-4000-8000-000000000003'::uuid, 'student@sikaschool.com',
   '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
   'Eleve', 'Demo', 'STUDENT', true, true),
  ('00000000-0000-4000-8000-000000000004'::uuid, 'parent@sikaschool.com',
   '$2a$12$GsPcpux8FXyUTIexTqT9UutuaH.5JEszc33CA.us3Uk9zCjeXLQim',
   'Parent', 'Demo', 'PARENT', true, true),
  ('00000000-0000-4000-8000-000000000005'::uuid, 'camille@sikaschool.com',
   '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
   'Camille', 'R.', 'STUDENT', true, true),
  ('00000000-0000-4000-8000-000000000006'::uuid, 'thomas@sikaschool.com',
   '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
   'Thomas', 'L.', 'STUDENT', true, true);

INSERT INTO user_credentials (user_id, credential_type, credential_value, is_active) VALUES
  ('00000000-0000-4000-8000-000000000001'::uuid, 'password',
   '$2a$10$yEy/PYdSQe0WpJrKYcDzHe7aU9XhhN7Eb.PWXjbcsDJZq6hegkzeO', true),
  ('00000000-0000-4000-8000-000000000002'::uuid, 'password',
   '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2', true),
  ('00000000-0000-4000-8000-000000000003'::uuid, 'password',
   '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq', true),
  ('00000000-0000-4000-8000-000000000004'::uuid, 'password',
   '$2a$12$GsPcpux8FXyUTIexTqT9UutuaH.5JEszc33CA.us3Uk9zCjeXLQim', true),
  ('00000000-0000-4000-8000-000000000005'::uuid, 'password',
   '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq', true),
  ('00000000-0000-4000-8000-000000000006'::uuid, 'password',
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

INSERT INTO students (user_id, grade_level, school_name, academic_goals, parent_email, parents_linked)
VALUES (
  '00000000-0000-4000-8000-000000000003'::uuid,
  'Terminale',
  'Lycee de demonstration',
  'Reussir le baccalaureat',
  'parent@sikaschool.com',
  '00000000-0000-4000-8000-000000000004'::uuid
),
(
  '00000000-0000-4000-8000-000000000005'::uuid,
  'Terminale',
  'Lycee de demonstration',
  'Gagner en confiance et consolider les methodes',
  'famille.camille@sikaschool.com',
  NULL
),
(
  '00000000-0000-4000-8000-000000000006'::uuid,
  'Premiere',
  'Lycee de demonstration',
  'Progresser regulierement en mathematiques',
  'famille.thomas@sikaschool.com',
  NULL
);

INSERT INTO tutor_student_assignments (tutor_id, student_id, is_active, notes)
VALUES (
  '00000000-0000-4000-8000-000000000002'::uuid,
  '00000000-0000-4000-8000-000000000003'::uuid,
  true,
  'Attribution de demonstration'
);

INSERT INTO reviews (student_id, tutor_id, student_name, student_role, content, rating, is_approved, avatar_url) VALUES
  (
    NULL,
    '00000000-0000-4000-8000-000000000002'::uuid,
    'Milly Koula',
    'préparation concours IAE',
    $$« une fois 2 plus, j'aimerais te te remercie pour ton accompagnement et ton aide tout au long de la préparation de ce concours. Tes explications et tes conseils ont été précieux et seront utiles à la réussite de cet examen. Je ne manquerai pas de revenir vers toi une fois mon score connu alors. Merci encore et à bientôt. »$$,
    5,
    true,
    'https://images.pexels.com/photos/7880373/pexels-photo-7880373.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  ),
  (
    NULL,
    '00000000-0000-4000-8000-000000000002'::uuid,
    'Steve Kenfack',
    'école d’ingénieure informatique',
    $$« Mon examen s’est super bien passé je pense au moins avoir 18, j’ai aussi appris beaucoup de chose sur npm next js et je kiffe vraiment tout ça grâce à toi merci »$$,
    5,
    true,
    'https://images.pexels.com/photos/4259709/pexels-photo-4259709.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  ),
  (
    NULL,
    '00000000-0000-4000-8000-000000000002'::uuid,
    'Raissa Bouity',
    'maman de Liele - école primaire',
    $$des tuteurs à l’écoute et bienveillants, patient avec ma fille. Ils ont su lui faire gagner en confiance en elle$$,
    5,
    true,
    'https://images.pexels.com/photos/6482279/pexels-photo-6482279.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  ),
  (
    NULL,
    '00000000-0000-4000-8000-000000000002'::uuid,
    'Clara Briand-Nail',
    'rattrapage de comptabilité',
    $$« Bonsoir à vous !
Je vous informe que j’ai validé mon rattrapage 🙏🏻
Gloire à Dieu, merci Daniel pour les seances  »$$,
    5,
    true,
    'https://images.pexels.com/photos/19797873/pexels-photo-19797873.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  );

INSERT INTO faqs (question, answer, is_active) VALUES
  ('Comment fonctionne une seance ?', 'Connexion depuis l''espace eleve ou tuteur avec le lien indique apres reservation.', true),
  ('Comment contacter le support ?', 'Via les coordonnees du site ou votre espace une fois connecte.', true);
