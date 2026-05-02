-- Satisfy Supabase database linter: enable RLS on all public tables exposed to PostgREST.
-- Application API routes use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- Direct anon access is denied unless a policy exists (faqs, reviews, subjects SELECT).

-- Messagerie : les politiques sont déjà définies dans la migration initiale.
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Liste matières (route /api/subjects utilise la clé anon).
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subjects_select_public" ON public.subjects;
CREATE POLICY "subjects_select_public" ON public.subjects FOR SELECT USING (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
