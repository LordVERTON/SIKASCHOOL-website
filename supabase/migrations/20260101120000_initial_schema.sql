-- Schéma initial SikaSchool (structure uniquement : tables, index, FK, enums,
-- fonctions, triggers, RLS, publication Realtime).
-- Fusion des anciennes migrations : baseline + participants messagerie + RLS Realtime + Stripe.

-- Schéma applicatif complet au sein de cette migration unique.
-- Nouvelles évolutions : ajouter `YYYYMMDDHHMMSS_description.sql` après ce fichier.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'TUTOR', 'STUDENT');
END IF;
END $$;
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE enrollment_status AS ENUM ('ACTIVE', 'COMPLETED', 'SUSPENDED', 'CANCELLED');
END IF;
END $$;
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_status') THEN
    CREATE TYPE assignment_status AS ENUM ('PENDING', 'SUBMITTED', 'GRADED', 'OVERDUE');
END IF;
END $$;
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
END IF;
END $$;
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_type') THEN
    CREATE TYPE booking_type AS ENUM ('TRIAL', 'REGULAR', 'PACK');
END IF;
END $$;
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
    CREATE TYPE plan_type AS ENUM ('PACK', 'SINGLE');
END IF;
END $$;
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_status') THEN
    CREATE TYPE purchase_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
END IF;
END $$;
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('ASSIGNMENT', 'MESSAGE', 'BOOKING', 'PAYMENT', 'SYSTEM');
END IF;
END $$;

-- Users table (base table, no dependencies)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'France',
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    language VARCHAR(10) DEFAULT 'fr',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User credentials management (depends on users)
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credential_type VARCHAR(50) NOT NULL,
    credential_value TEXT,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, credential_type)
);

-- Tutors specific information (depends on users)
CREATE TABLE IF NOT EXISTS tutors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    subjects TEXT[],
    experience_years INTEGER DEFAULT 0,
    hourly_rate_cents INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students specific information (depends on users)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    grade_level VARCHAR(50),
    school_name VARCHAR(255),
    academic_goals TEXT,
    learning_style TEXT,
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    emergency_contact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects/Courses (independent table)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses (depends on subjects)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    level VARCHAR(50) NOT NULL,
    duration_hours INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons (depends on courses)
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    order_index INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments (depends on users and courses)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    status enrollment_status DEFAULT 'ACTIVE',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Progress tracking (depends on enrollments and lessons)
CREATE TABLE IF NOT EXISTS progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(enrollment_id, lesson_id)
);

-- Assignments (depends on courses)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    max_points INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions (depends on assignments and users)
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    status assignment_status DEFAULT 'PENDING',
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE,
    grade DECIMAL(5,2),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message threads (depends on users)
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages (depends on message_threads and users)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications (depends on users)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plans (independent table)
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type plan_type NOT NULL,
    price_cents INTEGER NOT NULL,
    duration_hours INTEGER DEFAULT 1,
    level VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases (depends on users and plans)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    amount_cents INTEGER NOT NULL,
    status purchase_status DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availabilities (depends on users/tutors)
CREATE TABLE IF NOT EXISTS availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings (depends on users, courses, and availabilities)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    availability_id UUID REFERENCES availabilities(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    type booking_type DEFAULT 'REGULAR',
    status booking_status DEFAULT 'SCHEDULED',
    meeting_url TEXT,
    notes TEXT,
    price_cents INTEGER,
    credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews / témoignages page publique (API testimonials — pas de lien booking)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name VARCHAR(100) NOT NULL,
    student_role VARCHAR(100),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    avatar_url TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_type VARCHAR(20) NOT NULL,
    level VARCHAR(50) NOT NULL,
    price_per_hour_cents INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_type, level)
);

-- Sessions (depends on bookings and users)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    session_type VARCHAR(20) NOT NULL,
    level VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    topics_covered TEXT[],
    homework_assigned TEXT,
    student_notes TEXT,
    tutor_notes TEXT,
    student_rating INTEGER CHECK (student_rating >= 1 AND student_rating <= 5),
    tutor_rating INTEGER CHECK (tutor_rating >= 1 AND tutor_rating <= 5),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_amount_cents INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session payments (depends on sessions)
