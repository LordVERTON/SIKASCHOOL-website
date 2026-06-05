-- Store the parent linked to a student directly on the student profile.
DROP TABLE IF EXISTS parent_student_links;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS parents_linked UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_students_parents_linked ON students(parents_linked);

CREATE OR REPLACE FUNCTION public.validate_student_parent_link_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parents_linked IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.parents_linked AND role = 'PARENT') THEN
    RAISE EXCEPTION 'parents_linked must reference a PARENT user';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_student_parent_link_role ON students;
CREATE TRIGGER trg_validate_student_parent_link_role
  BEFORE INSERT OR UPDATE OF parents_linked
  ON students
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_student_parent_link_role();
