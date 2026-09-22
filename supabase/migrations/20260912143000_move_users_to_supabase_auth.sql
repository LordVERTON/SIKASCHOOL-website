-- Move authentication ownership from public.users to Supabase Auth.
--
-- auth.users becomes the only source of truth for email/password identities.
-- public.profiles keeps application-only attributes and remains the parent row
-- for domain foreign keys, all of which retain their existing UUID values.

-- Abort safely if an Auth account already owns an application email with a
-- different UUID. This must be resolved explicitly instead of silently
-- re-parenting sessions, payments, or family links.
DO $$
DECLARE
  collision RECORD;
BEGIN
  SELECT pu.id AS profile_id, au.id AS auth_id, pu.email
  INTO collision
  FROM public.users pu
  JOIN auth.users au ON lower(au.email) = lower(pu.email)
  WHERE au.id <> pu.id
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION
      'Auth migration blocked: email % belongs to public user % but auth user %',
      collision.email, collision.profile_id, collision.auth_id;
  END IF;
END;
$$;

-- Import legacy password hashes. Supabase Auth uses bcrypt in
-- auth.users.encrypted_password, so existing users keep their passwords.
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  reauthentication_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  u.id,
  'authenticated',
  'authenticated',
  lower(u.email),
  u.password_hash,
  CASE WHEN u.email_verified THEN COALESCE(u.updated_at, u.created_at, NOW()) ELSE NULL END,
  '',
  '',
  '',
  '',
  '',
  '',
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
  jsonb_build_object(
    'first_name', u.first_name,
    'last_name', u.last_name,
    'role', u.role::text
  ),
  false,
  COALESCE(u.created_at, NOW()),
  COALESCE(u.updated_at, NOW()),
  false,
  false
FROM public.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = CASE
    WHEN auth.users.encrypted_password IS NULL OR auth.users.encrypted_password = ''
      THEN EXCLUDED.encrypted_password
    ELSE auth.users.encrypted_password
  END,
  email_confirmed_at = COALESCE(auth.users.email_confirmed_at, EXCLUDED.email_confirmed_at),
  raw_app_meta_data = auth.users.raw_app_meta_data || EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = auth.users.raw_user_meta_data || EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- Password identities are required by GoTrue for imported email users.
INSERT INTO auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id::text,
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', lower(u.email),
    'email_verified', u.email_verified,
    'phone_verified', false
  ),
  'email',
  NULL,
  COALESCE(u.created_at, NOW()),
  COALESCE(u.updated_at, NOW())
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.identities i
  WHERE i.user_id = u.id AND i.provider = 'email'
)
ON CONFLICT (provider_id, provider) DO NOTHING;

-- The public row is now a business profile, not an authentication account.
ALTER TABLE public.users RENAME TO profiles;
ALTER INDEX IF EXISTS public.idx_users_email RENAME TO idx_profiles_email;
ALTER INDEX IF EXISTS public.idx_users_role RENAME TO idx_profiles_role;
ALTER INDEX IF EXISTS public.idx_users_stripe_customer_id RENAME TO idx_profiles_stripe_customer_id;

ALTER TABLE public.profiles RENAME CONSTRAINT users_pkey TO profiles_pkey;
ALTER TABLE public.profiles RENAME CONSTRAINT users_email_key TO profiles_email_key;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_auth_user_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles DROP COLUMN password_hash;

