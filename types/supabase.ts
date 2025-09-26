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
          role: 'STUDENT' | 'TUTOR' | 'ADMIN';
          avatar_url: string | null;
          phone: string | null;
          date_of_birth: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          timezone: string;
          language: string;
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
          role: 'STUDENT' | 'TUTOR' | 'ADMIN';
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          timezone?: string;
          language?: string;
          is_active?: boolean;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          first_name?: string;
          last_name?: string;
          role?: 'STUDENT' | 'TUTOR' | 'ADMIN';
          avatar_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          timezone?: string;
          language?: string;
          is_active?: boolean;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tutors: {
        Row: {
          id: string;
          user_id: string;
          bio: string;
          experience_years: number;
          subjects: string[];
          is_available: boolean;
          hourly_rate_cents: number;
          rating: number;
          total_reviews: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio: string;
          experience_years: number;
          subjects: string[];
          is_available?: boolean;
          hourly_rate_cents?: number;
          rating?: number;
          total_reviews?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string;
          experience_years?: number;
          subjects?: string[];
          is_available?: boolean;
          hourly_rate_cents?: number;
          rating?: number;
          total_reviews?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          user_id: string;
          grade_level: string;
          academic_goals: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          grade_level: string;
          academic_goals: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          grade_level?: string;
          academic_goals?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          student_id: string;
          tutor_id: string;
          subject: string;
          level: string;
          type: 'NOTA' | 'AVA' | 'TODA';
          status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
          started_at: string | null;
          completed_at: string | null;
          duration_minutes: number;
          student_rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          tutor_id: string;
          subject: string;
          level: string;
          type: 'NOTA' | 'AVA' | 'TODA';
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
          started_at?: string | null;
          completed_at?: string | null;
          duration_minutes: number;
          student_rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          tutor_id?: string;
          subject?: string;
          level?: string;
          type?: 'NOTA' | 'AVA' | 'TODA';
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
          started_at?: string | null;
          completed_at?: string | null;
          duration_minutes?: number;
          student_rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      session_payments: {
        Row: {
          id: string;
          session_id: string;
          student_id: string;
          tutor_id: string;
          amount_cents: number;
          tutor_commission_cents: number;
          platform_commission_cents: number;
          status: 'PENDING' | 'PAID' | 'FAILED';
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          student_id: string;
          tutor_id: string;
          amount_cents: number;
          tutor_commission_cents: number;
          platform_commission_cents: number;
          status?: 'PENDING' | 'PAID' | 'FAILED';
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          student_id?: string;
          tutor_id?: string;
          amount_cents?: number;
          tutor_commission_cents?: number;
          platform_commission_cents?: number;
          status?: 'PENDING' | 'PAID' | 'FAILED';
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_credentials: {
        Row: {
          id: string;
          user_id: string;
          credential_type: string;
          credential_value: string;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credential_type: string;
          credential_value: string;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          credential_type?: string;
          credential_value?: string;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
