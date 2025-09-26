-- Seed data for Supabase database
-- This file contains sample data for testing the application

-- Insert subjects
INSERT INTO subjects (id, name, description, level) VALUES
    (uuid_generate_v4(), 'Mathématiques', 'Cours de mathématiques pour tous niveaux', 'Collège'),
    (uuid_generate_v4(), 'Mathématiques', 'Cours de mathématiques pour tous niveaux', 'Lycée'),
    (uuid_generate_v4(), 'Mathématiques', 'Cours de mathématiques pour tous niveaux', 'Supérieur'),
    (uuid_generate_v4(), 'Physique', 'Cours de physique-chimie', 'Lycée'),
    (uuid_generate_v4(), 'Chimie', 'Cours de chimie', 'Lycée'),
    (uuid_generate_v4(), 'Sciences de la Vie et de la Terre', 'Cours de SVT', 'Lycée'),
    (uuid_generate_v4(), 'Français', 'Cours de français et littérature', 'Lycée'),
    (uuid_generate_v4(), 'Anglais', 'Cours d''anglais', 'Lycée'),
    (uuid_generate_v4(), 'Histoire-Géographie', 'Cours d''histoire et géographie', 'Lycée'),
    (uuid_generate_v4(), 'Philosophie', 'Cours de philosophie', 'Lycée');

-- Insert test users (with hashed passwords)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
    -- Admin user
    (uuid_generate_v4(), 'admin@sikaschool.com', '$2a$10$XtQVvH73DEShLZyayAUL/ue/1HnRMD5GILc5g6H/Hgldm.slN.Yh2', 'Admin', 'SikaSchool', 'ADMIN', true, true),
    
    -- Tutor users
    (uuid_generate_v4(), 'tutor@sikaschool.com', '$2a$10$.J5fyTBej8gCUDc14ojOFe.pd486E1mPY.0dqzr0Utng6zRcS6ctS', 'Daniel', 'Martin', 'TUTOR', true, true),
    (uuid_generate_v4(), 'marie.tutor@sikaschool.com', '$2a$10$UBXYREAK3/w93Z4P9JBuQOe6mqeqKX726V83gcD89ZnZPHGLHXgt6', 'Marie', 'Dubois', 'TUTOR', true, true),
    (uuid_generate_v4(), 'pierre.tutor@sikaschool.com', '$2a$10$iuYeaAHdCom1gme3CUCU5eDu2q9QTX1i3zLiReUzoo2QqKP27Nr3q', 'Pierre', 'Leroy', 'TUTOR', true, true),
    
    -- Student users
    (uuid_generate_v4(), 'student@sikaschool.com', '$2a$10$matTyqid1WQjZjgOplIQb.OaqVqq1OGTNoR4Y/6YNd83y7gx7VYAe', 'Steve', 'Johnson', 'STUDENT', true, true),
    (uuid_generate_v4(), 'sophie.student@sikaschool.com', '$2a$10$zHk6kurb/M2vbUoIgOdcZO87hdmP6qEGz8870KEHURTXGgl2NftZS', 'Sophie', 'Bernard', 'STUDENT', true, true),
    (uuid_generate_v4(), 'lucas.student@sikaschool.com', '$2a$10$VqdsAmf1k4tCwJbOEBCukOt.OmXiCDvWSp6.Xv3ExCVDG4/nx7atK', 'Lucas', 'Moreau', 'STUDENT', true, true);

-- Insert tutor profiles
INSERT INTO tutor_profiles (user_id, bio, specializations, experience_years, hourly_rate, rating, total_reviews)
SELECT 
    u.id,
    'Professeur de mathématiques expérimenté avec plus de 10 ans d''expérience dans l''enseignement.',
    ARRAY['Mathématiques', 'Physique', 'Chimie'],
    10,
    45.00,
    4.8,
    25
FROM users u WHERE u.email = 'tutor@sikaschool.com';

INSERT INTO tutor_profiles (user_id, bio, specializations, experience_years, hourly_rate, rating, total_reviews)
SELECT 
    u.id,
    'Professeure de français et littérature, passionnée par la transmission du savoir.',
    ARRAY['Français', 'Littérature', 'Philosophie'],
    8,
    40.00,
    4.9,
    18
FROM users u WHERE u.email = 'marie.tutor@sikaschool.com';