CREATE TABLE IF NOT EXISTS session_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    payment_type VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    tutor_commission_cents INTEGER,
    platform_fee_cents INTEGER,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_tutors_user_id ON tutors(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_enrollment_id ON progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_student_id ON purchases(student_id);
CREATE INDEX IF NOT EXISTS idx_availabilities_tutor_id ON availabilities(tutor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor_id ON bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'booking_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor_id ON sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_session_payments_session_id ON session_payments(session_id);
CREATE INDEX IF NOT EXISTS idx_session_payments_student_id ON session_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_session_payments_tutor_id ON session_payments(tutor_id);

-- Valeurs enum notifications (dashboard, séances, etc.)
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'PROFILE';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'PASSWORD';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'SESSION_UPDATE';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'TUTOR_ASSIGNMENT';

-- Séances : statut PENDING (création / confirmation)
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check
CHECK (status IN ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

-- Colonnes optionnelles profil élève (préférences UI / coordonnées copiées)
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_push BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_sms BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'France',
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;

-- Multi-élèves sur une séance
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_student_id ON session_participants(student_id);

-- Bilans fin de séance (formulaire tuteur)
CREATE TABLE IF NOT EXISTS session_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    concentration INTEGER CHECK (concentration >= 1 AND concentration <= 5) NOT NULL,
    participation INTEGER CHECK (participation >= 1 AND participation <= 5) NOT NULL,
    preparation INTEGER CHECK (preparation >= 1 AND preparation <= 5) NOT NULL,
    improvement INTEGER CHECK (improvement >= 1 AND improvement <= 5) NOT NULL,
    retention INTEGER CHECK (retention >= 1 AND retention <= 5) NOT NULL,
    comprehension INTEGER CHECK (comprehension >= 1 AND comprehension <= 5) NOT NULL,
    time_management INTEGER CHECK (time_management >= 1 AND time_management <= 5) NOT NULL,
    collaboration INTEGER CHECK (collaboration >= 1 AND collaboration <= 5) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_session_assessments_student_id ON session_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_session_assessments_tutor_id ON session_assessments(tutor_id);
CREATE INDEX IF NOT EXISTS idx_session_assessments_session_id ON session_assessments(session_id);

-- Attributions admin tuteur ↔ élève
CREATE TABLE IF NOT EXISTS tutor_student_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tutor_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_tutor_student_assignments_tutor_id ON tutor_student_assignments(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_student_assignments_student_id ON tutor_student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_tutor_student_assignments_active ON tutor_student_assignments(is_active);

CREATE OR REPLACE FUNCTION public.assign_tutor_to_student(
    p_tutor_id UUID,
    p_student_id UUID,
    p_assigned_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    assignment_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_tutor_id AND role = 'TUTOR') THEN
        RAISE EXCEPTION 'Tuteur non trouvé ou rôle invalide';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_student_id AND role = 'STUDENT') THEN
        RAISE EXCEPTION 'Étudiant non trouvé ou rôle invalide';
    END IF;
    INSERT INTO tutor_student_assignments (tutor_id, student_id, assigned_by, notes)
    VALUES (p_tutor_id, p_student_id, p_assigned_by, p_notes)
    ON CONFLICT (tutor_id, student_id)
    DO UPDATE SET
        is_active = true,
        assigned_by = p_assigned_by,
        notes = p_notes,
        updated_at = NOW()
    RETURNING id INTO assignment_id;
    RETURN assignment_id;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.deassign_tutor_from_student(
    p_tutor_id UUID,
    p_student_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE tutor_student_assignments
    SET is_active = false, updated_at = NOW()
    WHERE tutor_id = p_tutor_id AND student_id = p_student_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_student_assigned_tutors(p_student_id UUID)
RETURNS TABLE (
    tutor_id UUID,
    tutor_name TEXT,
    tutor_email TEXT,
    tutor_avatar TEXT,
    bio TEXT,
    subjects TEXT[],
    experience_years INTEGER,
    is_available BOOLEAN,
    assigned_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id AS tutor_id,
        CONCAT(u.first_name, ' ', u.last_name) AS tutor_name,
        u.email AS tutor_email,
        u.avatar_url AS tutor_avatar,
        t.bio,
        t.subjects,
        t.experience_years,
        t.is_available,
        tsa.assigned_at,
        tsa.notes
    FROM tutor_student_assignments tsa
    JOIN users u ON tsa.tutor_id = u.id
    JOIN tutors t ON t.user_id = u.id
    WHERE tsa.student_id = p_student_id
      AND tsa.is_active = true
    ORDER BY tsa.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Sika AI (conversations persistées)
CREATE TABLE IF NOT EXISTS ai_tutor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nouvelle discussion',
  subject TEXT NULL,
  level TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_conversations_user_id ON ai_tutor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_conversations_updated_at ON ai_tutor_conversations(updated_at DESC);

CREATE TABLE IF NOT EXISTS ai_tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_tutor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_messages_conversation_id ON ai_tutor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_messages_created_at ON ai_tutor_messages(created_at);

CREATE OR REPLACE FUNCTION touch_ai_tutor_conversation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_tutor_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_touch_ai_tutor_conversation ON ai_tutor_messages;
CREATE TRIGGER trg_touch_ai_tutor_conversation
  AFTER INSERT ON ai_tutor_messages
  FOR EACH ROW
  EXECUTE FUNCTION touch_ai_tutor_conversation();

-- FAQ page publique
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers (idempotent si migration rejouée manuellement)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_credentials_updated_at ON user_credentials;
CREATE TRIGGER update_user_credentials_updated_at BEFORE UPDATE ON user_credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_tutors_updated_at ON tutors;
CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_progress_updated_at ON progress;
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_assignments_updated_at ON assignments;
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_message_threads_updated_at ON message_threads;
CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON message_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_availabilities_updated_at ON availabilities;
CREATE TRIGGER update_availabilities_updated_at BEFORE UPDATE ON availabilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_session_payments_updated_at ON session_payments;
CREATE TRIGGER update_session_payments_updated_at BEFORE UPDATE ON session_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON pricing_rules;
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_tutor_student_assignments_updated_at ON tutor_student_assignments;
CREATE TRIGGER update_tutor_student_assignments_updated_at BEFORE UPDATE ON tutor_student_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_session_assessments_updated_at ON session_assessments;
CREATE TRIGGER update_session_assessments_updated_at BEFORE UPDATE ON session_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_ai_tutor_conversations_updated_at ON ai_tutor_conversations;
CREATE TRIGGER update_ai_tutor_conversations_updated_at BEFORE UPDATE ON ai_tutor_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS lecture publique (anon) pour FAQ et témoignages approuvés
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "FAQs are viewable by everyone" ON faqs;
CREATE POLICY "FAQs are viewable by everyone" ON faqs FOR SELECT USING (is_active = true);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (is_approved = true);

-- ---------------------------------------------------------------------------
-- Messagerie : participants (many-to-many)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_thread_participants (
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_mtp_user_id ON public.message_thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_mtp_thread_id ON public.message_thread_participants(thread_id);

-- RLS pour la messagerie : les participants voient tous les messages du fil (nécessaire pour Realtime postgres_changes + auth.uid).
-- Activer aussi publication Realtime sur ces tables (ignorer erreur si déjà présent).

-- message_thread_participants
ALTER TABLE public.message_thread_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mtp_select_own" ON public.message_thread_participants;
CREATE POLICY "mtp_select_own" ON public.message_thread_participants
  FOR SELECT
  USING (user_id = auth.uid());

-- Fils : lecture pour participants
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mt_select_participant" ON public.message_threads;
CREATE POLICY "mt_select_participant" ON public.message_threads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.message_thread_participants mtp
      WHERE mtp.thread_id = message_threads.id
        AND mtp.user_id = auth.uid()
    )
  );

-- messages
DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can read thread messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can insert messages in their threads" ON public.messages;

CREATE POLICY "Participants can read thread messages" ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.message_thread_participants mtp
      WHERE mtp.thread_id = messages.thread_id
        AND mtp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can insert messages in their threads" ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.message_thread_participants mtp
      WHERE mtp.thread_id = messages.thread_id
        AND mtp.user_id = auth.uid()
    )
  );

-- Publication Realtime (local CLI / prod : peut déjà être configuré dans le dashboard)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.message_thread_participants;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================
-- Migration : Intégration Stripe (packs, séances, abonnements)
-- Date : 2026-04-20
-- =============================================================
-- À exécuter dans Supabase SQL Editor (ou via supabase db push).
-- Aucune donnée existante n'est modifiée/supprimée.
-- =============================================================

-- 1) Référence Stripe Customer sur l'utilisateur
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- 2) Table centrale des paiements Stripe (source de vérité côté SikaSchool)
--    Un row = une Checkout Session OU un Invoice (abonnement récurrent)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Références Stripe
  stripe_customer_id      VARCHAR(255),
  stripe_checkout_session VARCHAR(255) UNIQUE,
  stripe_payment_intent   VARCHAR(255),
  stripe_invoice_id       VARCHAR(255),
  stripe_subscription_id  VARCHAR(255),

  -- Description du produit acheté (snapshot)
  plan_id        VARCHAR(100) NOT NULL,           -- ex: pack_eco_college
  kind           VARCHAR(20)  NOT NULL,           -- PACK | SESSION | SUBSCRIPTION
  level          VARCHAR(20),                     -- COLLEGE | LYCEE | SUPERIEUR
  sessions_count INTEGER DEFAULT 0,               -- nb de séances créditées

  -- Montants
  amount_cents   INTEGER NOT NULL,
  currency       VARCHAR(3) DEFAULT 'EUR',

  -- Statut
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING | PAID | FAILED | REFUNDED | CANCELED

  -- Métadonnées
  receipt_url TEXT,
  hosted_invoice_url TEXT,
  invoice_pdf_url TEXT,

  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at    TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_payments_student_id    ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status        ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at    ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_kind          ON payments(kind);
