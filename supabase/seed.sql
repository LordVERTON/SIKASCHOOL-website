-- SikaSchool - jeu de donnees de demonstration complet.
-- Execute uniquement par `supabase db reset` sur la base locale.
--
-- Tous les identifiants sont deterministes pour faciliter les tests et les fixtures.
-- Les dates de seance sont relatives a NOW() afin que les vues passees, en cours
-- et a venir restent pertinentes quel que soit le jour du reset.
--
-- Comptes de connexion principaux :
--   admin@sikaschool.com    / admin123
--   tutor@sikaschool.com    / tutor123   (mathematiques / physique)
--   sophie@sikaschool.com   / tutor123   (francais / histoire)
--   karim@sikaschool.com    / tutor123   (informatique / economie)
--   ana@sikaschool.com      / tutor123   (anglais / espagnol)
--   hugo@sikaschool.com     / tutor123   (SVT / chimie, indisponible)
--   student@sikaschool.com  / student123
--   camille@sikaschool.com  / student123
--   thomas@sikaschool.com   / student123
--   ines@sikaschool.com     / student123
--   lucas@sikaschool.com    / student123
--   emma@sikaschool.com     / student123
--   parent@sikaschool.com   / parent123
--   claire@sikaschool.com   / parent123  (3 enfants lies)
--   marc@sikaschool.com     / parent123
--   julie@sikaschool.com    / parent123

BEGIN;

SET LOCAL timezone = 'UTC';

-- ---------------------------------------------------------------------------
-- Utilisateurs et authentification applicative
-- ---------------------------------------------------------------------------

CREATE TEMP TABLE seed_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  timezone TEXT,
  language TEXT,
  is_active BOOLEAN,
  email_verified BOOLEAN,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ
) ON COMMIT DROP;

INSERT INTO seed_users (
  id, email, password_hash, first_name, last_name, role, avatar_url, phone,
  date_of_birth, address, city, postal_code, country, timezone, language,
  is_active, email_verified, stripe_customer_id, created_at
) VALUES
  (
    '00000000-0000-4000-8000-000000000001', 'admin@sikaschool.com',
    '$2a$10$yEy/PYdSQe0WpJrKYcDzHe7aU9XhhN7Eb.PWXjbcsDJZq6hegkzeO',
    'Admin', 'SikaSchool', 'ADMIN', NULL, '+33600000001', '1988-02-14',
    '10 rue de la Republique', 'Lyon', '69002', 'France', 'Europe/Paris', 'fr',
    true, true, NULL, NOW() - INTERVAL '2 years'
  ),
  (
    '00000000-0000-4000-8000-000000000002', 'tutor@sikaschool.com',
    '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2',
    'Daniel', 'Demo', 'TUTOR', 'https://i.pravatar.cc/300?img=12', '+33610000002', '1991-05-20',
    '24 avenue Jean Jaures', 'Lyon', '69007', 'France', 'Europe/Paris', 'fr',
    true, true, NULL, NOW() - INTERVAL '20 months'
  ),
  (
    '00000000-0000-4000-8000-000000000003', 'student@sikaschool.com',
    '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
    'Lea', 'Demo', 'STUDENT', 'https://i.pravatar.cc/300?img=47', '+33620000003', '2008-09-12',
    '5 rue des Ecoles', 'Villeurbanne', '69100', 'France', 'Europe/Paris', 'fr',
    true, true, 'cus_demo_lea', NOW() - INTERVAL '14 months'
  ),
  (
    '00000000-0000-4000-8000-000000000004', 'parent@sikaschool.com',
    '$2a$12$GsPcpux8FXyUTIexTqT9UutuaH.5JEszc33CA.us3Uk9zCjeXLQim',
    'Nathalie', 'Demo', 'PARENT', 'https://i.pravatar.cc/300?img=44', '+33630000004', '1980-01-08',
    '5 rue des Ecoles', 'Villeurbanne', '69100', 'France', 'Europe/Paris', 'fr',
    true, true, NULL, NOW() - INTERVAL '14 months'
  ),
  (
    '00000000-0000-4000-8000-000000000005', 'camille@sikaschool.com',
    '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
    'Camille', 'Robert', 'STUDENT', 'https://i.pravatar.cc/300?img=32', '+33620000005', '2009-03-22',
    '18 rue Victor Hugo', 'Grenoble', '38000', 'France', 'Europe/Paris', 'fr',
    true, true, 'cus_demo_camille', NOW() - INTERVAL '11 months'
  ),
  (
    '00000000-0000-4000-8000-000000000006', 'thomas@sikaschool.com',
    '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
    'Thomas', 'Laurent', 'STUDENT', 'https://i.pravatar.cc/300?img=11', '+33620000006', '2007-11-04',
    '7 allee des Marronniers', 'Annecy', '74000', 'France', 'Europe/Paris', 'fr',
    true, true, 'cus_demo_thomas', NOW() - INTERVAL '9 months'
  ),
  (
    '00000000-0000-4000-8000-000000000007', 'sophie@sikaschool.com',
    '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2',
    'Sophie', 'Bernard', 'TUTOR', 'https://i.pravatar.cc/300?img=49', '+33610000007', '1987-08-17',
    '3 place Bellecour', 'Lyon', '69002', 'France', 'Europe/Paris', 'fr',
    true, true, NULL, NOW() - INTERVAL '18 months'
  ),
  (
    '00000000-0000-4000-8000-000000000008', 'karim@sikaschool.com',
    '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2',
    'Karim', 'Benali', 'TUTOR', 'https://i.pravatar.cc/300?img=68', '+33610000008', '1993-12-02',
    '15 cours Lafayette', 'Lyon', '69006', 'France', 'Europe/Paris', 'fr',
    true, true, NULL, NOW() - INTERVAL '13 months'
  ),
  (
    '00000000-0000-4000-8000-000000000009', 'ana@sikaschool.com',
    '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2',
    'Ana', 'Souza', 'TUTOR', 'https://i.pravatar.cc/300?img=45', '+41790000009', '1990-06-26',
    '8 rue du Rhone', 'Geneve', '1204', 'Suisse', 'Europe/Zurich', 'fr',
    true, true, NULL, NOW() - INTERVAL '8 months'
  ),
  (
    '00000000-0000-4000-8000-00000000000a', 'claire@sikaschool.com',
    '$2a$12$GsPcpux8FXyUTIexTqT9UutuaH.5JEszc33CA.us3Uk9zCjeXLQim',
    'Claire', 'Robert', 'PARENT', 'https://i.pravatar.cc/300?img=43', '+33630000010', '1982-04-15',
    '18 rue Victor Hugo', 'Grenoble', '38000', 'France', 'Europe/Paris', 'fr',
    true, true, NULL, NOW() - INTERVAL '11 months'
  ),
  (
    '00000000-0000-4000-8000-00000000000b', 'marc@sikaschool.com',
    '$2a$12$GsPcpux8FXyUTIexTqT9UutuaH.5JEszc33CA.us3Uk9zCjeXLQim',
    'Marc', 'Laurent', 'PARENT', 'https://i.pravatar.cc/300?img=53', '+33630000011', '1979-10-30',
    '7 allee des Marronniers', 'Annecy', '74000', 'France', 'Europe/Paris', 'fr',
    true, true, NULL, NOW() - INTERVAL '9 months'
  ),
  (
    '00000000-0000-4000-8000-00000000000c', 'ines@sikaschool.com',
    '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
    'Ines', 'Robert', 'STUDENT', 'https://i.pravatar.cc/300?img=25', '+33620000012', '2005-07-01',
    '18 rue Victor Hugo', 'Grenoble', '38000', 'France', 'Europe/Paris', 'fr',
    true, true, 'cus_demo_ines', NOW() - INTERVAL '7 months'
  ),
  (
    '00000000-0000-4000-8000-00000000000d', 'lucas@sikaschool.com',
    '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
    'Lucas', 'Martin', 'STUDENT', 'https://i.pravatar.cc/300?img=8', '+33620000013', '2012-01-19',
    '42 chemin du Lac', 'Chambery', '73000', 'France', 'Europe/Paris', 'fr',
    true, false, 'cus_demo_lucas', NOW() - INTERVAL '4 months'
  ),
  (
    '00000000-0000-4000-8000-00000000000e', 'julie@sikaschool.com',
    '$2a$12$GsPcpux8FXyUTIexTqT9UutuaH.5JEszc33CA.us3Uk9zCjeXLQim',
    'Julie', 'Martin', 'PARENT', 'https://i.pravatar.cc/300?img=16', '+33630000014', '1985-09-09',
    '42 chemin du Lac', 'Chambery', '73000', 'France', 'Europe/Paris', 'fr',
    true, true, NULL, NOW() - INTERVAL '4 months'
  ),
  (
    '00000000-0000-4000-8000-00000000000f', 'emma@sikaschool.com',
    '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
    'Emma', 'Robert', 'STUDENT', 'https://i.pravatar.cc/300?img=29', '+33620000015', '2010-05-28',
    '18 rue Victor Hugo', 'Grenoble', '38000', 'France', 'Europe/Paris', 'fr',
    true, true, 'cus_demo_emma', NOW() - INTERVAL '3 months'
  ),
  (
    '00000000-0000-4000-8000-000000000010', 'hugo@sikaschool.com',
    '$2a$12$1OJfX0n7o9XklWkGW.TnDuRKZRoaCZY/D1D3ozVuZfm/9OylVvse2',
    'Hugo', 'Moreau', 'TUTOR', 'https://i.pravatar.cc/300?img=15', '+33610000016', '1984-03-11',
    '9 rue Pasteur', 'Dijon', '21000', 'France', 'Europe/Paris', 'fr',
    true, true, NULL, NOW() - INTERVAL '2 months'
  ),
  (
    '00000000-0000-4000-8000-000000000011', 'inactive@sikaschool.com',
    '$2a$12$IzZCKLi.nuGuji4eq06GYe9Vt6EF3ZAfjz3QESBDmmfgYnZDN24Cq',
    'Compte', 'Inactive', 'STUDENT', NULL, NULL, NULL, NULL, NULL, NULL,
    'France', 'Europe/Paris', 'fr', false, false, NULL, NOW() - INTERVAL '1 year'
  );

