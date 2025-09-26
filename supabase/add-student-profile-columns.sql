-- Add profile-related columns to students table for the student dashboard profile section
-- Run this script in the Supabase SQL editor

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS grade_level VARCHAR(50),
  ADD COLUMN IF NOT EXISTS school_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'system', -- 'light' | 'dark' | 'system'
  ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_push BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_sms BOOLEAN DEFAULT false;
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'France',
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
  ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;
  
-- Optional: ensure updated_at trigger exists (created in schema files). If not, create it.
-- CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


