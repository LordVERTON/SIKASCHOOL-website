-- Create participants table for many-to-many message threads
CREATE TABLE IF NOT EXISTS message_thread_participants (
    thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NULL, -- optional participant role within the thread
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (thread_id, user_id)
);

-- Helpful index for fetching a user's threads quickly
CREATE INDEX IF NOT EXISTS idx_mtp_user_id ON message_thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_mtp_thread_id ON message_thread_participants(thread_id);

-- Backfill participants for existing 1:1 threads from messages senders
-- This associates all distinct senders in a thread as participants
INSERT INTO message_thread_participants (thread_id, user_id)
SELECT DISTINCT m.thread_id, m.sender_id
FROM messages m
LEFT JOIN message_thread_participants mtp
  ON mtp.thread_id = m.thread_id AND mtp.user_id = m.sender_id
JOIN message_threads mt ON mt.id = m.thread_id AND mt.is_active = TRUE
WHERE mtp.user_id IS NULL;

-- Optional: relax any 1:1 constraints left by prior cleanup, keeping threads active
-- No-op here: existing APIs will stop filtering to exactly two roles.


