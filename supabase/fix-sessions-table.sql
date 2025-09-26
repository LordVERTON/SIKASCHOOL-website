-- Script pour corriger la structure de la table sessions
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer la table sessions existante si elle a une mauvaise structure
DROP TABLE IF EXISTS session_payments CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Recréer la table sessions avec la bonne structure
CREATE TABLE sessions (
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

-- Recréer la table session_payments
CREATE TABLE session_payments (
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

-- Ajouter les index
CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor_id ON sessions(tutor_id);

-- Ajouter les triggers
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_payments_updated_at BEFORE UPDATE ON session_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_payments ENABLE ROW LEVEL SECURITY;

-- Ajouter les politiques RLS
CREATE POLICY "Users can view their own sessions" ON sessions FOR SELECT USING (
    student_id = auth.uid() OR tutor_id = auth.uid()
);
CREATE POLICY "Tutors can update their sessions" ON sessions FOR UPDATE USING (tutor_id = auth.uid());

CREATE POLICY "Users can view their own payments" ON session_payments FOR SELECT USING (
    student_id = auth.uid() OR tutor_id = auth.uid()
);