CREATE INDEX IF NOT EXISTS idx_payments_subscription  ON payments(stripe_subscription_id);

-- 3) Solde de séances créditées par famille et par niveau
--    Chaque pack acheté crédite N séances sur le niveau correspondant
CREATE TABLE IF NOT EXISTS student_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL,            -- COLLEGE | LYCEE | SUPERIEUR
  remaining_sessions INTEGER NOT NULL DEFAULT 0,
  total_purchased    INTEGER NOT NULL DEFAULT 0,
  total_consumed     INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, level)
);

CREATE INDEX IF NOT EXISTS idx_student_credits_student ON student_credits(student_id);

-- 4) Historique d'activité sur les crédits (audit)
CREATE TABLE IF NOT EXISTS student_credit_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL,
  delta INTEGER NOT NULL,                -- +N (achat) / -N (consommation)
  reason VARCHAR(50) NOT NULL,           -- PACK_PURCHASE | SUBSCRIPTION_RENEWAL | SESSION_CONSUMED | ADJUSTMENT
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_student ON student_credit_ledger(student_id);

-- 5) Abonnements actifs (projection simplifiée de l'objet Stripe Subscription)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id     VARCHAR(255),
  plan_id                VARCHAR(100) NOT NULL,
  level                  VARCHAR(20),

  status VARCHAR(30) NOT NULL,
    -- active | trialing | past_due | canceled | unpaid | incomplete | incomplete_expired

  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end   TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at          TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_student ON subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);

-- 6) Trigger d'update automatique du updated_at
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_student_credits_updated_at ON student_credits;
CREATE TRIGGER trg_student_credits_updated_at
  BEFORE UPDATE ON student_credits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- Fin de migration --
