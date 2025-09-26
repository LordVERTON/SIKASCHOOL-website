import { createClient } from '@supabase/supabase-js';

// Simplified types for our database
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          first_name: string;
          last_name: string;
          role: 'ADMIN' | 'TUTOR' | 'STUDENT';
          avatar_url: string | null;
          phone: string | null;
          is_active: boolean;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          first_name: string;
          last_name: string;
          role?: 'ADMIN' | 'TUTOR' | 'STUDENT';
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          email_verified?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          first_name?: string;
          last_name?: string;
          role?: 'ADMIN' | 'TUTOR' | 'STUDENT';
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          email_verified?: boolean;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          subject_id: string | null;
          tutor_id: string;
          level: string;
          cover_image_url: string | null;
          price_per_hour: number | null;
          total_hours: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          subject_id?: string | null;
          tutor_id: string;
          level: string;
          cover_image_url?: string | null;
          price_per_hour?: number | null;
          total_hours?: number;
          is_published?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          subject_id?: string | null;
          tutor_id?: string;
          level?: string;
          cover_image_url?: string | null;
          price_per_hour?: number | null;
          total_hours?: number;
          is_published?: boolean;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          content_url: string | null;
          duration_minutes: number;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          content_url?: string | null;
          duration_minutes?: number;
          order_index: number;
          is_published?: boolean;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          content_url?: string | null;
          duration_minutes?: number;
          order_index?: number;
          is_published?: boolean;
        };
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
          enrolled_at: string;
          completed_at: string | null;
          progress_percentage: number;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          status?: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
          progress_percentage?: number;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string;
          status?: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
          completed_at?: string | null;
          progress_percentage?: number;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          student_id: string;
          lesson_id: string;
          is_completed: boolean;
          completed_at: string | null;
          time_watched_seconds: number;
          last_watched_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          lesson_id: string;
          is_completed?: boolean;
          completed_at?: string | null;
          time_watched_seconds?: number;
          last_watched_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          lesson_id?: string;
          is_completed?: boolean;
          completed_at?: string | null;
          time_watched_seconds?: number;
          last_watched_at?: string | null;
        };
      };
      assignments: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          instructions: string | null;
          due_date: string | null;
          max_score: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description: string;
          instructions?: string | null;
          due_date?: string | null;
          max_score?: number;
          is_published?: boolean;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          instructions?: string | null;
          due_date?: string | null;
          max_score?: number;
          is_published?: boolean;
        };
      };
      assignment_submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          content: string | null;
          file_urls: string[] | null;
          status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
          submitted_at: string | null;
          graded_at: string | null;
          score: number | null;
          feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          content?: string | null;
          file_urls?: string[] | null;
          status?: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
          submitted_at?: string | null;
          graded_at?: string | null;
          score?: number | null;
          feedback?: string | null;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          content?: string | null;
          file_urls?: string[] | null;
          status?: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
          submitted_at?: string | null;
          graded_at?: string | null;
          score?: number | null;
          feedback?: string | null;
        };
      };
      message_threads: {
        Row: {
          id: string;
          subject: string;
          course_id: string | null;
          created_by: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject: string;
          course_id?: string | null;
          created_by?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          subject?: string;
          course_id?: string | null;
          created_by?: string | null;
          is_active?: boolean;
        };
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          content: string;
          attachment_urls: string[] | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          sender_id: string;
          content: string;
          attachment_urls?: string[] | null;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          thread_id?: string;
          sender_id?: string;
          content?: string;
          attachment_urls?: string[] | null;
          is_read?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'ASSIGNMENT' | 'MESSAGE' | 'BOOKING' | 'PAYMENT' | 'SYSTEM';
          title: string;
          message: string;
          data: any | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'ASSIGNMENT' | 'MESSAGE' | 'BOOKING' | 'PAYMENT' | 'SYSTEM';
          title: string;
          message: string;
          data?: any | null;
          is_read?: boolean;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'ASSIGNMENT' | 'MESSAGE' | 'BOOKING' | 'PAYMENT' | 'SYSTEM';
          title?: string;
          message?: string;
          data?: any | null;
          is_read?: boolean;
          read_at?: string | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          student_id: string;
          tutor_id: string;
          course_id: string | null;
          type: 'TRIAL' | 'REGULAR' | 'PACK';
          status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
          scheduled_at: string;
          duration_minutes: number;
          meeting_url: string | null;
          notes: string | null;
          price_cents: number | null;
          credits_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          tutor_id: string;
          course_id?: string | null;
          type: 'TRIAL' | 'REGULAR' | 'PACK';
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
          scheduled_at: string;
          duration_minutes?: number;
          meeting_url?: string | null;
          notes?: string | null;
          price_cents?: number | null;
          credits_used?: number;
        };
        Update: {
          id?: string;
          student_id?: string;
          tutor_id?: string;
          course_id?: string | null;
          type?: 'TRIAL' | 'REGULAR' | 'PACK';
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
          scheduled_at?: string;
          duration_minutes?: number;
          meeting_url?: string | null;
          notes?: string | null;
          price_cents?: number | null;
          credits_used?: number;
        };
      };
      sessions: {
        Row: {
          id: string;
          booking_id: string;
          student_id: string;
          tutor_id: string;
          course_id: string | null;
          session_type: string;
          level: string;
          started_at: string;
          ended_at: string | null;
          duration_minutes: number | null;
          status: string;
          topics_covered: string[] | null;
          homework_assigned: string | null;
          student_notes: string | null;
          tutor_notes: string | null;
          student_rating: number | null;
          tutor_rating: number | null;
          payment_status: string;
          payment_amount_cents: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          student_id: string;
          tutor_id: string;
          course_id?: string | null;
          session_type: string;
          level: string;
          started_at: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          status?: string;
          topics_covered?: string[] | null;
          homework_assigned?: string | null;
          student_notes?: string | null;
          tutor_notes?: string | null;
          student_rating?: number | null;
          tutor_rating?: number | null;
          payment_status?: string;
          payment_amount_cents?: number | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          student_id?: string;
          tutor_id?: string;
          course_id?: string | null;
          session_type?: string;
          level?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          status?: string;
          topics_covered?: string[] | null;
          homework_assigned?: string | null;
          student_notes?: string | null;
          tutor_notes?: string | null;
          student_rating?: number | null;
          tutor_rating?: number | null;
          payment_status?: string;
          payment_amount_cents?: number | null;
        };
      };
      session_payments: {
        Row: {
          id: string;
          session_id: string;
          student_id: string;
          tutor_id: string;
          amount_cents: number;
          currency: string;
          payment_type: string;
          payment_status: string;
          payment_method: string | null;
          payment_reference: string | null;
          tutor_commission_cents: number | null;
          platform_fee_cents: number | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          student_id: string;
          tutor_id: string;
          amount_cents: number;
          currency?: string;
          payment_type: string;
          payment_status?: string;
          payment_method?: string | null;
          payment_reference?: string | null;
          tutor_commission_cents?: number | null;
          platform_fee_cents?: number | null;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          student_id?: string;
          tutor_id?: string;
          amount_cents?: number;
          currency?: string;
          payment_type?: string;
          payment_status?: string;
          payment_method?: string | null;
          payment_reference?: string | null;
          tutor_commission_cents?: number | null;
          platform_fee_cents?: number | null;
          processed_at?: string | null;
        };
      };
      pricing_rules: {
        Row: {
          id: string;
          session_type: string;
          level: string;
          price_per_hour_cents: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_type: string;
          level: string;
          price_per_hour_cents: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          session_type?: string;
          level?: string;
          price_per_hour_cents?: number;
          is_active?: boolean;
        };
      };
      user_credentials: {
        Row: {
          id: string;
          user_id: string;
          credential_type: string;
          credential_value: string | null;
          is_active: boolean;
          last_used_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credential_type: string;
          credential_value?: string | null;
          is_active?: boolean;
          last_used_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          credential_type?: string;
          credential_value?: string | null;
          is_active?: boolean;
          last_used_at?: string | null;
          expires_at?: string | null;
        };
      };
    };
  };
}

// Client Supabase simple (pour les API routes)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Client Supabase avec service role (pour les opérations admin)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);