INSERT INTO tutor_profiles (user_id, bio, specializations, experience_years, hourly_rate, rating, total_reviews)
SELECT 
    u.id,
    'Professeur de sciences avec une approche pédagogique moderne et interactive.',
    ARRAY['SVT', 'Physique', 'Chimie'],
    6,
    42.00,
    4.7,
    15
FROM users u WHERE u.email = 'pierre.tutor@sikaschool.com';

-- Insert student profiles
INSERT INTO student_profiles (user_id, grade_level, school_name, academic_goals, parent_email)
SELECT 
    u.id,
    'Terminale',
    'Lycée Victor Hugo',
    'Préparation au baccalauréat avec mention',
    'parent.steve@email.com'
FROM users u WHERE u.email = 'student@sikaschool.com';

INSERT INTO student_profiles (user_id, grade_level, school_name, academic_goals, parent_email)
SELECT 
    u.id,
    'Première',
    'Lycée Jean Moulin',
    'Améliorer les résultats en français et philosophie',
    'parent.sophie@email.com'
FROM users u WHERE u.email = 'sophie.student@sikaschool.com';

INSERT INTO student_profiles (user_id, grade_level, school_name, academic_goals, parent_email)
SELECT 
    u.id,
    'Seconde',
    'Lycée Marie Curie',
    'Renforcer les bases en sciences',
    'parent.lucas@email.com'
FROM users u WHERE u.email = 'lucas.student@sikaschool.com';

-- Insert plans
INSERT INTO plans (id, name, description, type, level, sessions_count, price_cents, currency) VALUES
    (uuid_generate_v4(), 'Pack Collège - Nota', 'Pack de 10 séances pour le collège', 'PACK', 'Collège', 10, 35000, 'EUR'),
    (uuid_generate_v4(), 'Pack Lycée - Ava', 'Pack de 15 séances pour le lycée', 'PACK', 'Lycée', 15, 60000, 'EUR'),
    (uuid_generate_v4(), 'Pack Supérieur - Toda', 'Pack de 20 séances pour le supérieur', 'PACK', 'Supérieur', 20, 80000, 'EUR'),
    (uuid_generate_v4(), 'Séance Collège', 'Séance unique pour le collège', 'SINGLE', 'Collège', 1, 4000, 'EUR'),
    (uuid_generate_v4(), 'Séance Lycée', 'Séance unique pour le lycée', 'SINGLE', 'Lycée', 1, 4500, 'EUR'),
    (uuid_generate_v4(), 'Séance Supérieur', 'Séance unique pour le supérieur', 'SINGLE', 'Supérieur', 1, 5000, 'EUR');

-- Insert pricing rules for different session types and levels
INSERT INTO pricing_rules (session_type, level, price_per_hour_cents) VALUES
    -- NOTA (Niveau de base)
    ('NOTA', 'Collège', 5000),  -- 50€/h
    ('NOTA', 'Lycée', 6000),    -- 60€/h
    ('NOTA', 'Supérieur', 8000), -- 80€/h
    
    -- AVA (Niveau avancé)
    ('AVA', 'Collège', 6000),   -- 60€/h
    ('AVA', 'Lycée', 7000),     -- 70€/h
    ('AVA', 'Supérieur', 9000), -- 90€/h
    
    -- TODA (Niveau expert)
    ('TODA', 'Collège', 7000),  -- 70€/h
    ('TODA', 'Lycée', 8000),    -- 80€/h
    ('TODA', 'Supérieur', 10000); -- 100€/h

-- Insert courses
INSERT INTO courses (id, title, description, subject_id, tutor_id, level, price_per_hour, total_hours, is_published)
SELECT 
    uuid_generate_v4(),
    'Mathématiques Terminale S',
    'Cours complet de mathématiques pour la Terminale S, couvrant tous les chapitres du programme.',
    s.id,
    u.id,
    'Terminale',
    45.00,
    30,
    true
FROM subjects s, users u 
WHERE s.name = 'Mathématiques' AND s.level = 'Lycée' AND u.email = 'tutor@sikaschool.com';

INSERT INTO courses (id, title, description, subject_id, tutor_id, level, price_per_hour, total_hours, is_published)
SELECT 
    uuid_generate_v4(),
    'Français Première',
    'Préparation au bac de français avec analyse de textes et méthodologie.',
    s.id,
    u.id,
    'Première',
    40.00,
    25,
    true
