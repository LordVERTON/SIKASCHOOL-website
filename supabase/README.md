# Supabase Setup Guide

This guide will help you set up Supabase for the SikaSchool application with student-tutor linked data and all other necessary data.

## 🚀 Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `sikaschool-db`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 2. Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### 3. Configure Environment Variables

Create/update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication (for custom auth system)
JWT_SECRET=your-super-secret-jwt-key-here

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### 4. Set Up the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

### 5. Insert Seed Data

1. In the **SQL Editor**, copy the contents of `supabase/seed.sql`
2. Paste it into the SQL Editor
3. Click **Run** to insert the test data

## 📊 Database Schema Overview

### Core Tables

- **`users`** - All users (students, tutors, admins)
- **`tutor_profiles`** - Tutor-specific information
- **`student_profiles`** - Student-specific information
- **`subjects`** - Available subjects (Math, Physics, etc.)
- **`courses`** - Course instances created by tutors
- **`lessons`** - Individual lessons within courses
- **`enrollments`** - Student enrollments in courses
- **`lesson_progress`** - Track student progress through lessons

### Learning Management

- **`assignments`** - Assignments created by tutors
- **`assignment_submissions`** - Student submissions
- **`message_threads`** - Communication threads
- **`messages`** - Individual messages
- **`notifications`** - System notifications

### Booking & Payment System

- **`plans`** - Pricing plans (packs, single sessions)
- **`purchases`** - Purchase records
- **`tutor_availability`** - Tutor availability schedule
- **`bookings`** - Scheduled sessions
- **`reviews`** - Student reviews of tutors

## 🔐 Security Features

### Row Level Security (RLS)

The schema includes comprehensive RLS policies:

- Users can only see their own data
- Students can see their tutors and course-related data
- Tutors can see their students
- Admins have full access

### Authentication

- Custom authentication system (no NextAuth dependency)
- Password hashing with bcrypt
- JWT tokens for session management
- Role-based access control (RBAC)

## 🧪 Test Accounts

After running the seed data, you'll have these test accounts:

### Admin
- **Email**: `admin@sikaschool.com`
- **Password**: `password123`
- **Role**: ADMIN

### Tutors
- **Email**: `tutor@sikaschool.com`
- **Password**: `password123`
- **Role**: TUTOR
- **Specializations**: Math, Physics, Chemistry

- **Email**: `marie.tutor@sikaschool.com`
- **Password**: `password123`
- **Role**: TUTOR
- **Specializations**: French, Literature, Philosophy

- **Email**: `pierre.tutor@sikaschool.com`
- **Password**: `password123`
- **Role**: TUTOR
- **Specializations**: SVT, Physics, Chemistry

### Students
- **Email**: `student@sikaschool.com`
- **Password**: `password123`
- **Role**: STUDENT
- **Grade**: Terminale

- **Email**: `sophie.student@sikaschool.com`
- **Password**: `password123`
- **Role**: STUDENT
- **Grade**: Première

- **Email**: `lucas.student@sikaschool.com`
- **Password**: `password123`
- **Role**: STUDENT
- **Grade**: Seconde

## 🔄 Data Relationships

### Student-Tutor Connections

1. **Direct Relationship**: Students and tutors are connected through:
   - `courses` table (tutor_id → user_id)
   - `enrollments` table (student_id → user_id)
   - `bookings` table (student_id, tutor_id)

2. **Communication**: Through message threads and notifications

3. **Progress Tracking**: Via lesson progress and assignment submissions

### Course Structure

```
Subject → Course → Lessons
    ↓
Tutor creates course
    ↓
Students enroll
    ↓
Progress tracked per lesson
```

## 🛠️ API Integration

The application uses these Supabase features:

- **Database**: PostgreSQL with full SQL support
- **Authentication**: Custom JWT-based system
- **Real-time**: For live updates (messages, notifications)
- **Storage**: For file uploads (assignments, avatars)
- **Edge Functions**: For complex business logic

## 📱 Next Steps

1. **Update API Routes**: Modify existing API routes to use Supabase
2. **Implement Real-time**: Add real-time subscriptions for live updates
3. **File Upload**: Set up Supabase Storage for file handling
4. **Email Integration**: Configure email templates for notifications
5. **Payment Integration**: Connect with payment providers

## 🔧 Troubleshooting

### Common Issues

1. **RLS Policies**: If you can't see data, check RLS policies
2. **Foreign Keys**: Ensure all referenced IDs exist
3. **Permissions**: Verify service role key has proper permissions
4. **Environment Variables**: Double-check all environment variables

### Useful Queries

```sql
-- Check all users
SELECT id, email, first_name, last_name, role FROM users;

-- Check enrollments
SELECT u.email, c.title, e.status, e.progress_percentage
FROM enrollments e
JOIN users u ON e.student_id = u.id
JOIN courses c ON e.course_id = c.id;

-- Check tutor-student relationships
SELECT 
    t.first_name || ' ' || t.last_name as tutor_name,
    s.first_name || ' ' || s.last_name as student_name,
    c.title as course_title
FROM courses c
JOIN users t ON c.tutor_id = t.id
JOIN enrollments e ON c.id = e.course_id
JOIN users s ON e.student_id = s.id;
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)