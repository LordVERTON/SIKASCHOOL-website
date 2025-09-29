-- =============================================
-- Migration des mots de passe vers la table users
-- =============================================
-- Ce script migre les mots de passe depuis user_credentials vers password_hash dans users

-- Mettre à jour tous les utilisateurs qui n'ont pas de password_hash
UPDATE users 
SET password_hash = (
  SELECT credential_value 
  FROM user_credentials 
  WHERE user_credentials.user_id = users.id 
    AND credential_type = 'password' 
    AND is_active = true
)
WHERE password_hash IS NULL 
  AND EXISTS (
    SELECT 1 
    FROM user_credentials 
    WHERE user_credentials.user_id = users.id 
      AND credential_type = 'password' 
      AND is_active = true
  );

-- Vérifier le résultat
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  CASE 
    WHEN password_hash IS NOT NULL THEN 'Migré' 
    ELSE 'Non migré' 
  END as status
FROM users 
ORDER BY created_at;
