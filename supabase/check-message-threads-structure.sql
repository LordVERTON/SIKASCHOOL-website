-- Script pour vérifier la structure réelle de la table message_threads
SELECT 'Structure de la table message_threads:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'message_threads' 
ORDER BY ordinal_position;

-- Vérifier s'il y a des données existantes
SELECT 'Données existantes dans message_threads:' as info;
SELECT COUNT(*) as total_threads FROM message_threads;

-- Vérifier la structure de la table messages
SELECT 'Structure de la table messages:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- Vérifier les utilisateurs existants
SELECT 'Utilisateurs existants:' as info;
SELECT COUNT(*) as total_users, 
       COUNT(CASE WHEN role = 'STUDENT' THEN 1 END) as students,
       COUNT(CASE WHEN role = 'TUTOR' THEN 1 END) as tutors
FROM users;
