-- Seed: for every tutor, create at least 3 sessions of each status
-- Status values supported by schema: 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
-- Uses sessions.type (NOT session_type) and completed_at column

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

WITH tutors AS (
  SELECT id AS tutor_id FROM public.users WHERE role = 'TUTOR'
), students AS (
  SELECT id AS student_id FROM public.users WHERE role = 'STUDENT'
), pick AS (
  -- Build 3 rows per status per tutor with a random student
  SELECT t.tutor_id,
         (SELECT student_id FROM students ORDER BY random() LIMIT 1) AS student_id,
         s AS slot_idx,
         st AS status
  FROM tutors t
  CROSS JOIN generate_series(1,3) AS s
  CROSS JOIN (VALUES ('SCHEDULED'), ('IN_PROGRESS'), ('COMPLETED'), ('CANCELLED')) AS v(st)
), new_sessions AS (
  INSERT INTO public.sessions (
    student_id,
    tutor_id,
    subject,
    level,
    type,
    status,
    started_at,
    completed_at,
    duration_minutes
  )
  SELECT
    p.student_id,
    p.tutor_id,
    (ARRAY['Maths','Physique','Chimie','Français','Anglais'])[floor(random()*5)+1] AS subject,
    (ARRAY['Collège','Lycée','Supérieur'])[floor(random()*3)+1] AS level,
    (ARRAY['NOTA','AVA','TODA'])[floor(random()*3)+1] AS type,
    p.status,
    CASE p.status
      WHEN 'SCHEDULED'  THEN now() + ((p.slot_idx) * interval '2 days')
      WHEN 'IN_PROGRESS' THEN now() - ((p.slot_idx) * interval '10 minutes')
      WHEN 'COMPLETED'  THEN now() - ((p.slot_idx) * interval '7 days')
      WHEN 'CANCELLED'  THEN now() - ((p.slot_idx) * interval '14 days')
      ELSE now()
    END AS started_at,
    CASE p.status
      WHEN 'COMPLETED'  THEN now() - ((p.slot_idx) * interval '7 days') + interval '60 minutes'
      ELSE NULL
    END AS completed_at,
    60 AS duration_minutes
  FROM pick p
  RETURNING id, student_id, tutor_id, status, started_at
), inserted_assessments AS (
  INSERT INTO public.session_assessments (
    session_id, student_id, tutor_id,
    concentration, participation, preparation, improvement, retention,
    comprehension, time_management, collaboration, notes, created_at, updated_at
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
  FROM new_sessions ns
  WHERE ns.status = 'COMPLETED'
  RETURNING session_id
)
SELECT (SELECT COUNT(*) FROM new_sessions) AS sessions_inserted,
       (SELECT COUNT(*) FROM inserted_assessments) AS assessments_inserted;

COMMIT;