FROM subjects s, users u 
WHERE s.name = 'Français' AND s.level = 'Lycée' AND u.email = 'marie.tutor@sikaschool.com';

INSERT INTO courses (id, title, description, subject_id, tutor_id, level, price_per_hour, total_hours, is_published)
SELECT 
    uuid_generate_v4(),
    'SVT Seconde',
    'Cours de Sciences de la Vie et de la Terre pour la classe de Seconde.',
    s.id,
    u.id,
    'Seconde',
    42.00,
    20,
    true
FROM subjects s, users u 
WHERE s.name = 'Sciences de la Vie et de la Terre' AND s.level = 'Lycée' AND u.email = 'pierre.tutor@sikaschool.com';

-- Insert lessons for the first course
INSERT INTO lessons (course_id, title, description, duration_minutes, order_index, is_published)
SELECT 
    c.id,
    'Introduction aux fonctions',
    'Découverte des fonctions et de leurs propriétés de base.',
    60,
    1,
    true
FROM courses c 
WHERE c.title = 'Mathématiques Terminale S';

INSERT INTO lessons (course_id, title, description, duration_minutes, order_index, is_published)
SELECT 
    c.id,
    'Dérivation',
    'Apprentissage des techniques de dérivation et applications.',
    60,
    2,
    true
FROM courses c 
WHERE c.title = 'Mathématiques Terminale S';

INSERT INTO lessons (course_id, title, description, duration_minutes, order_index, is_published)
SELECT 
    c.id,
    'Intégration',
    'Méthodes d''intégration et calcul d''aires.',
    60,
    3,
    true
FROM courses c 
WHERE c.title = 'Mathématiques Terminale S';

-- Insert enrollments
INSERT INTO enrollments (student_id, course_id, status, progress_percentage)
SELECT 
    s.id,
    c.id,
    'ACTIVE',
    25.0
FROM users s, courses c 
WHERE s.email = 'student@sikaschool.com' AND c.title = 'Mathématiques Terminale S';

INSERT INTO enrollments (student_id, course_id, status, progress_percentage)
SELECT 
    s.id,
    c.id,
    'ACTIVE',
    15.0
FROM users s, courses c 
WHERE s.email = 'sophie.student@sikaschool.com' AND c.title = 'Français Première';

INSERT INTO enrollments (student_id, course_id, status, progress_percentage)
SELECT 
    s.id,
    c.id,
    'ACTIVE',
    10.0
FROM users s, courses c 
WHERE s.email = 'lucas.student@sikaschool.com' AND c.title = 'SVT Seconde';

-- Insert lesson progress
INSERT INTO lesson_progress (student_id, lesson_id, is_completed, time_watched_seconds)
SELECT 
    s.id,
    l.id,
    true,
    3600
FROM users s, courses c, lessons l
WHERE s.email = 'student@sikaschool.com' 
AND c.title = 'Mathématiques Terminale S' 
AND c.id = l.course_id 
AND l.order_index = 1;

INSERT INTO lesson_progress (student_id, lesson_id, is_completed, time_watched_seconds)
SELECT 
    s.id,
    l.id,
    false,
    1800
FROM users s, courses c, lessons l
WHERE s.email = 'student@sikaschool.com' 
AND c.title = 'Mathématiques Terminale S' 
AND c.id = l.course_id 
AND l.order_index = 2;

-- Insert assignments
INSERT INTO assignments (course_id, title, description, due_date, max_score, is_published)
SELECT 
    c.id,
    'Devoir sur les fonctions',
    'Exercices sur les fonctions de base et leurs propriétés.',
    NOW() + INTERVAL '7 days',
    100,
    true
FROM courses c 
WHERE c.title = 'Mathématiques Terminale S';

INSERT INTO assignments (course_id, title, description, due_date, max_score, is_published)
SELECT 
    c.id,
    'Commentaire de texte',
    'Analyse d''un extrait de roman du XIXe siècle.',
    NOW() + INTERVAL '5 days',
    100,
    true
FROM courses c 
WHERE c.title = 'Français Première';

-- Insert notifications
INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT 
    u.id,
    'ASSIGNMENT',
    'Nouveau devoir disponible',
    'Un nouveau devoir sur les fonctions a été publié.',
    false
FROM users u 
WHERE u.email = 'student@sikaschool.com';

INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT 
    u.id,
    'MESSAGE',
    'Message de votre tuteur',
    'Votre tuteur vous a envoyé un message concernant votre progression.',
    false
FROM users u 
WHERE u.email = 'student@sikaschool.com';

-- Insert tutor availability
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_recurring)
SELECT 
    u.id,
    1, -- Monday
    '09:00',
    '17:00',
    true
FROM users u 
WHERE u.email = 'tutor@sikaschool.com';

INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_recurring)
SELECT 
    u.id,
    2, -- Tuesday
    '09:00',
    '17:00',
    true
FROM users u 
WHERE u.email = 'tutor@sikaschool.com';

INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_recurring)
SELECT 
    u.id,
    3, -- Wednesday
    '09:00',
    '17:00',
    true
FROM users u 
WHERE u.email = 'tutor@sikaschool.com';

INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_recurring)
SELECT 
    u.id,
    4, -- Thursday
    '09:00',
    '17:00',
    true
FROM users u 
WHERE u.email = 'tutor@sikaschool.com';

INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_recurring)
SELECT 
    u.id,
    5, -- Friday
    '09:00',
    '17:00',
    true
FROM users u 
WHERE u.email = 'tutor@sikaschool.com';

-- Insert sample bookings
INSERT INTO bookings (student_id, tutor_id, course_id, type, status, scheduled_at, duration_minutes, price_cents, credits_used)
SELECT 
    s.id,
    t.id,
    c.id,
    'TRIAL',
    'COMPLETED',
    NOW() - INTERVAL '2 days',
    60,
    0,
    0
FROM users s, users t, courses c
WHERE s.email = 'student@sikaschool.com' 
AND t.email = 'tutor@sikaschool.com'
AND c.title = 'Mathématiques Terminale S';

INSERT INTO bookings (student_id, tutor_id, course_id, type, status, scheduled_at, duration_minutes, price_cents, credits_used)
SELECT 
    s.id,
    t.id,
    c.id,
    'REGULAR',
    'SCHEDULED',
    NOW() + INTERVAL '3 days',
    60,
    4500,
    1
FROM users s, users t, courses c
WHERE s.email = 'student@sikaschool.com' 
AND t.email = 'tutor@sikaschool.com'
AND c.title = 'Mathématiques Terminale S';

-- Insert sample sessions (completed sessions)
INSERT INTO sessions (booking_id, student_id, tutor_id, course_id, session_type, level, started_at, ended_at, duration_minutes, status, topics_covered, homework_assigned, student_notes, tutor_notes, student_rating, tutor_rating, payment_status, payment_amount_cents)
SELECT 
    b.id,
    b.student_id,
    b.tutor_id,
    b.course_id,
    'AVA',
    'Lycée',
    b.scheduled_at,
    b.scheduled_at + INTERVAL '60 minutes',
    60,
    'COMPLETED',
    ARRAY['Dérivées', 'Limites', 'Fonctions exponentielles'],
    'Exercices 1 à 5 du chapitre 3',
    'Séance très utile, j''ai mieux compris les dérivées',
    'Élève motivé et attentif, bonnes questions posées',
    5,
    4,
    'PAID',
    6000
FROM bookings b
WHERE b.status = 'COMPLETED'
LIMIT 1;

-- Insert session payments
INSERT INTO session_payments (session_id, student_id, tutor_id, amount_cents, currency, payment_type, payment_status, payment_method, tutor_commission_cents, platform_fee_cents, processed_at)
SELECT 
    s.id,
    s.student_id,
    s.tutor_id,
    s.payment_amount_cents,
    'EUR',
    'CREDIT',
    'PAID',
    'CREDIT_CARD',
    ROUND(s.payment_amount_cents * 0.8), -- 80% pour le tuteur
    ROUND(s.payment_amount_cents * 0.2), -- 20% pour la plateforme
    s.ended_at
FROM sessions s
WHERE s.payment_status = 'PAID'
LIMIT 1;

-- Insert user credentials for management
INSERT INTO user_credentials (user_id, credential_type, credential_value, is_active, last_used_at)
SELECT 
    u.id,
    'EMAIL_PASSWORD',
    u.password_hash,
    true,
    NOW() - INTERVAL '1 day'
FROM users u
WHERE u.email IN ('tutor@sikaschool.com', 'student@sikaschool.com', 'admin@sikaschool.com');