-- Hashes verifies avec bcryptjs (cost 12). Un mot de passe commun par role
-- rend les comptes de demo faciles a utiliser sans exposer de secret reel.
UPDATE seed_users
SET password_hash = CASE role
  WHEN 'ADMIN' THEN '$2a$12$j8a6k2NsIEUROZepBieIqu4cJaPd2W3Xv85uy4rkYcbakB4VndgmO'
  WHEN 'TUTOR' THEN '$2a$12$zH8hF1dYMMiqGv5y4QcDpOuSDPuCNr7ju4RJ4M4dRdhp.vTBXP7QO'
  WHEN 'STUDENT' THEN '$2a$12$5CXMvVjs6YNR.yiQBEHxMuhlIcurm57F.OFKYGxAkGpFNLiNrgDqC'
  WHEN 'PARENT' THEN '$2a$12$2j71Y3sLWXJSuTHQMsa9bOtw2xDWq8JeyrAHMYIiq1.KWyHTSQbTO'
END;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, reauthentication_token, raw_app_meta_data,
  raw_user_meta_data, is_super_admin, created_at, updated_at, banned_until,
  is_sso_user, is_anonymous
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  id,
  'authenticated',
  'authenticated',
  lower(email),
  password_hash,
  CASE WHEN email_verified THEN created_at ELSE NULL END,
  '', '', '', '', '', '',
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
  jsonb_build_object('first_name', first_name, 'last_name', last_name, 'role', role::text),
  false,
  created_at,
  created_at,
  CASE WHEN is_active THEN NULL ELSE NOW() + INTERVAL '100 years' END,
  false,
  false
FROM seed_users;

INSERT INTO auth.identities (
  id, provider_id, user_id, identity_data, provider, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  id::text,
  id,
  jsonb_build_object(
    'sub', id::text,
    'email', lower(email),
    'email_verified', email_verified,
    'phone_verified', false
  ),
  'email',
  created_at,
  created_at
FROM seed_users;

UPDATE profiles AS profile
SET
  email = lower(seed.email),
  first_name = seed.first_name,
  last_name = seed.last_name,
  role = seed.role,
  avatar_url = seed.avatar_url,
  phone = seed.phone,
  date_of_birth = seed.date_of_birth,
  address = seed.address,
  city = seed.city,
  postal_code = seed.postal_code,
  country = seed.country,
  timezone = seed.timezone,
  language = seed.language,
  is_active = seed.is_active,
  email_verified = seed.email_verified,
  stripe_customer_id = seed.stripe_customer_id,
  created_at = seed.created_at,
  updated_at = seed.created_at
FROM seed_users AS seed
WHERE profile.id = seed.id;

-- ---------------------------------------------------------------------------
-- Profils tuteurs, profils eleves et liens familiaux
-- ---------------------------------------------------------------------------

INSERT INTO tutors (
  id, user_id, bio, subjects, experience_years, hourly_rate_cents,
  is_available, rating, total_reviews, created_at
) VALUES
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002',
   'Ingenieur et enseignant, specialiste des mathematiques et de la physique du college au superieur.',
   ARRAY['Mathematiques', 'Physique', 'Statistiques'], 8, 3200, true, 4.80, 5, NOW() - INTERVAL '20 months'),
  ('20000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000007',
   'Professeure certifiee, accompagne les eleves en francais, philosophie et histoire-geographie.',
   ARRAY['Francais', 'Philosophie', 'Histoire-Geographie'], 12, 3000, true, 4.67, 3, NOW() - INTERVAL '18 months'),
  ('20000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000008',
   'Developpeur et formateur en algorithmique, programmation web, economie et gestion de projet.',
   ARRAY['Informatique', 'Algorithmique', 'Economie'], 7, 3600, true, 4.50, 2, NOW() - INTERVAL '13 months'),
  ('20000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000009',
   'Enseignante bilingue, preparation aux examens et pratique orale en anglais et espagnol.',
   ARRAY['Anglais', 'Espagnol'], 9, 3100, true, 5.00, 2, NOW() - INTERVAL '8 months'),
  ('20000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000010',
   'Docteur en biologie, actuellement indisponible pour de nouvelles affectations.',
   ARRAY['SVT', 'Chimie'], 10, 3400, false, 0.00, 0, NOW() - INTERVAL '2 months');

