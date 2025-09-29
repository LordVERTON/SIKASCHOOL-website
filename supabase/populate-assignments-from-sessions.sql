-- =============================================
-- Script pour peupler les attributions tuteur-étudiant
-- basées sur les sessions existantes
-- =============================================

-- Vérifier que la table tutor_student_assignments existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tutor_student_assignments') THEN
        RAISE EXCEPTION 'La table tutor_student_assignments n''existe pas. Exécutez d''abord add-tutor-student-assignments.sql';
    END IF;
END $$;

-- =============================================
-- ANALYSE DES SESSIONS EXISTANTES
-- =============================================

-- Afficher les statistiques des sessions existantes
SELECT 
    'Sessions existantes' as type,
    COUNT(*) as count
FROM sessions
WHERE student_id IS NOT NULL 
AND tutor_id IS NOT NULL

UNION ALL

SELECT 
    'Paires tuteur-étudiant uniques' as type,
    COUNT(DISTINCT CONCAT(tutor_id, '-', student_id)) as count
FROM sessions
WHERE student_id IS NOT NULL 
AND tutor_id IS NOT NULL

UNION ALL

SELECT 
    'Tuteurs actifs' as type,
    COUNT(DISTINCT tutor_id) as count
FROM sessions
WHERE tutor_id IS NOT NULL

UNION ALL

SELECT 
    'Étudiants actifs' as type,
    COUNT(DISTINCT student_id) as count
FROM sessions
WHERE student_id IS NOT NULL;

-- =============================================
-- CRÉATION DES ATTRIBUTIONS BASÉES SUR LES SESSIONS
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
-- VÉRIFICATION DES ATTRIBUTIONS CRÉÉES
-- =============================================

-- Afficher les attributions créées avec les détails
SELECT 
    'Attributions créées' as type,
    COUNT(*) as count
FROM tutor_student_assignments
WHERE is_active = true

UNION ALL

SELECT 
    'Attributions basées sur sessions' as type,
    COUNT(*) as count
FROM tutor_student_assignments
WHERE is_active = true
AND notes LIKE 'Attribution automatique basée sur%';

-- Détail des attributions créées
SELECT 
    u1.first_name || ' ' || u1.last_name as tutor_name,
    u1.email as tutor_email,
    u2.first_name || ' ' || u2.last_name as student_name,
    u2.email as student_email,
    tsa.assigned_at,
    tsa.notes,
    -- Statistiques des sessions pour cette paire
    (SELECT COUNT(*) FROM sessions s 
     WHERE s.tutor_id = tsa.tutor_id 
     AND s.student_id = tsa.student_id) as total_sessions,
    (SELECT MIN(started_at) FROM sessions s 
     WHERE s.tutor_id = tsa.tutor_id 
     AND s.student_id = tsa.student_id) as first_session,
    (SELECT MAX(started_at) FROM sessions s 
     WHERE s.tutor_id = tsa.tutor_id 
     AND s.student_id = tsa.student_id) as last_session
FROM tutor_student_assignments tsa
JOIN users u1 ON tsa.tutor_id = u1.id
JOIN users u2 ON tsa.student_id = u2.id
WHERE tsa.is_active = true
AND tsa.notes LIKE 'Attribution automatique basée sur%'
ORDER BY tsa.assigned_at;

-- =============================================
-- STATISTIQUES FINALES
-- =============================================

-- Statistiques par tuteur
SELECT 
    u.first_name || ' ' || u.last_name as tutor_name,
    COUNT(tsa.student_id) as students_assigned,
    (SELECT COUNT(DISTINCT s.student_id) 
     FROM sessions s 
     WHERE s.tutor_id = u.id) as students_with_sessions,
    (SELECT COUNT(*) 
     FROM sessions s 
     WHERE s.tutor_id = u.id) as total_sessions
FROM users u
LEFT JOIN tutor_student_assignments tsa ON u.id = tsa.tutor_id AND tsa.is_active = true
WHERE u.role = 'TUTOR'
GROUP BY u.id, u.first_name, u.last_name
ORDER BY students_assigned DESC;

-- Statistiques par étudiant
SELECT 
    u.first_name || ' ' || u.last_name as student_name,
    COUNT(tsa.tutor_id) as tutors_assigned,
    (SELECT COUNT(DISTINCT s.tutor_id) 
     FROM sessions s 
     WHERE s.student_id = u.id) as tutors_with_sessions,
    (SELECT COUNT(*) 
     FROM sessions s 
     WHERE s.student_id = u.id) as total_sessions
FROM users u
LEFT JOIN tutor_student_assignments tsa ON u.id = tsa.student_id AND tsa.is_active = true
WHERE u.role = 'STUDENT'
GROUP BY u.id, u.first_name, u.last_name
ORDER BY tutors_assigned DESC;

-- =============================================
-- NETTOYAGE (OPTIONNEL)
-- =============================================

-- Pour supprimer les attributions automatiques si nécessaire :
-- DELETE FROM tutor_student_assignments 
-- WHERE notes LIKE 'Attribution automatique basée sur%';

-- =============================================
-- INSTRUCTIONS D'UTILISATION
-- =============================================
-- 
-- 1. Exécuter ce script dans l'éditeur SQL de Supabase
-- 2. Vérifier les statistiques affichées
-- 3. Les attributions sont créées automatiquement
-- 4. Les étudiants peuvent maintenant voir leurs tuteurs attribués
-- 5. Pour nettoyer, décommentez la section "NETTOYAGE"
--
-- =============================================
