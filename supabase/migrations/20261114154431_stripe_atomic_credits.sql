BEGIN;

-- Abort on legacy duplicates: reconciling real money must be deliberate.
CREATE UNIQUE INDEX payments_stripe_invoice_unique ON public.payments (stripe_invoice_id);
ALTER TABLE public.student_credit_ledger
  ADD COLUMN stripe_event_id text,
  ADD COLUMN stripe_source_ref text;
CREATE UNIQUE INDEX credit_ledger_stripe_event_unique
  ON public.student_credit_ledger (stripe_event_id);
CREATE UNIQUE INDEX credit_ledger_stripe_source_unique
  ON public.student_credit_ledger (stripe_source_ref);

-- Only the signed, server-side webhook (service_role) may call this function.
-- INVOKER preserves the caller's table permissions and RLS.
CREATE FUNCTION public.apply_stripe_payment(p_event_id text, p_payment jsonb)
RETURNS TABLE (payment_id uuid, applied boolean)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_payment public.payments%ROWTYPE;
  v_existing public.payments%ROWTYPE;
  v_source text;
  v_ledger public.student_credit_ledger%ROWTYPE;
  v_reason text;
BEGIN
  v_payment := jsonb_populate_record(NULL::public.payments, p_payment);
  IF p_event_id IS NULL OR p_event_id NOT LIKE 'evt_%'
     OR v_payment.student_id IS NULL OR v_payment.plan_id IS NULL
     OR v_payment.kind IS NULL OR v_payment.kind NOT IN ('PACK', 'SESSION', 'SUBSCRIPTION')
     OR v_payment.level IS NULL OR v_payment.level NOT IN ('COLLEGE', 'LYCEE', 'SUPERIEUR')
     OR v_payment.sessions_count IS NULL OR v_payment.sessions_count <= 0
     OR v_payment.amount_cents IS NULL OR v_payment.amount_cents < 0
     OR v_payment.currency IS NULL OR v_payment.currency !~ '^[A-Z]{3}$'
     OR v_payment.paid_at IS NULL THEN
    RAISE EXCEPTION 'Invalid Stripe payment contract' USING ERRCODE = '22023';
  END IF;
  IF v_payment.kind = 'SUBSCRIPTION' THEN
    IF v_payment.stripe_invoice_id IS NULL OR v_payment.stripe_checkout_session IS NOT NULL THEN
      RAISE EXCEPTION 'Missing subscription invoice' USING ERRCODE = '22023';
    END IF;
    v_source := 'invoice:' || v_payment.stripe_invoice_id;
    v_reason := 'SUBSCRIPTION_RENEWAL';
  ELSE
    IF v_payment.stripe_checkout_session IS NULL THEN
      RAISE EXCEPTION 'Missing checkout session' USING ERRCODE = '22023';
    END IF;
    v_source := 'checkout:' || v_payment.stripe_checkout_session;
    v_reason := CASE v_payment.kind WHEN 'PACK' THEN 'PACK_PURCHASE' ELSE 'SESSION_PURCHASE' END;
  END IF;

  -- Serializes both different events for one invoice and retries of one event.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_source, 0));
  SELECT * INTO v_ledger FROM public.student_credit_ledger l
    WHERE l.stripe_source_ref = v_source OR l.stripe_event_id = p_event_id;
  IF FOUND THEN
    IF v_ledger.stripe_source_ref <> v_source OR v_ledger.student_id <> v_payment.student_id
       OR v_ledger.level <> v_payment.level OR v_ledger.delta <> v_payment.sessions_count THEN
      RAISE EXCEPTION 'Stripe payment reference mismatch' USING ERRCODE = '22023';
    END IF;
    RETURN QUERY SELECT v_ledger.payment_id, false;
    RETURN;
  END IF;

  SELECT * INTO v_existing FROM public.payments p
    WHERE (v_payment.stripe_checkout_session IS NOT NULL AND p.stripe_checkout_session = v_payment.stripe_checkout_session)
       OR (v_payment.stripe_invoice_id IS NOT NULL AND p.stripe_invoice_id = v_payment.stripe_invoice_id)
    FOR UPDATE;
  IF FOUND THEN
    -- Old ledger entries have no reliable Stripe reference. Never guess and recredit.
    IF v_existing.status IN ('PAID', 'REFUNDED') THEN
      RAISE EXCEPTION 'Legacy payment requires reconciliation' USING ERRCODE = 'P0001';
    END IF;
    IF v_existing.student_id <> v_payment.student_id THEN
      RAISE EXCEPTION 'Stripe payment owner mismatch' USING ERRCODE = '22023';
    END IF;
    UPDATE public.payments SET status = 'PAID', paid_at = v_payment.paid_at,
      amount_cents = v_payment.amount_cents, currency = v_payment.currency,
      sessions_count = v_payment.sessions_count, plan_id = v_payment.plan_id,
      kind = v_payment.kind, level = v_payment.level,
      stripe_payment_intent = v_payment.stripe_payment_intent,
      hosted_invoice_url = v_payment.hosted_invoice_url, invoice_pdf_url = v_payment.invoice_pdf_url
    WHERE id = v_existing.id RETURNING * INTO v_payment;
  ELSE
    INSERT INTO public.payments (student_id, stripe_customer_id, stripe_checkout_session,
      stripe_payment_intent, stripe_invoice_id, stripe_subscription_id, plan_id, kind,
      level, sessions_count, amount_cents, currency, status, paid_at, hosted_invoice_url, invoice_pdf_url)
    VALUES (v_payment.student_id, v_payment.stripe_customer_id, v_payment.stripe_checkout_session,
      v_payment.stripe_payment_intent, v_payment.stripe_invoice_id, v_payment.stripe_subscription_id,
      v_payment.plan_id, v_payment.kind, v_payment.level, v_payment.sessions_count,
      v_payment.amount_cents, v_payment.currency, 'PAID', v_payment.paid_at,
      v_payment.hosted_invoice_url, v_payment.invoice_pdf_url)
    RETURNING * INTO v_payment;
  END IF;

  INSERT INTO public.student_credit_ledger
    (student_id, level, delta, reason, payment_id, stripe_event_id, stripe_source_ref)
  VALUES (v_payment.student_id, v_payment.level, v_payment.sessions_count, v_reason,
    v_payment.id, p_event_id, v_source);
  INSERT INTO public.student_credits (student_id, level, remaining_sessions, total_purchased, total_consumed)
  VALUES (v_payment.student_id, v_payment.level, v_payment.sessions_count, v_payment.sessions_count, 0)
  ON CONFLICT (student_id, level) DO UPDATE SET
    remaining_sessions = public.student_credits.remaining_sessions + EXCLUDED.remaining_sessions,
    total_purchased = public.student_credits.total_purchased + EXCLUDED.total_purchased;
  RETURN QUERY SELECT v_payment.id, true;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_stripe_payment(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_payment(text, jsonb) TO service_role;
COMMIT;