INSERT INTO students (
  id, user_id, grade_level, school_name, academic_goals, learning_style,
  parent_email, parent_phone, emergency_contact, theme, notify_email,
  notify_push, notify_sms, email, phone, date_of_birth, address, city,
  postal_code, country, timezone, language, is_active, email_verified,
  first_name, last_name, mfa_enabled, parents_linked, created_at
) VALUES
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003',
   'Terminale', 'Lycee Rene Descartes', 'Obtenir une mention au baccalaureat et integrer une CPGE.',
   'Visuel, exercices progressifs et fiches de synthese', 'parent@sikaschool.com', '+33630000004',
   'Nathalie Demo +33630000004', 'system', true, true, false, 'student@sikaschool.com',
   '+33620000003', '2008-09-12', '5 rue des Ecoles', 'Villeurbanne', '69100', 'France',
   'Europe/Paris', 'fr', true, true, 'Lea', 'Demo', false,
   '00000000-0000-4000-8000-000000000004', NOW() - INTERVAL '14 months'),
  ('30000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005',
   'Seconde', 'Lycee Stendhal', 'Gagner en confiance a l ecrit et preparer les epreuves anticipees.',
   'Auditif, reformulation et cartes mentales', 'claire@sikaschool.com', '+33630000010',
   'Claire Robert +33630000010', 'light', true, true, true, 'camille@sikaschool.com',
   '+33620000005', '2009-03-22', '18 rue Victor Hugo', 'Grenoble', '38000', 'France',
   'Europe/Paris', 'fr', true, true, 'Camille', 'Robert', false,
   '00000000-0000-4000-8000-00000000000a', NOW() - INTERVAL '11 months'),
  ('30000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000006',
   'Terminale', 'Lycee Berthollet', 'Consolider les specialites mathematiques et anglais.',
   'Pratique, exercices chronometres', 'marc@sikaschool.com', '+33630000011',
   'Marc Laurent +33630000011', 'dark', true, false, false, 'thomas@sikaschool.com',
   '+33620000006', '2007-11-04', '7 allee des Marronniers', 'Annecy', '74000', 'France',
   'Europe/Paris', 'fr', true, true, 'Thomas', 'Laurent', false,
   '00000000-0000-4000-8000-00000000000b', NOW() - INTERVAL '9 months'),
  ('30000000-0000-4000-8000-00000000000c', '00000000-0000-4000-8000-00000000000c',
   'Licence 1', 'Universite Grenoble Alpes', 'Reussir le premier semestre et maitriser Python.',
   'Projet, demonstration puis mise en pratique', 'claire@sikaschool.com', '+33630000010',
   'Claire Robert +33630000010', 'system', true, true, false, 'ines@sikaschool.com',
   '+33620000012', '2005-07-01', '18 rue Victor Hugo', 'Grenoble', '38000', 'France',
   'Europe/Paris', 'fr', true, true, 'Ines', 'Robert', true,
   '00000000-0000-4000-8000-00000000000a', NOW() - INTERVAL '7 months'),
  ('30000000-0000-4000-8000-00000000000d', '00000000-0000-4000-8000-00000000000d',
   'Cinquieme', 'College Louise Michel', 'Ameliorer les bases en sciences et devenir autonome.',
   'Ludique, manipulation et exemples concrets', 'julie@sikaschool.com', '+33630000014',
   'Julie Martin +33630000014', 'light', true, false, true, 'lucas@sikaschool.com',
   '+33620000013', '2012-01-19', '42 chemin du Lac', 'Chambery', '73000', 'France',
   'Europe/Paris', 'fr', true, false, 'Lucas', 'Martin', false,
   '00000000-0000-4000-8000-00000000000e', NOW() - INTERVAL '4 months'),
  ('30000000-0000-4000-8000-00000000000f', '00000000-0000-4000-8000-00000000000f',
   'Troisieme', 'College Champollion', 'Preparer le brevet et progresser en travail de groupe.',
   'Collaboratif, quiz et exercices courts', 'claire@sikaschool.com', '+33630000010',
   'Claire Robert +33630000010', 'system', true, true, false, 'emma@sikaschool.com',
   '+33620000015', '2010-05-28', '18 rue Victor Hugo', 'Grenoble', '38000', 'France',
   'Europe/Paris', 'fr', true, true, 'Emma', 'Robert', false,
   '00000000-0000-4000-8000-00000000000a', NOW() - INTERVAL '3 months'),
  ('30000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000011',
   'Premiere', NULL, 'Compte desactive servant a tester les filtres administrateur.',
   NULL, NULL, NULL, NULL, 'system', false, false, false, 'inactive@sikaschool.com',
   NULL, NULL, NULL, NULL, NULL, 'France', 'Europe/Paris', 'fr', false, false,
   'Compte', 'Inactive', false, NULL, NOW() - INTERVAL '1 year');

INSERT INTO tutor_student_assignments (
  id, tutor_id, student_id, assigned_by, assigned_at, is_active, notes
) VALUES
  ('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', NOW() - INTERVAL '12 months', true, 'Suivi principal mathematiques et physique.'),
  ('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', NOW() - INTERVAL '5 months', true, 'Renforcement ponctuel en philosophie.'),
  ('40000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', NOW() - INTERVAL '10 months', true, 'Preparation du francais.'),
  ('40000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', NOW() - INTERVAL '6 months', true, 'Conversation anglaise.'),
  ('40000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', NOW() - INTERVAL '8 months', true, 'Specialite mathematiques.'),
  ('40000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', NOW() - INTERVAL '4 months', true, 'Preparation orale en anglais.'),
  ('40000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-00000000000c', '00000000-0000-4000-8000-000000000001', NOW() - INTERVAL '7 months', true, 'Algorithmique et Python.'),
  ('40000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-00000000000d', '00000000-0000-4000-8000-000000000001', NOW() - INTERVAL '3 months', true, 'Sciences niveau college.'),
  ('40000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-00000000000f', '00000000-0000-4000-8000-000000000001', NOW() - INTERVAL '3 months', true, 'Preparation au brevet.'),
  ('40000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', NOW() - INTERVAL '9 months', false, 'Ancienne affectation cloturee apres reorientation.');

-- ---------------------------------------------------------------------------
-- Seances : tous les statuts, trois niveaux et seance multi-eleves
-- ---------------------------------------------------------------------------

