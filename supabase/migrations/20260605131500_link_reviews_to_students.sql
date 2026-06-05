-- Link public reviews to student accounts while preserving display names.
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS tutor_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_student_id ON reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tutor_id ON reviews(tutor_id);

UPDATE reviews
SET student_id = users.id
FROM users
WHERE reviews.student_id IS NULL
  AND lower(trim(reviews.student_name)) = lower(trim(concat_ws(' ', users.first_name, users.last_name)))
  AND users.role = 'STUDENT';
