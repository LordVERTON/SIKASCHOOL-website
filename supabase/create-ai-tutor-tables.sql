-- ============================================================
-- Sika AI - Tuteur Permanent (LangChain / LangGraph)
-- Tables pour les conversations et messages avec l'assistant IA
-- ============================================================

-- Table des conversations avec le tuteur IA
CREATE TABLE IF NOT EXISTS ai_tutor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nouvelle discussion',
  subject TEXT NULL,            -- Matière principale (Mathématiques, Physique, ...)
  level TEXT NULL,              -- Niveau (Collège, Lycée, ...)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tutor_conversations_user_id
  ON ai_tutor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_conversations_updated_at
  ON ai_tutor_conversations(updated_at DESC);

-- Table des messages échangés avec l'assistant
-- role: 'user' | 'assistant' | 'system' | 'tool'
-- images: tableau JSON de pièces jointes (urls ou data URLs)
-- metadata: infos techniques (outil utilisé, tokens, ...)
CREATE TABLE IF NOT EXISTS ai_tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_tutor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tutor_messages_conversation_id
  ON ai_tutor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_messages_created_at
  ON ai_tutor_messages(created_at);

-- Trigger pour maintenir updated_at à jour sur la conversation
CREATE OR REPLACE FUNCTION touch_ai_tutor_conversation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_tutor_conversations
    SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_ai_tutor_conversation ON ai_tutor_messages;
CREATE TRIGGER trg_touch_ai_tutor_conversation
  AFTER INSERT ON ai_tutor_messages
  FOR EACH ROW
  EXECUTE FUNCTION touch_ai_tutor_conversation();
