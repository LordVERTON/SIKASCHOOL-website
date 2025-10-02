-- Session assessments to capture tutor post-session evaluations
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

