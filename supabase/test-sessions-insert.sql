-- Script de test pour vérifier l'insertion de sessions avec statut PENDING
-- À exécuter dans l'éditeur SQL de Supabase

-- D'abord, vérifier la structure de la table sessions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- Test d'insertion d'une session PENDING (adapté à la structure existante)
INSERT INTO sessions (
    student_id,
    tutor_id,
    subject,
    level,
    session_type,
    status,
    started_at,
    duration_minutes
) VALUES (
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1),
    (SELECT id FROM users WHERE role = 'TUTOR' LIMIT 1),
    'Test Mathématiques',
    'Lycée',
    'NOTA',
    'PENDING',
    NOW() + INTERVAL '1 day',
    60
) RETURNING id, status, subject;

-- Vérifier que l'insertion a fonctionné
SELECT id, subject, status, session_type, level, started_at 
FROM sessions 
WHERE status = 'PENDING' 
ORDER BY created_at DESC 
LIMIT 5;
