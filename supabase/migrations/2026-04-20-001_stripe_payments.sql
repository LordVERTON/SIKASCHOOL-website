-- =============================================================
-- Migration : Intégration Stripe (packs, séances, abonnements)
-- Date : 2026-04-20
-- =============================================================
-- À exécuter dans Supabase SQL Editor (ou via supabase db push).
-- Aucune donnée existante n'est modifiée/supprimée.
-- =============================================================

-- 1) Référence Stripe Customer sur l'utilisateur
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- 2) Table centrale des paiements Stripe (source de vérité côté SikaSchool)
--    Un row = une Checkout Session OU un Invoice (abonnement récurrent)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Références Stripe
  stripe_customer_id      VARCHAR(255),
  stripe_checkout_session VARCHAR(255) UNIQUE,
  stripe_payment_intent   VARCHAR(255),
  stripe_invoice_id       VARCHAR(255),
  stripe_subscription_id  VARCHAR(255),

  -- Description du produit acheté (snapshot)
  plan_id        VARCHAR(100) NOT NULL,           -- ex: pack_eco_college
  kind           VARCHAR(20)  NOT NULL,           -- PACK | SESSION | SUBSCRIPTION
  level          VARCHAR(20),                     -- COLLEGE | LYCEE | SUPERIEUR
  sessions_count INTEGER DEFAULT 0,               -- nb de séances créditées

  -- Montants
  amount_cents   INTEGER NOT NULL,
  currency       VARCHAR(3) DEFAULT 'EUR',

  -- Statut
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING | PAID | FAILED | REFUNDED | CANCELED

  -- Métadonnées
  receipt_url TEXT,
  hosted_invoice_url TEXT,
  invoice_pdf_url TEXT,

  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at    TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_payments_student_id    ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status        ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at    ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_kind          ON payments(kind);
CREATE INDEX IF NOT EXISTS idx_payments_subscription  ON payments(stripe_subscription_id);

-- 3) Solde de séances créditées par famille et par niveau
--    Chaque pack acheté crédite N séances sur le niveau correspondant
CREATE TABLE IF NOT EXISTS student_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL,            -- COLLEGE | LYCEE | SUPERIEUR
  remaining_sessions INTEGER NOT NULL DEFAULT 0,
  total_purchased    INTEGER NOT NULL DEFAULT 0,
  total_consumed     INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, level)
);

CREATE INDEX IF NOT EXISTS idx_student_credits_student ON student_credits(student_id);

-- 4) Historique d'activité sur les crédits (audit)
CREATE TABLE IF NOT EXISTS student_credit_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL,
  delta INTEGER NOT NULL,                -- +N (achat) / -N (consommation)
  reason VARCHAR(50) NOT NULL,           -- PACK_PURCHASE | SUBSCRIPTION_RENEWAL | SESSION_CONSUMED | ADJUSTMENT
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_student ON student_credit_ledger(student_id);

-- 5) Abonnements actifs (projection simplifiée de l'objet Stripe Subscription)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id     VARCHAR(255),
  plan_id                VARCHAR(100) NOT NULL,
  level                  VARCHAR(20),

  status VARCHAR(30) NOT NULL,
    -- active | trialing | past_due | canceled | unpaid | incomplete | incomplete_expired

  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end   TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at          TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_student ON subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);

-- 6) Trigger d'update automatique du updated_at
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_student_credits_updated_at ON student_credits;
CREATE TRIGGER trg_student_credits_updated_at
  BEFORE UPDATE ON student_credits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- Fin de migration --
