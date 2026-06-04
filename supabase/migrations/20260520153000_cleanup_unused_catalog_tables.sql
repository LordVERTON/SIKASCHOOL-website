-- Cleanup tables from the old course/catalog workflow that are no longer used
-- by the current SikaSchool app.
--
-- Current app flows store sessions directly in `sessions`, subject labels in
-- `sessions.subject`, Stripe purchases in `payments`/`student_credits`, and
-- tutor/student links in `tutor_student_assignments`.

ALTER TABLE public.sessions
  DROP COLUMN IF EXISTS booking_id,
  DROP COLUMN IF EXISTS course_id;

DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.availabilities CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.pricing_rules CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;

DROP TYPE IF EXISTS public.enrollment_status;
DROP TYPE IF EXISTS public.assignment_status;
DROP TYPE IF EXISTS public.booking_status;
DROP TYPE IF EXISTS public.booking_type;
DROP TYPE IF EXISTS public.plan_type;
DROP TYPE IF EXISTS public.purchase_status;
