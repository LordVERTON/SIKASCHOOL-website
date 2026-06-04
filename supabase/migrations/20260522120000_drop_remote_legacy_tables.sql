-- Remote cleanup for legacy tables that predate the consolidated schema.
-- The current app has no assignment submission workflow or persisted tutor
-- timeslot grid; tutor availability is stored as `tutors.is_available`.

DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
DROP TABLE IF EXISTS public.tutor_availability CASCADE;
