-- Add parent accounts for the family space.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'PARENT';
