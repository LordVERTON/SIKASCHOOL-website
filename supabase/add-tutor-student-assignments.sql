-- =============================================
-- Table pour gérer les attributions tuteur-étudiant
-- =============================================

-- Créer la table des attributions tuteur-étudiant
CREATE TABLE IF NOT EXISTS tutor_student_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin qui a fait l'attribution
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    notes TEXT, -- Notes sur l'attribution (matières, niveau, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tutor_id, student_id) -- Un tuteur ne peut être attribué qu'une fois à un étudiant
);

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_tutor_student_assignments_tutor_id ON tutor_student_assignments(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_student_assignments_student_id ON tutor_student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_tutor_student_assignments_active ON tutor_student_assignments(is_active);

-- Créer le trigger pour updated_at (idempotent)
DROP TRIGGER IF EXISTS update_tutor_student_assignments_updated_at ON tutor_student_assignments;
CREATE TRIGGER update_tutor_student_assignments_updated_at 
    BEFORE UPDATE ON tutor_student_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Fonctions utilitaires pour gérer les attributions
-- =============================================

-- Fonction pour attribuer un tuteur à un étudiant
CREATE OR REPLACE FUNCTION public.assign_tutor_to_student(
    p_tutor_id UUID,
    p_student_id UUID,
    p_assigned_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    assignment_id UUID;
BEGIN
    -- Vérifier que le tuteur et l'étudiant existent
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_tutor_id AND role = 'TUTOR') THEN
        RAISE EXCEPTION 'Tuteur non trouvé ou rôle invalide';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_student_id AND role = 'STUDENT') THEN
        RAISE EXCEPTION 'Étudiant non trouvé ou rôle invalide';
    END IF;
    
    -- Insérer l'attribution
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

-- Fonction pour désactiver une attribution
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

-- Fonction pour obtenir les tuteurs attribués à un étudiant
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
        u.id as tutor_id,
        CONCAT(u.first_name, ' ', u.last_name) as tutor_name,
        u.email as tutor_email,
        u.avatar_url as tutor_avatar,
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

-- =============================================
-- Exemples d'utilisation
-- =============================================

-- Attribuer un tuteur à un étudiant (à exécuter par un admin)
-- SELECT assign_tutor_to_student(
--     'tutor-uuid-here',
--     'student-uuid-here',
--     'admin-uuid-here',
--     'Attribution pour cours de mathématiques niveau lycée'
-- );

-- Obtenir les tuteurs attribués à un étudiant
-- SELECT * FROM get_student_assigned_tutors('student-uuid-here');

-- Désactiver une attribution
-- SELECT deassign_tutor_from_student('tutor-uuid-here', 'student-uuid-here');
