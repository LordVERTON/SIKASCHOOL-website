-- =============================================
-- Script de correction pour la table tutor_student_assignments
-- =============================================

-- Supprimer la table si elle existe déjà (pour éviter les conflits)
DROP TABLE IF EXISTS tutor_student_assignments CASCADE;

-- Créer la table tutor_student_assignments avec les bonnes relations
CREATE TABLE tutor_student_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tutor_id, student_id)
);

-- Créer les index pour optimiser les requêtes
CREATE INDEX idx_tutor_student_assignments_tutor_id ON tutor_student_assignments(tutor_id);
CREATE INDEX idx_tutor_student_assignments_student_id ON tutor_student_assignments(student_id);
CREATE INDEX idx_tutor_student_assignments_active ON tutor_student_assignments(is_active);

-- Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tutor_student_assignments_updated_at 
    BEFORE UPDATE ON tutor_student_assignments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Peupler la table avec les sessions existantes
-- =============================================

-- Insérer les attributions basées sur les sessions existantes
INSERT INTO tutor_student_assignments (tutor_id, student_id, assigned_by, notes, is_active, assigned_at)
SELECT DISTINCT
    s.tutor_id,
    s.student_id,
    s.tutor_id as assigned_by, -- Auto-attribution basée sur les sessions
    CONCAT(
        'Attribution automatique basée sur ',
        COUNT(*),
        ' session(s) existante(s). Première session: ',
        MIN(s.started_at)::date,
        ', Dernière session: ',
        MAX(s.started_at)::date
    ) as notes,
    true as is_active,
    MIN(s.started_at) as assigned_at -- Date de la première session
FROM sessions s
WHERE s.tutor_id IS NOT NULL 
AND s.student_id IS NOT NULL
AND s.started_at IS NOT NULL
-- Exclure les sessions futures (optionnel)
AND s.started_at <= NOW()
-- Grouper par paire tuteur-étudiant
GROUP BY s.tutor_id, s.student_id
-- Ignorer les paires déjà existantes
ON CONFLICT (tutor_id, student_id) DO NOTHING;

-- =============================================
-- Vérification des résultats
-- =============================================

-- Afficher les statistiques
SELECT 
    'Attributions créées' as type,
    COUNT(*) as count
FROM tutor_student_assignments
WHERE is_active = true;

-- Afficher quelques exemples d'attributions
SELECT 
    u1.first_name || ' ' || u1.last_name as tutor_name,
    u2.first_name || ' ' || u2.last_name as student_name,
    tsa.assigned_at,
    tsa.notes,
    (SELECT COUNT(*) FROM sessions s 
     WHERE s.tutor_id = tsa.tutor_id 
     AND s.student_id = tsa.student_id) as total_sessions
FROM tutor_student_assignments tsa
JOIN users u1 ON tsa.tutor_id = u1.id
JOIN users u2 ON tsa.student_id = u2.id
WHERE tsa.is_active = true
ORDER BY tsa.assigned_at DESC
LIMIT 5;

-- =============================================
-- Instructions finales
-- =============================================
-- 
-- Après avoir exécuté ce script :
-- 1. Vérifiez que la table tutor_student_assignments existe
-- 2. Testez l'API /api/student/assigned-tutors
-- 3. Allez sur /student/tutors pour voir les tuteurs attribués
-- 
-- =============================================
