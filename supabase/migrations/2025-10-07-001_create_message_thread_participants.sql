-- Create participants table for many-to-many message threads (idempotent)
CREATE TABLE IF NOT EXISTS public.message_thread_participants (
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_mtp_user_id ON public.message_thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_mtp_thread_id ON public.message_thread_participants(thread_id);

-- Backfill from existing messages
INSERT INTO public.message_thread_participants (thread_id, user_id)
SELECT DISTINCT m.thread_id, m.sender_id
FROM public.messages m
LEFT JOIN public.message_thread_participants mtp
  ON mtp.thread_id = m.thread_id AND mtp.user_id = m.sender_id
JOIN public.message_threads mt ON mt.id = m.thread_id
WHERE mt.is_active = TRUE
  AND mtp.user_id IS NULL;


