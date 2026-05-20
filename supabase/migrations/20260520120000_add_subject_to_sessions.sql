-- Sessions created from the student/tutor calendar store the selected course
-- label directly on the session so calendar/history APIs can render it without
-- requiring a course catalog row.
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS subject TEXT;