INSERT INTO sessions (
  id, student_id, tutor_id, session_type, level, subject, started_at, ended_at,
  duration_minutes, status, topics_covered, homework_assigned, student_notes,
  tutor_notes, student_rating, tutor_rating, payment_status,
  payment_amount_cents, created_at
) VALUES
  ('50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'AVA', 'LYCEE', 'Mathematiques', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days' + INTERVAL '90 minutes', 90, 'COMPLETED', ARRAY['Fonctions derivees', 'Variations'], 'Exercices 12 a 18 du chapitre 4.', 'La methode devient plus claire.', 'Bonne participation, revoir les signes.', 5, 4, 'PAID', 4800, NOW() - INTERVAL '62 days'),
  ('50000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000007', 'AVA', 'LYCEE', 'Francais', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days' + INTERVAL '60 minutes', 60, 'COMPLETED', ARRAY['Commentaire compose', 'Figures de style'], 'Rediger une introduction complete.', 'Je dois mieux annoncer le plan.', 'Structure acquise, travailler les transitions.', 4, 5, 'PAID', 3000, NOW() - INTERVAL '37 days'),
  ('50000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'AVA', 'LYCEE', 'Physique', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '60 minutes', 60, 'COMPLETED', ARRAY['Ondes', 'Effet Doppler'], 'Terminer la fiche sur les ondes.', 'Bon rythme.', 'Les unites sont mieux maitrisees.', 4, 4, 'PAID', 3200, NOW() - INTERVAL '22 days'),
  ('50000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-00000000000c', '00000000-0000-4000-8000-000000000008', 'TODA', 'SUPERIEUR', 'Informatique', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '120 minutes', 120, 'COMPLETED', ARRAY['Python', 'Recursivite', 'Complexite'], 'Implementer trois tris et comparer leur complexite.', 'La recursion est comprise.', 'Tres bon raisonnement, attention aux cas limites.', 5, 5, 'PAID', 7200, NOW() - INTERVAL '16 days'),
  ('50000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000009', 'AVA', 'LYCEE', 'Anglais', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '60 minutes', 60, 'COMPLETED', ARRAY['Expression orale', 'Present perfect'], 'Preparer deux minutes sur un sujet libre.', 'Je parle avec plus de fluidite.', 'Prononciation en nette progression.', 5, 5, 'PAID', 3100, NOW() - INTERVAL '9 days'),
  ('50000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'AVA', 'LYCEE', 'Mathematiques', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '90 minutes', 90, 'COMPLETED', ARRAY['Probabilites conditionnelles', 'Loi binomiale'], 'Faire le sujet bac 2025, exercice 2.', 'Les arbres ponderes sont acquis.', 'Progression reguliere et calculs propres.', 5, 5, 'PAID', 4800, NOW() - INTERVAL '4 days'),
  ('50000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000007', 'AVA', 'LYCEE', 'Philosophie', NOW() - INTERVAL '1 day', NULL, 60, 'CANCELLED', NULL, NULL, NULL, 'Annulation tardive : eleve absent sans justificatif.', NULL, NULL, 'REFUNDED', 3000, NOW() - INTERVAL '5 days'),
  ('50000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'AVA', 'LYCEE', 'Physique', NOW() - INTERVAL '20 minutes', NULL, 60, 'IN_PROGRESS', ARRAY['Electricite'], 'Relire la loi des noeuds.', NULL, 'Seance en cours : circuit RC.', NULL, NULL, 'PAID', 3200, NOW() - INTERVAL '3 days'),
  ('50000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000007', 'AVA', 'LYCEE', 'Francais', NOW() + INTERVAL '1 day', NULL, 60, 'SCHEDULED', NULL, NULL, 'Apporter le texte de Moliere.', NULL, NULL, NULL, 'PAID', 3000, NOW() - INTERVAL '2 days'),
  ('50000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-00000000000c', '00000000-0000-4000-8000-000000000008', 'TODA', 'SUPERIEUR', 'Algorithmique', NOW() + INTERVAL '2 days', NULL, 90, 'PENDING', NULL, NULL, NULL, 'En attente de confirmation du tuteur.', NULL, NULL, 'PENDING', 5400, NOW() - INTERVAL '1 day'),
  ('50000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000009', 'AVA', 'LYCEE', 'Anglais', NOW() + INTERVAL '4 days', NULL, 60, 'SCHEDULED', NULL, NULL, 'Preparation Grand Oral.', NULL, NULL, NULL, 'PENDING', 3100, NOW() - INTERVAL '3 days'),
  ('50000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-00000000000d', '00000000-0000-4000-8000-000000000010', 'NOTA', 'COLLEGE', 'SVT', NOW() + INTERVAL '7 days', NULL, 60, 'SCHEDULED', NULL, NULL, 'Chapitre sur la respiration.', NULL, NULL, NULL, 'PAID', 3400, NOW() - INTERVAL '2 days'),
  ('50000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-00000000000f', '00000000-0000-4000-8000-000000000002', 'NOTA', 'COLLEGE', 'Mathematiques', NOW() + INTERVAL '9 days', NULL, 60, 'CANCELLED', NULL, NULL, NULL, 'Annulee par le parent plus de 48 heures avant.', NULL, NULL, 'REFUNDED', 2200, NOW() - INTERVAL '6 days'),
  ('50000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000002', 'AVA', 'LYCEE', 'Mathematiques', NOW() + INTERVAL '14 days', NULL, 120, 'PENDING', NULL, NULL, NULL, 'Demande de preparation intensive.', NULL, NULL, 'FAILED', 6400, NOW() - INTERVAL '4 hours'),
  ('50000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000002', 'NOTA', 'COLLEGE', 'Mathematiques - atelier collectif', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '90 minutes', 90, 'COMPLETED', ARRAY['Proportionnalite', 'Statistiques'], 'Quiz de revision du brevet.', 'Le groupe aide a comparer les methodes.', 'Atelier dynamique, bonne entraide.', 5, 5, 'PAID', 5400, NOW() - INTERVAL '8 days');

INSERT INTO session_participants (id, session_id, student_id, added_at) VALUES
  ('51000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', NOW() - INTERVAL '62 days'),
  ('51000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', NOW() - INTERVAL '37 days'),
  ('51000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', NOW() - INTERVAL '22 days'),
  ('51000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-00000000000c', NOW() - INTERVAL '16 days'),
  ('51000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005', NOW() - INTERVAL '9 days'),
  ('51000000-0000-4000-8000-000000000006', '50000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000003', NOW() - INTERVAL '4 days'),
  ('51000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000006', NOW() - INTERVAL '5 days'),
  ('51000000-0000-4000-8000-000000000008', '50000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000003', NOW() - INTERVAL '3 days'),
  ('51000000-0000-4000-8000-000000000009', '50000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000005', NOW() - INTERVAL '2 days'),
  ('51000000-0000-4000-8000-000000000010', '50000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-00000000000c', NOW() - INTERVAL '1 day'),
  ('51000000-0000-4000-8000-000000000011', '50000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000006', NOW() - INTERVAL '3 days'),
  ('51000000-0000-4000-8000-000000000012', '50000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-00000000000d', NOW() - INTERVAL '2 days'),
  ('51000000-0000-4000-8000-000000000013', '50000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-00000000000f', NOW() - INTERVAL '6 days'),
  ('51000000-0000-4000-8000-000000000014', '50000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000006', NOW() - INTERVAL '4 hours'),
  ('51000000-0000-4000-8000-000000000015', '50000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000005', NOW() - INTERVAL '8 days'),
  ('51000000-0000-4000-8000-000000000016', '50000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000006', NOW() - INTERVAL '8 days'),
  ('51000000-0000-4000-8000-000000000017', '50000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-00000000000f', NOW() - INTERVAL '8 days');

INSERT INTO session_assessments (
  id, session_id, student_id, tutor_id, concentration, participation,
  preparation, improvement, retention, comprehension, time_management,
  collaboration, notes, created_at
) VALUES
  ('52000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 3, 4, 3, 3, 3, 4, 3, 4, 'Premiere evaluation de reference.', NOW() - INTERVAL '60 days'),
  ('52000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000007', 4, 4, 3, 4, 3, 4, 3, 4, 'Bonne analyse du texte, gagner en precision.', NOW() - INTERVAL '35 days'),
  ('52000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 4, 4, 4, 4, 4, 4, 4, 4, 'Progression visible sur la methode.', NOW() - INTERVAL '20 days'),
  ('52000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-00000000000c', '00000000-0000-4000-8000-000000000008', 5, 5, 5, 5, 4, 5, 4, 5, 'Tres autonome sur les exercices Python.', NOW() - INTERVAL '14 days'),
  ('52000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000009', 5, 5, 4, 5, 4, 5, 4, 5, 'Prise de parole spontanee et vocabulaire varie.', NOW() - INTERVAL '7 days'),
  ('52000000-0000-4000-8000-000000000006', '50000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 5, 5, 5, 5, 5, 5, 4, 5, 'Objectifs atteints sur les probabilites.', NOW() - INTERVAL '2 days'),
  ('52000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000002', 4, 5, 4, 4, 4, 4, 4, 5, 'Tres bonne collaboration pendant l atelier.', NOW() - INTERVAL '4 days');

-- Paiements rattaches aux seances (revenus tuteurs / vue administrateur).
INSERT INTO session_payments (
  id, session_id, student_id, tutor_id, amount_cents, currency, payment_type,
  payment_status, payment_method, payment_reference, tutor_commission_cents,
  platform_fee_cents, processed_at, created_at
) VALUES
  ('53000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 4800, 'EUR', 'CARD', 'PAID', 'card', 'demo_sp_001', 3840, 960, NOW() - INTERVAL '60 days', NOW() - INTERVAL '62 days'),
  ('53000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000007', 3000, 'EUR', 'PACK_CREDIT', 'PAID', 'credits', 'demo_sp_002', 2400, 600, NOW() - INTERVAL '35 days', NOW() - INTERVAL '37 days'),
  ('53000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 3200, 'EUR', 'PACK_CREDIT', 'PAID', 'credits', 'demo_sp_003', 2560, 640, NOW() - INTERVAL '20 days', NOW() - INTERVAL '22 days'),
  ('53000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-00000000000c', '00000000-0000-4000-8000-000000000008', 7200, 'EUR', 'CARD', 'PAID', 'card', 'demo_sp_004', 5760, 1440, NOW() - INTERVAL '14 days', NOW() - INTERVAL '16 days'),
  ('53000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000009', 3100, 'EUR', 'SUBSCRIPTION', 'PAID', 'credits', 'demo_sp_005', 2480, 620, NOW() - INTERVAL '7 days', NOW() - INTERVAL '9 days'),
  ('53000000-0000-4000-8000-000000000006', '50000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 4800, 'EUR', 'PACK_CREDIT', 'PAID', 'credits', 'demo_sp_006', 3840, 960, NOW() - INTERVAL '2 days', NOW() - INTERVAL '4 days'),
  ('53000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000007', 3000, 'EUR', 'CARD', 'REFUNDED', 'card', 'demo_sp_007', 0, 0, NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 days'),
  ('53000000-0000-4000-8000-000000000008', '50000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 3200, 'EUR', 'PACK_CREDIT', 'PAID', 'credits', 'demo_sp_008', 2560, 640, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('53000000-0000-4000-8000-000000000009', '50000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000007', 3000, 'EUR', 'PACK_CREDIT', 'PAID', 'credits', 'demo_sp_009', 2400, 600, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('53000000-0000-4000-8000-000000000010', '50000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-00000000000c', '00000000-0000-4000-8000-000000000008', 5400, 'EUR', 'CARD', 'PENDING', 'card', 'demo_sp_010', NULL, NULL, NULL, NOW() - INTERVAL '1 day'),
  ('53000000-0000-4000-8000-000000000011', '50000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000009', 3100, 'EUR', 'CARD', 'PENDING', 'card', 'demo_sp_011', NULL, NULL, NULL, NOW() - INTERVAL '3 days'),
  ('53000000-0000-4000-8000-000000000012', '50000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-00000000000d', '00000000-0000-4000-8000-000000000010', 3400, 'EUR', 'PACK_CREDIT', 'PAID', 'credits', 'demo_sp_012', 2720, 680, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('53000000-0000-4000-8000-000000000013', '50000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-00000000000f', '00000000-0000-4000-8000-000000000002', 2200, 'EUR', 'CARD', 'REFUNDED', 'card', 'demo_sp_013', 0, 0, NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days'),
  ('53000000-0000-4000-8000-000000000014', '50000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000002', 6400, 'EUR', 'CARD', 'FAILED', 'card', 'demo_sp_014', 0, 0, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '4 hours'),
  ('53000000-0000-4000-8000-000000000015', '50000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000002', 5400, 'EUR', 'PACK_CREDIT', 'PAID', 'credits', 'demo_sp_015', 4320, 1080, NOW() - INTERVAL '4 days', NOW() - INTERVAL '8 days');

-- ---------------------------------------------------------------------------
-- Paiements Stripe, credits et abonnements (fausses references de demo)
-- ---------------------------------------------------------------------------

INSERT INTO payments (
  id, student_id, stripe_customer_id, stripe_checkout_session,
  stripe_payment_intent, stripe_invoice_id, stripe_subscription_id, plan_id,
  kind, level, sessions_count, amount_cents, currency, status, receipt_url,
  hosted_invoice_url, invoice_pdf_url, metadata, created_at, paid_at
) VALUES
  ('60000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'cus_demo_lea', 'cs_demo_lea_pack_1', 'pi_demo_lea_pack_1', NULL, NULL, 'pack_eco_lycee', 'PACK', 'LYCEE', 8, 17600, 'EUR', 'PAID', 'https://example.test/receipts/lea-pack-1', NULL, NULL, '{"source":"seed","label":"Pack AVA Eco"}', NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days'),
  ('60000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'cus_demo_lea', NULL, 'pi_demo_lea_sub_1', 'in_demo_lea_1', 'sub_demo_lea', 'subscription_lycee', 'SUBSCRIPTION', 'LYCEE', 4, 9900, 'EUR', 'PAID', NULL, 'https://example.test/invoices/lea-1', 'https://example.test/invoices/lea-1.pdf', '{"source":"seed","billing_reason":"subscription_cycle"}', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  ('60000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000005', 'cus_demo_camille', 'cs_demo_camille_pack_1', 'pi_demo_camille_pack_1', NULL, NULL, 'pack_basic_lycee', 'PACK', 'LYCEE', 4, 10800, 'EUR', 'PAID', 'https://example.test/receipts/camille-pack-1', NULL, NULL, '{"source":"seed","coupon":"RENTREE10"}', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
  ('60000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000005', 'cus_demo_camille', NULL, 'pi_demo_camille_sub_1', 'in_demo_camille_1', 'sub_demo_camille', 'subscription_lycee_trial', 'SUBSCRIPTION', 'LYCEE', 4, 0, 'EUR', 'PAID', NULL, 'https://example.test/invoices/camille-trial', NULL, '{"source":"seed","trial":true}', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('60000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000006', 'cus_demo_thomas', 'cs_demo_thomas_pending', NULL, NULL, NULL, 'pack_eco_lycee', 'PACK', 'LYCEE', 8, 17600, 'EUR', 'PENDING', NULL, NULL, NULL, '{"source":"seed","checkout":"open"}', NOW() - INTERVAL '2 hours', NULL),
  ('60000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000006', 'cus_demo_thomas', 'cs_demo_thomas_failed', 'pi_demo_thomas_failed', NULL, NULL, 'session_lycee_120', 'SESSION', 'LYCEE', 1, 6400, 'EUR', 'FAILED', NULL, NULL, NULL, '{"source":"seed","failure_code":"card_declined"}', NOW() - INTERVAL '10 days', NULL),
  ('60000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-00000000000c', 'cus_demo_ines', 'cs_demo_ines_pack_1', 'pi_demo_ines_pack_1', NULL, NULL, 'pack_eco_superieur', 'PACK', 'SUPERIEUR', 8, 22400, 'EUR', 'PAID', 'https://example.test/receipts/ines-pack-1', NULL, NULL, '{"source":"seed"}', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('60000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-00000000000c', 'cus_demo_ines', 'cs_demo_ines_refund', 'pi_demo_ines_refund', NULL, NULL, 'session_superieur_120', 'SESSION', 'SUPERIEUR', 1, 7200, 'EUR', 'REFUNDED', 'https://example.test/receipts/ines-refund', NULL, NULL, '{"source":"seed","refund_reason":"requested_by_customer"}', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
  ('60000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-00000000000d', 'cus_demo_lucas', 'cs_demo_lucas_pack_1', 'pi_demo_lucas_pack_1', NULL, NULL, 'pack_basic_college', 'PACK', 'COLLEGE', 4, 8800, 'EUR', 'PAID', 'https://example.test/receipts/lucas-pack-1', NULL, NULL, '{"source":"seed"}', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  ('60000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-00000000000f', 'cus_demo_emma', 'cs_demo_emma_canceled', NULL, NULL, NULL, 'pack_basic_college', 'PACK', 'COLLEGE', 4, 8800, 'EUR', 'CANCELED', NULL, NULL, NULL, '{"source":"seed","reason":"checkout_expired"}', NOW() - INTERVAL '6 days', NULL);

INSERT INTO student_credits (
  id, student_id, level, remaining_sessions, total_purchased, total_consumed, created_at
) VALUES
  ('61000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'LYCEE', 8, 12, 4, NOW() - INTERVAL '65 days'),
  ('61000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', 'LYCEE', 5, 8, 3, NOW() - INTERVAL '40 days'),
  ('61000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000006', 'LYCEE', 0, 0, 0, NOW() - INTERVAL '10 days'),
  ('61000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-00000000000c', 'SUPERIEUR', 7, 8, 1, NOW() - INTERVAL '30 days'),
  ('61000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-00000000000d', 'COLLEGE', 3, 4, 1, NOW() - INTERVAL '12 days'),
  ('61000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-00000000000f', 'COLLEGE', 1, 2, 1, NOW() - INTERVAL '20 days');

INSERT INTO student_credit_ledger (
  id, student_id, level, delta, reason, payment_id, session_id, created_at
) VALUES
  ('62000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'LYCEE', 8, 'PACK_PURCHASE', '60000000-0000-4000-8000-000000000001', NULL, NOW() - INTERVAL '65 days'),
  ('62000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'LYCEE', 4, 'SUBSCRIPTION_RENEWAL', '60000000-0000-4000-8000-000000000002', NULL, NOW() - INTERVAL '18 days'),
  ('62000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', 'LYCEE', -1, 'SESSION_CONSUMED', NULL, '50000000-0000-4000-8000-000000000001', NOW() - INTERVAL '60 days'),
  ('62000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000003', 'LYCEE', -1, 'SESSION_CONSUMED', NULL, '50000000-0000-4000-8000-000000000003', NOW() - INTERVAL '20 days'),
  ('62000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000003', 'LYCEE', -1, 'SESSION_CONSUMED', NULL, '50000000-0000-4000-8000-000000000006', NOW() - INTERVAL '2 days'),
  ('62000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000003', 'LYCEE', -1, 'SESSION_CONSUMED', NULL, '50000000-0000-4000-8000-000000000008', NOW() - INTERVAL '20 minutes'),
  ('62000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000005', 'LYCEE', 4, 'PACK_PURCHASE', '60000000-0000-4000-8000-000000000003', NULL, NOW() - INTERVAL '40 days'),
  ('62000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000005', 'LYCEE', 4, 'SUBSCRIPTION_RENEWAL', '60000000-0000-4000-8000-000000000004', NULL, NOW() - INTERVAL '5 days'),
  ('62000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000005', 'LYCEE', -1, 'SESSION_CONSUMED', NULL, '50000000-0000-4000-8000-000000000002', NOW() - INTERVAL '35 days'),
  ('62000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000005', 'LYCEE', -1, 'SESSION_CONSUMED', NULL, '50000000-0000-4000-8000-000000000005', NOW() - INTERVAL '7 days'),
  ('62000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000005', 'LYCEE', -1, 'SESSION_CONSUMED', NULL, '50000000-0000-4000-8000-000000000009', NOW() - INTERVAL '2 days'),
  ('62000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-00000000000c', 'SUPERIEUR', 8, 'PACK_PURCHASE', '60000000-0000-4000-8000-000000000007', NULL, NOW() - INTERVAL '30 days'),
  ('62000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-00000000000c', 'SUPERIEUR', -1, 'SESSION_CONSUMED', NULL, '50000000-0000-4000-8000-000000000004', NOW() - INTERVAL '14 days'),
  ('62000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-00000000000d', 'COLLEGE', 4, 'PACK_PURCHASE', '60000000-0000-4000-8000-000000000009', NULL, NOW() - INTERVAL '12 days'),
  ('62000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-00000000000d', 'COLLEGE', -1, 'SESSION_CONSUMED', NULL, '50000000-0000-4000-8000-000000000012', NOW() - INTERVAL '2 days'),
  ('62000000-0000-4000-8000-000000000016', '00000000-0000-4000-8000-00000000000f', 'COLLEGE', 2, 'ADJUSTMENT', NULL, NULL, NOW() - INTERVAL '20 days'),
  ('62000000-0000-4000-8000-000000000017', '00000000-0000-4000-8000-00000000000f', 'COLLEGE', -1, 'SESSION_CONSUMED', NULL, '50000000-0000-4000-8000-000000000015', NOW() - INTERVAL '4 days');

INSERT INTO subscriptions (
  id, student_id, stripe_subscription_id, stripe_customer_id, plan_id, level,
  status, current_period_start, current_period_end, cancel_at_period_end,
  canceled_at, created_at
) VALUES
  ('63000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'sub_demo_lea', 'cus_demo_lea', 'subscription_lycee', 'LYCEE', 'active', NOW() - INTERVAL '18 days', NOW() + INTERVAL '12 days', false, NULL, NOW() - INTERVAL '48 days'),
  ('63000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', 'sub_demo_camille', 'cus_demo_camille', 'subscription_lycee_trial', 'LYCEE', 'trialing', NOW() - INTERVAL '5 days', NOW() + INTERVAL '9 days', false, NULL, NOW() - INTERVAL '5 days'),
  ('63000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000006', 'sub_demo_thomas', 'cus_demo_thomas', 'subscription_lycee', 'LYCEE', 'past_due', NOW() - INTERVAL '32 days', NOW() - INTERVAL '2 days', false, NULL, NOW() - INTERVAL '92 days'),
  ('63000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-00000000000c', 'sub_demo_ines_old', 'cus_demo_ines', 'subscription_superieur', 'SUPERIEUR', 'canceled', NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days', true, NOW() - INTERVAL '62 days', NOW() - INTERVAL '150 days'),
  ('63000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-00000000000d', 'sub_demo_lucas_unpaid', 'cus_demo_lucas', 'subscription_college', 'COLLEGE', 'unpaid', NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days', false, NULL, NOW() - INTERVAL '70 days'),
  ('63000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-00000000000f', 'sub_demo_emma_incomplete', 'cus_demo_emma', 'subscription_college', 'COLLEGE', 'incomplete', NOW(), NOW() + INTERVAL '30 days', false, NULL, NOW());

-- ---------------------------------------------------------------------------
-- Messagerie et notifications
-- ---------------------------------------------------------------------------

INSERT INTO message_threads (id, subject, created_by, is_active, created_at) VALUES
  ('70000000-0000-4000-8000-000000000001', 'Suivi de Lea - mathematiques', '00000000-0000-4000-8000-000000000004', true, NOW() - INTERVAL '10 days'),
  ('70000000-0000-4000-8000-000000000002', 'Preparation du commentaire compose', '00000000-0000-4000-8000-000000000005', true, NOW() - INTERVAL '4 days'),
  ('70000000-0000-4000-8000-000000000003', 'Question paiement pack', '00000000-0000-4000-8000-00000000000a', true, NOW() - INTERVAL '2 days'),
  ('70000000-0000-4000-8000-000000000004', 'Ancien suivi cloture', '00000000-0000-4000-8000-000000000008', false, NOW() - INTERVAL '90 days');

INSERT INTO message_thread_participants (thread_id, user_id, role, joined_at) VALUES
  ('70000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'STUDENT', NOW() - INTERVAL '10 days'),
  ('70000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000004', 'PARENT', NOW() - INTERVAL '10 days'),
  ('70000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'TUTOR', NOW() - INTERVAL '10 days'),
  ('70000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', 'STUDENT', NOW() - INTERVAL '4 days'),
  ('70000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000007', 'TUTOR', NOW() - INTERVAL '4 days'),
  ('70000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-00000000000a', 'PARENT', NOW() - INTERVAL '2 days'),
  ('70000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'ADMIN', NOW() - INTERVAL '2 days'),
  ('70000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000005', 'STUDENT', NOW() - INTERVAL '90 days'),
  ('70000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000008', 'TUTOR', NOW() - INTERVAL '90 days');

INSERT INTO messages (id, thread_id, sender_id, content, is_read, created_at) VALUES
  ('71000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000004', 'Bonjour, pouvez-vous me faire un retour sur les dernieres seances de Lea ?', true, NOW() - INTERVAL '10 days'),
  ('71000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Bonjour, Lea progresse tres bien. Les probabilites sont maintenant acquises.', true, NOW() - INTERVAL '9 days 22 hours'),
  ('71000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'Merci ! Je vais poursuivre les exercices cette semaine.', false, NOW() - INTERVAL '9 days 20 hours'),
  ('71000000-0000-4000-8000-000000000004', '70000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', 'Bonsoir Sophie, pourriez-vous relire mon plan avant demain ?', true, NOW() - INTERVAL '4 days'),
  ('71000000-0000-4000-8000-000000000005', '70000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000007', 'Oui, envoie-le ici. Je te ferai un retour avant 18 h.', false, NOW() - INTERVAL '3 days 22 hours'),
  ('71000000-0000-4000-8000-000000000006', '70000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-00000000000a', 'Le recu du dernier pack est-il disponible ?', true, NOW() - INTERVAL '2 days'),
  ('71000000-0000-4000-8000-000000000007', '70000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Oui, il est telechargeable dans Paiements > Historique.', false, NOW() - INTERVAL '1 day 20 hours'),
  ('71000000-0000-4000-8000-000000000008', '70000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000008', 'Ce fil est archive apres changement de tuteur.', true, NOW() - INTERVAL '85 days');

INSERT INTO notifications (id, user_id, type, title, message, data, is_read, created_at) VALUES
  ('72000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'ASSIGNMENT', 'Exercice a rendre', 'Le sujet de probabilites est a terminer avant la prochaine seance.', '{"subject":"Mathematiques","source":"seed"}', false, NOW() - INTERVAL '2 days'),
  ('72000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', 'MESSAGE', 'Nouveau message', 'Daniel a repondu dans votre conversation.', '{"thread_id":"70000000-0000-4000-8000-000000000001"}', true, NOW() - INTERVAL '9 days 22 hours'),
  ('72000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000005', 'BOOKING', 'Seance confirmee', 'Votre seance de francais est programmee demain.', '{"session_id":"50000000-0000-4000-8000-000000000009"}', false, NOW() - INTERVAL '1 day'),
  ('72000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000003', 'PAYMENT', 'Paiement accepte', 'Votre renouvellement mensuel a bien ete paye.', '{"payment_id":"60000000-0000-4000-8000-000000000002","amount_cents":9900}', true, NOW() - INTERVAL '18 days'),
  ('72000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-00000000000d', 'SYSTEM', 'Bienvenue sur SikaSchool', 'Completez votre profil pour profiter de toutes les fonctionnalites.', '{"action":"complete_profile"}', false, NOW() - INTERVAL '4 months'),
  ('72000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-00000000000d', 'PROFILE', 'Adresse e-mail a verifier', 'Confirmez votre adresse pour securiser votre compte.', '{"email_verified":false}', false, NOW() - INTERVAL '3 days'),
  ('72000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-00000000000c', 'PASSWORD', 'Mot de passe modifie', 'Votre mot de passe a ete modifie avec succes.', '{}', true, NOW() - INTERVAL '12 days'),
  ('72000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000003', 'SESSION_UPDATE', 'Seance demarree', 'Votre seance de physique est en cours.', '{"session_id":"50000000-0000-4000-8000-000000000008","status":"IN_PROGRESS"}', false, NOW() - INTERVAL '20 minutes'),
  ('72000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000006', 'TUTOR_ASSIGNMENT', 'Nouveau tuteur attribue', 'Ana Souza vous accompagne desormais en anglais.', '{"tutor_id":"00000000-0000-4000-8000-000000000009"}', true, NOW() - INTERVAL '4 months'),
  ('72000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000008', 'PAYMENT', 'Paiement en attente', 'Une seance superieur attend la validation du paiement.', '{"session_id":"50000000-0000-4000-8000-000000000010"}', false, NOW() - INTERVAL '1 day');

-- ---------------------------------------------------------------------------
-- Conversations Sika AI
-- ---------------------------------------------------------------------------

INSERT INTO ai_tutor_conversations (
  id, user_id, title, subject, level, is_active, created_at, updated_at
) VALUES
  ('80000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'Comprendre la loi binomiale', 'Mathematiques', 'Terminale', true, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('80000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', 'Plan de commentaire compose', 'Francais', 'Seconde', true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('80000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-00000000000c', 'Debogage Python', 'Informatique', 'Licence 1', false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days');

INSERT INTO ai_tutor_messages (
  id, conversation_id, role, content, images, metadata, created_at
) VALUES
  ('81000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000001', 'system', 'Tu es un tuteur patient. Guide l eleve sans donner immediatement la reponse.', '[]', '{"source":"seed"}', NOW() - INTERVAL '6 days 5 minutes'),
  ('81000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000001', 'user', 'Peux-tu m expliquer simplement quand utiliser une loi binomiale ?', '[]', '{}', NOW() - INTERVAL '6 days 4 minutes'),
  ('81000000-0000-4000-8000-000000000003', '80000000-0000-4000-8000-000000000001', 'assistant', 'On l utilise quand une meme experience a deux issues est repetee independamment un nombre fixe de fois, avec une probabilite de succes constante.', '[]', '{"model":"demo-model","tokens":48}', NOW() - INTERVAL '6 days 3 minutes'),
  ('81000000-0000-4000-8000-000000000004', '80000000-0000-4000-8000-000000000002', 'user', 'Comment construire un plan en deux parties pour ce texte de Moliere ?', '[{"type":"image","url":"https://example.test/demo/moliere-page.jpg"}]', '{}', NOW() - INTERVAL '3 days 2 minutes'),
  ('81000000-0000-4000-8000-000000000005', '80000000-0000-4000-8000-000000000002', 'assistant', 'Commence par relever les oppositions du passage. Elles peuvent faire emerger deux axes coherents.', '[]', '{"model":"demo-model"}', NOW() - INTERVAL '3 days 1 minute'),
  ('81000000-0000-4000-8000-000000000006', '80000000-0000-4000-8000-000000000003', 'user', 'Pourquoi ma fonction recursive ne renvoie rien ?', '[]', '{}', NOW() - INTERVAL '20 days'),
  ('81000000-0000-4000-8000-000000000007', '80000000-0000-4000-8000-000000000003', 'tool', 'Analyse statique terminee : branche sans instruction return detectee.', '[]', '{"tool":"code_analyzer","status":"success"}', NOW() - INTERVAL '19 days 23 hours'),
  ('81000000-0000-4000-8000-000000000008', '80000000-0000-4000-8000-000000000003', 'assistant', 'Une branche atteint la fin sans return. Ajoute un cas de base explicite et retourne aussi le resultat de l appel recursif.', '[]', '{"model":"demo-model"}', NOW() - INTERVAL '19 days 22 hours');

-- ---------------------------------------------------------------------------
-- Temoignages et FAQ publiques
-- ---------------------------------------------------------------------------

INSERT INTO reviews (
  id, student_id, tutor_id, student_name, student_role, content, rating,
  is_approved, avatar_url, created_at
) VALUES
  ('90000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'Lea Demo', 'Terminale - mathematiques', 'Daniel explique clairement et me laisse chercher avant de me guider. Mes resultats sont devenus reguliers.', 5, true, 'https://i.pravatar.cc/160?img=47', NOW() - INTERVAL '2 days'),
  ('90000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000007', 'Camille Robert', 'Seconde - francais', 'Les methodes de Sophie m ont aidee a structurer mes commentaires et a gagner confiance.', 4, true, 'https://i.pravatar.cc/160?img=32', NOW() - INTERVAL '6 days'),
  ('90000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-00000000000c', '00000000-0000-4000-8000-000000000008', 'Ines Robert', 'Licence 1 - informatique', 'Karim donne des exemples concrets et m a appris a deboguer de facon autonome.', 5, true, 'https://i.pravatar.cc/160?img=25', NOW() - INTERVAL '12 days'),
  ('90000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000009', 'Thomas Laurent', 'Terminale - anglais', 'Les conversations avec Ana sont tres utiles pour preparer mon oral.', 5, true, 'https://i.pravatar.cc/160?img=11', NOW() - INTERVAL '4 days'),
  ('90000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-00000000000f', '00000000-0000-4000-8000-000000000002', 'Emma Robert', 'Troisieme - atelier collectif', 'J ai aime travailler en petit groupe et comparer plusieurs methodes.', 4, false, 'https://i.pravatar.cc/160?img=29', NOW() - INTERVAL '3 days'),
  ('90000000-0000-4000-8000-000000000006', NULL, '00000000-0000-4000-8000-000000000007', 'Parent anonyme', 'Parent d eleve', 'Accompagnement serieux et bilans tres utiles apres chaque seance.', 3, false, NULL, NOW() - INTERVAL '1 day');

INSERT INTO faqs (id, question, answer, is_active, created_at) VALUES
  ('91000000-0000-4000-8000-000000000001', 'Comment fonctionne une seance ?', 'Apres reservation, l eleve retrouve la seance dans son calendrier et rejoint le cours depuis son espace.', true, NOW() - INTERVAL '1 year'),
  ('91000000-0000-4000-8000-000000000002', 'Quels niveaux sont proposes ?', 'NOTA couvre le college, AVA le lycee et TODA l enseignement superieur.', true, NOW() - INTERVAL '1 year'),
  ('91000000-0000-4000-8000-000000000003', 'Comment utiliser un pack de seances ?', 'Chaque achat credite le nombre de seances correspondant au niveau choisi. Un credit est consomme lors de la seance.', true, NOW() - INTERVAL '10 months'),
  ('91000000-0000-4000-8000-000000000004', 'Un parent peut-il suivre plusieurs enfants ?', 'Oui. Un meme compte parent peut acceder aux espaces des enfants qui lui sont lies.', true, NOW() - INTERVAL '8 months'),
  ('91000000-0000-4000-8000-000000000005', 'Comment contacter le support ?', 'Utilisez la messagerie de votre espace ou les coordonnees affichees sur le site.', true, NOW() - INTERVAL '6 months'),
  ('91000000-0000-4000-8000-000000000006', 'Ancienne question masquee', 'Cette entree inactive permet de tester le filtrage public.', false, NOW() - INTERVAL '5 months');

COMMIT;
