-- Add additional notification types for richer student notifications
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'PROFILE';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'PASSWORD';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'SESSION_UPDATE';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'TUTOR_ASSIGNMENT';