DO $$
BEGIN
  IF EXISTS (SELECT user_id FROM public.tutors GROUP BY user_id HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Auth migration blocked: duplicate tutors.user_id rows';
  END IF;
  IF EXISTS (SELECT user_id FROM public.students GROUP BY user_id HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Auth migration blocked: duplicate students.user_id rows';
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS tutors_user_id_key ON public.tutors(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS students_user_id_key ON public.students(user_id);

-- Recompile legacy functions whose SQL bodies referenced the old table name.
CREATE OR REPLACE FUNCTION public.validate_student_parent_link_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.parents_linked IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = NEW.parents_linked AND role = 'PARENT'
    ) THEN
    RAISE EXCEPTION 'parents_linked must reference a PARENT profile';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_tutor_to_student(
  p_tutor_id UUID,
  p_student_id UUID,
  p_assigned_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  assignment_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_tutor_id AND role = 'TUTOR') THEN
    RAISE EXCEPTION 'Tuteur non trouve ou role invalide';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_student_id AND role = 'STUDENT') THEN
    RAISE EXCEPTION 'Etudiant non trouve ou role invalide';
  END IF;

  INSERT INTO public.tutor_student_assignments (
    tutor_id, student_id, assigned_by, notes
  ) VALUES (
    p_tutor_id, p_student_id, p_assigned_by, p_notes
  )
  ON CONFLICT (tutor_id, student_id) DO UPDATE SET
    is_active = true,
    assigned_by = EXCLUDED.assigned_by,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO assignment_id;

  RETURN assignment_id;
END;
$$;

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
  assigned_at TIMESTAMPTZ,
  notes TEXT
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    profile.id,
    concat(profile.first_name, ' ', profile.last_name),
    profile.email::TEXT,
    profile.avatar_url,
    tutor.bio,
    tutor.subjects,
    tutor.experience_years,
    tutor.is_available,
    assignment.assigned_at,
    assignment.notes
  FROM public.tutor_student_assignments assignment
  JOIN public.profiles profile ON assignment.tutor_id = profile.id
  JOIN public.tutors tutor ON tutor.user_id = profile.id
  WHERE assignment.student_id = p_student_id
    AND assignment.is_active = true
  ORDER BY assignment.assigned_at DESC;
END;
$$;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Passwords, verification tokens and recovery tokens now belong exclusively
-- to Supabase Auth. Keep only the temporary SMS challenge rows used by the
-- existing optional phone 2FA flow.
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{"theme":"system"}'::jsonb,
  notifications JSONB NOT NULL DEFAULT '{"email":true,"push":true,"sms":false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.user_settings (user_id, preferences, notifications)
SELECT
  credential.user_id,
  COALESCE(
    (jsonb_agg(credential.credential_value::jsonb)
      FILTER (
        WHERE credential.credential_type = 'TUTOR_PREFERENCES'
          AND credential.credential_value IS JSON
      )) -> 0,
    '{"theme":"system"}'::jsonb
  ),
  COALESCE(
    (jsonb_agg(credential.credential_value::jsonb)
      FILTER (
        WHERE credential.credential_type = 'TUTOR_NOTIFICATION_PREFS'
          AND credential.credential_value IS JSON
      )) -> 0,
    '{"email":true,"push":true,"sms":false}'::jsonb
  )
FROM public.user_credentials credential
WHERE credential.credential_type IN ('TUTOR_PREFERENCES', 'TUTOR_NOTIFICATION_PREFS')
GROUP BY credential.user_id
ON CONFLICT (user_id) DO NOTHING;

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_settings_own ON public.user_settings;
CREATE POLICY user_settings_own ON public.user_settings
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

DELETE FROM public.user_credentials
WHERE credential_type IN (
  'password',
  'email_verification',
  'password_reset',
  'TUTOR_PREFERENCES',
  'TUTOR_NOTIFICATION_PREFS'
);

ALTER TABLE public.user_credentials RENAME TO user_security_challenges;
ALTER TABLE public.user_security_challenges
  RENAME CONSTRAINT user_credentials_user_id_fkey TO user_security_challenges_user_id_fkey;
ALTER TABLE public.user_security_challenges
  RENAME CONSTRAINT user_credentials_user_id_credential_type_key
  TO user_security_challenges_user_id_credential_type_key;
ALTER INDEX IF EXISTS public.idx_user_credentials_user_id
  RENAME TO idx_user_security_challenges_user_id;
DROP TRIGGER IF EXISTS update_user_credentials_updated_at ON public.user_security_challenges;
CREATE TRIGGER update_user_security_challenges_updated_at
  BEFORE UPDATE ON public.user_security_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- New Auth accounts automatically receive a safe STUDENT profile. Privileged
-- roles are assigned only by trusted server/admin code after account creation.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    avatar_url,
    phone,
    is_active,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    lower(COALESCE(NEW.email, NEW.id::text || '@invalid.local')),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'first_name', ''), 'Nouveau'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'last_name', ''), 'Utilisateur'),
    'STUDENT',
    NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    NULLIF(NEW.phone, ''),
    true,
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_auth_user_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = lower(COALESCE(NEW.email, profiles.email)),
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_profile();

-- Backfill profiles for Auth-only accounts that may predate this migration.
INSERT INTO public.profiles (
  id, email, first_name, last_name, role, phone, is_active, email_verified,
  created_at, updated_at
)
SELECT
  au.id,
  lower(COALESCE(au.email, au.id::text || '@invalid.local')),
  COALESCE(NULLIF(au.raw_user_meta_data ->> 'first_name', ''), 'Nouveau'),
  COALESCE(NULLIF(au.raw_user_meta_data ->> 'last_name', ''), 'Utilisateur'),
  'STUDENT',
  NULLIF(au.phone, ''),
  true,
  au.email_confirmed_at IS NOT NULL,
  COALESCE(au.created_at, NOW()),
  COALESCE(au.updated_at, NOW())
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- Explicit RLS posture: server routes use service_role. Browser clients may
-- read their own profile for Realtime/RLS, but all writes go through guarded
-- API routes so role, active status and mirrored email cannot be escalated.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

COMMENT ON TABLE public.profiles IS
  'Application profile keyed by auth.users.id; contains no password or authentication token.';
COMMENT ON COLUMN public.profiles.email IS
  'Read-model copy synchronized from auth.users; auth.users remains authoritative.';
