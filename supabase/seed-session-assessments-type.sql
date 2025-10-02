-- Seed session assessments for all students over the last year (weekly)
-- Uses sessions.type (NOT session_type)
-- Run this in Supabase SQL editor or via psql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

WITH students AS (
  SELECT id FROM public.users WHERE role = 'STUDENT'
), tutor_pick AS (
  SELECT id FROM public.users WHERE role = 'TUTOR' ORDER BY created_at NULLS LAST LIMIT 1
), weeks AS (
  SELECT generate_series(0, 51) AS w
), new_sessions AS (
  INSERT INTO public.sessions (
    student_id, tutor_id, subject, level, type, status, started_at, completed_at, duration_minutes
  )
  SELECT 
    s.id AS student_id,
    tp.id AS tutor_id,
    (ARRAY['Maths','Physique','Chimie','Français','Anglais'])[floor(random()*5)+1] AS subject,
    (ARRAY['Collège','Lycée','Supérieur'])[floor(random()*3)+1] AS level,
    'NOTA' AS type,
    'COMPLETED' AS status,
    (now() - (w.w || ' weeks')::interval) AS started_at,
    (now() - (w.w || ' weeks')::interval + interval '60 minutes') AS completed_at,
    60 AS duration_minutes
  FROM students s
  CROSS JOIN tutor_pick tp
  CROSS JOIN weeks w
  RETURNING id, student_id, tutor_id, started_at
)
INSERT INTO public.session_assessments (
  session_id, student_id, tutor_id,
  concentration, participation, preparation, improvement, retention,
  comprehension, time_management, collaboration,
  notes, created_at, updated_at
)
SELECT
  ns.id,
  ns.student_id,
  ns.tutor_id,
  GREATEST(1, LEAST(5, floor(1 + random()*5)))::int AS concentration,
  GREATEST(1, LEAST(5, floor(1 + random()*5)))::int AS participation,
  GREATEST(1, LEAST(5, floor(1 + random()*5)))::int AS preparation,
  GREATEST(1, LEAST(5, floor(1 + random()*5)))::int AS improvement,
  GREATEST(1, LEAST(5, floor(1 + random()*5)))::int AS retention,
  GREATEST(1, LEAST(5, floor(1 + random()*5)))::int AS comprehension,
  GREATEST(1, LEAST(5, floor(1 + random()*5)))::int AS time_management,
  GREATEST(1, LEAST(5, floor(1 + random()*5)))::int AS collaboration,
  'Seed auto-générée' AS notes,
  ns.started_at AS created_at,
  ns.started_at AS updated_at
FROM new_sessions ns;


