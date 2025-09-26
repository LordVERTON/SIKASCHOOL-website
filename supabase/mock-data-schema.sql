-- Tables supplémentaires pour les données mock
-- À exécuter dans l'éditeur SQL de Supabase

-- Table pour les matières
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les cours
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les devoirs
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les soumissions de devoirs
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    file_url TEXT,
    grade INTEGER CHECK (grade >= 0 AND grade <= 20),
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les témoignages/avis
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    student_role VARCHAR(100),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    avatar_url TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les FAQ
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les fils de discussion
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les disponibilités des tuteurs
CREATE TABLE IF NOT EXISTS tutor_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Dimanche, 1 = Lundi, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les réservations
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('TRIAL', 'REGULAR')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_url TEXT,
    notes TEXT,
    price_cents INTEGER DEFAULT 0,
    credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les sessions complétées
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('NOTA', 'AVA', 'TODA')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 60,
    topics_covered TEXT,
    homework_assigned TEXT,
    student_notes TEXT,
    tutor_notes TEXT,
    student_rating INTEGER CHECK (student_rating >= 1 AND student_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les paiements des sessions
CREATE TABLE IF NOT EXISTS session_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    tutor_commission_cents INTEGER NOT NULL,
    platform_commission_cents INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'PAID', 'FAILED')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les règles de tarification
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('NOTA', 'AVA', 'TODA')),
    level VARCHAR(50) NOT NULL,
    price_per_hour_cents INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les credentials des utilisateurs
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credential_type VARCHAR(50) NOT NULL,
    credential_value TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subjects_level ON subjects(level);
CREATE INDEX IF NOT EXISTS idx_courses_tutor_id ON courses(tutor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor_id ON bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor_id ON tutor_availability(tutor_id);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à toutes les tables
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON assignment_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON message_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutor_availability_updated_at BEFORE UPDATE ON tutor_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_payments_updated_at BEFORE UPDATE ON session_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_credentials_updated_at BEFORE UPDATE ON user_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Policies pour subjects (lecture publique)
CREATE POLICY "Subjects are viewable by everyone" ON subjects FOR SELECT USING (true);

-- Policies pour courses
CREATE POLICY "Courses are viewable by everyone" ON courses FOR SELECT USING (true);
CREATE POLICY "Tutors can manage their own courses" ON courses FOR ALL USING (tutor_id = auth.uid());

-- Policies pour assignments
CREATE POLICY "Assignments are viewable by students and tutors" ON assignments FOR SELECT USING (true);
CREATE POLICY "Tutors can manage their own assignments" ON assignments FOR ALL USING (tutor_id = auth.uid());

-- Policies pour assignment_submissions
CREATE POLICY "Students can view their own submissions" ON assignment_submissions FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Tutors can view submissions for their assignments" ON assignment_submissions FOR SELECT USING (
    assignment_id IN (SELECT id FROM assignments WHERE tutor_id = auth.uid())
);
CREATE POLICY "Students can create submissions" ON assignment_submissions FOR INSERT WITH CHECK (student_id = auth.uid());

-- Policies pour notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Policies pour reviews (lecture publique)
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (is_approved = true);

-- Policies pour faqs (lecture publique)
CREATE POLICY "FAQs are viewable by everyone" ON faqs FOR SELECT USING (is_active = true);

-- Policies pour messages
CREATE POLICY "Users can view messages in their threads" ON messages FOR SELECT USING (
    thread_id IN (
        SELECT id FROM message_threads 
        WHERE student_id = auth.uid() OR tutor_id = auth.uid()
    )
);
CREATE POLICY "Users can create messages in their threads" ON messages FOR INSERT WITH CHECK (
    thread_id IN (
        SELECT id FROM message_threads 
        WHERE student_id = auth.uid() OR tutor_id = auth.uid()
    )
);

-- Policies pour message_threads
CREATE POLICY "Users can view their own threads" ON message_threads FOR SELECT USING (
    student_id = auth.uid() OR tutor_id = auth.uid()
);
CREATE POLICY "Users can create threads" ON message_threads FOR INSERT WITH CHECK (
    student_id = auth.uid() OR tutor_id = auth.uid()
);

-- Policies pour tutor_availability
CREATE POLICY "Tutor availability is viewable by everyone" ON tutor_availability FOR SELECT USING (true);
CREATE POLICY "Tutors can manage their own availability" ON tutor_availability FOR ALL USING (tutor_id = auth.uid());

-- Policies pour bookings
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (
    student_id = auth.uid() OR tutor_id = auth.uid()
);
CREATE POLICY "Students can create bookings" ON bookings FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Tutors can update their bookings" ON bookings FOR UPDATE USING (tutor_id = auth.uid());

-- Policies pour sessions
CREATE POLICY "Users can view their own sessions" ON sessions FOR SELECT USING (
    student_id = auth.uid() OR tutor_id = auth.uid()
);
CREATE POLICY "Tutors can update their sessions" ON sessions FOR UPDATE USING (tutor_id = auth.uid());

-- Policies pour session_payments
CREATE POLICY "Users can view their own payments" ON session_payments FOR SELECT USING (
    student_id = auth.uid() OR tutor_id = auth.uid()
);

-- Policies pour pricing_rules (lecture publique)
CREATE POLICY "Pricing rules are viewable by everyone" ON pricing_rules FOR SELECT USING (is_active = true);

-- Policies pour user_credentials
CREATE POLICY "Users can view their own credentials" ON user_credentials FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own credentials" ON user_credentials FOR ALL USING (user_id = auth.uid());
