-- Ensure production databases created before the consolidated baseline have
-- the session completion timestamp expected by the current app routes.

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;
