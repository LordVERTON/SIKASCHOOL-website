-- Seed: create >=3 sessions per week for all tutors over years 2024-2025
-- Uses sessions.type and completed_at
-- Past sessions -> COMPLETED (+assessment), today's -> IN_PROGRESS, future -> SCHEDULED

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Parameters
WITH params AS (
  SELECT DATE '2024-01-01' AS start_date,
         DATE '2025-12-31' AS end_date,
         CURRENT_DATE AS today
), weeks AS (
  -- One row per week between start and end (inclusive)
  SELECT generate_series(start_date, end_date, interval '1 week')::date AS week_start, today
  FROM params
), tutors AS (
  SELECT id AS tutor_id FROM public.users WHERE role = 'TUTOR'
), students AS (
  SELECT id AS student_id FROM public.users WHERE role = 'STUDENT'
), schedule AS (
  -- For each week and each tutor, create 3 sessions (Mon/Wed/Fri at 17:00)
  SELECT
    t.tutor_id,
    (SELECT student_id FROM students ORDER BY random() LIMIT 1) AS student_id,
    w.week_start + interval '1 day' + time '17:00' AS slot1,
    w.week_start + interval '3 day' + time '17:00' AS slot2,
    w.week_start + interval '5 day' + time '10:00' AS slot3,
    w.today
  FROM weeks w
  CROSS JOIN tutors t
), slots AS (
  SELECT tutor_id, student_id, slot1 AS slot_at, w.today FROM schedule w
  UNION ALL
  SELECT tutor_id, student_id, slot2 AS slot_at, w.today FROM schedule w
  UNION ALL
  SELECT tutor_id, student_id, slot3 AS slot_at, w.today FROM schedule w
), prepared AS (
  SELECT
    s.student_id,
    s.tutor_id,
    (ARRAY['Maths','Physique','Chimie','Français','Anglais'])[floor(random()*5)+1] AS subject,
    (ARRAY['Collège','Lycée','Supérieur'])[floor(random()*3)+1] AS level,
    (ARRAY['NOTA','AVA','TODA'])[floor(random()*3)+1] AS type,
    CASE
      WHEN s.slot_at::date < s.today THEN 'COMPLETED'
      WHEN s.slot_at::date = s.today THEN 'IN_PROGRESS'
      ELSE 'SCHEDULED'
    END AS status,
    s.slot_at AS started_at,
    CASE WHEN s.slot_at::date < s.today THEN s.slot_at + interval '60 minutes' ELSE NULL END AS completed_at,
    60 AS duration_minutes
  FROM slots s
), new_sessions AS (
  INSERT INTO public.sessions (
    student_id, tutor_id, subject, level, type, status, started_at, completed_at, duration_minutes
  )
  SELECT student_id, tutor_id, subject, level, type, status, started_at, completed_at, duration_minutes
  FROM prepared
  RETURNING id, student_id, tutor_id, status, started_at
), assessments AS (
  INSERT INTO public.session_assessments (
    session_id, student_id, tutor_id,
    concentration, participation, preparation, improvement, retention,
    comprehension, time_management, collaboration, notes, created_at, updated_at
  )
  SELECT
    ns.id,
    ns.student_id,
    ns.tutor_id,
    GREATEST(1, LEAST(5, floor(1 + random()*5)))::int, -- concentration
    GREATEST(1, LEAST(5, floor(1 + random()*5)))::int, -- participation
    GREATEST(1, LEAST(5, floor(1 + random()*5)))::int, -- preparation
    GREATEST(1, LEAST(5, floor(1 + random()*5)))::int, -- improvement
    GREATEST(1, LEAST(5, floor(1 + random()*5)))::int, -- retention
    GREATEST(1, LEAST(5, floor(1 + random()*5)))::int, -- comprehension
    GREATEST(1, LEAST(5, floor(1 + random()*5)))::int, -- time_management
    GREATEST(1, LEAST(5, floor(1 + random()*5)))::int, -- collaboration
    'Seed auto-générée',
    ns.started_at,
    ns.started_at
  FROM new_sessions ns
  WHERE ns.status = 'COMPLETED'
  RETURNING session_id
)
SELECT (SELECT COUNT(*) FROM new_sessions) AS sessions_inserted,
       (SELECT COUNT(*) FROM assessments) AS assessments_inserted;

COMMIT;


