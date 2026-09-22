export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_tutor_conversations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          level: string | null
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          level?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          level?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          images: Json
          metadata: Json
          role: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          images?: Json
          metadata?: Json
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          images?: Json
          metadata?: Json
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_tutor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      message_thread_participants: {
        Row: {
          joined_at: string
          role: string | null
          thread_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          role?: string | null
          thread_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          role?: string | null
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_thread_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string | null
          thread_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          thread_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_pdf_url: string | null
          kind: string
          level: string | null
          metadata: Json | null
          paid_at: string | null
          plan_id: string
          receipt_url: string | null
          sessions_count: number | null
          status: string
          stripe_checkout_session: string | null
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent: string | null
          stripe_subscription_id: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          kind: string
          level?: string | null
          metadata?: Json | null
          paid_at?: string | null
          plan_id: string
          receipt_url?: string | null
          sessions_count?: number | null
          status?: string
          stripe_checkout_session?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent?: string | null
          stripe_subscription_id?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          kind?: string
          level?: string | null
          metadata?: Json | null
          paid_at?: string | null
          plan_id?: string
          receipt_url?: string | null
          sessions_count?: number | null
          status?: string
          stripe_checkout_session?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent?: string | null
          stripe_subscription_id?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          email_verified: boolean | null
          first_name: string
          id: string
          is_active: boolean | null
          language: string | null
          last_name: string
          phone: string | null
          postal_code: string | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          email_verified?: boolean | null
          first_name: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_name: string
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          rating: number | null
          student_id: string | null
          student_name: string
          student_role: string | null
          tutor_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating?: number | null
          student_id?: string | null
          student_name: string
          student_role?: string | null
          tutor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating?: number | null
          student_id?: string | null
          student_name?: string
          student_role?: string | null
          tutor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_assessments: {
        Row: {
          collaboration: number
          comprehension: number
          concentration: number
          created_at: string | null
          id: string
          improvement: number
          notes: string | null
          participation: number
          preparation: number
          retention: number
          session_id: string | null
          student_id: string | null
          time_management: number
          tutor_id: string | null
          updated_at: string | null
        }
        Insert: {
          collaboration: number
          comprehension: number
          concentration: number
          created_at?: string | null
          id?: string
          improvement: number
          notes?: string | null
          participation: number
          preparation: number
          retention: number
          session_id?: string | null
          student_id?: string | null
          time_management: number
          tutor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          collaboration?: number
          comprehension?: number
          concentration?: number
          created_at?: string | null
          id?: string
          improvement?: number
          notes?: string | null
          participation?: number
          preparation?: number
          retention?: number
          session_id?: string | null
          student_id?: string | null
          time_management?: number
          tutor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_assessments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_assessments_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          added_at: string | null
          id: string
          session_id: string
          student_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          session_id: string
          student_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          session_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_participants_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          payment_type: string
          platform_fee_cents: number | null
          processed_at: string | null
          session_id: string | null
          student_id: string | null
          tutor_commission_cents: number | null
          tutor_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          payment_type: string
          platform_fee_cents?: number | null
          processed_at?: string | null
          session_id?: string | null
          student_id?: string | null
          tutor_commission_cents?: number | null
          tutor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          payment_type?: string
          platform_fee_cents?: number | null
          processed_at?: string | null
          session_id?: string | null
          student_id?: string | null
          tutor_commission_cents?: number | null
          tutor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_payments_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          homework_assigned: string | null
          id: string
          level: string
          payment_amount_cents: number | null
          payment_status: string | null
          session_type: string
          started_at: string
          status: string | null
          student_id: string | null
          student_notes: string | null
          student_rating: number | null
          subject: string | null
          topics_covered: string[] | null
          tutor_id: string | null
          tutor_notes: string | null
          tutor_rating: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          homework_assigned?: string | null
          id?: string
          level: string
          payment_amount_cents?: number | null
          payment_status?: string | null
          session_type: string
          started_at: string
          status?: string | null
          student_id?: string | null
          student_notes?: string | null
          student_rating?: number | null
          subject?: string | null
          topics_covered?: string[] | null
          tutor_id?: string | null
          tutor_notes?: string | null
          tutor_rating?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          homework_assigned?: string | null
          id?: string
          level?: string
          payment_amount_cents?: number | null
          payment_status?: string | null
          session_type?: string
          started_at?: string
          status?: string | null
          student_id?: string | null
          student_notes?: string | null
          student_rating?: number | null
          subject?: string | null
          topics_covered?: string[] | null
          tutor_id?: string | null
          tutor_notes?: string | null
          tutor_rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_credit_ledger: {
        Row: {
          created_at: string | null
          delta: number
          id: string
          level: string
          payment_id: string | null
          reason: string
          session_id: string | null
          student_id: string
        }
        Insert: {
          created_at?: string | null
          delta: number
          id?: string
          level: string
          payment_id?: string | null
          reason: string
          session_id?: string | null
          student_id: string
        }
        Update: {
          created_at?: string | null
          delta?: number
          id?: string
          level?: string
          payment_id?: string | null
          reason?: string
          session_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_credit_ledger_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_credit_ledger_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_credit_ledger_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_credits: {
        Row: {
          created_at: string | null
          id: string
          level: string
          remaining_sessions: number
          student_id: string
          total_consumed: number
          total_purchased: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: string
          remaining_sessions?: number
          student_id: string
          total_consumed?: number
          total_purchased?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          remaining_sessions?: number
          student_id?: string
          total_consumed?: number
          total_purchased?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_credits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_goals: string | null
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          email_verified: boolean | null
          emergency_contact: string | null
          first_name: string | null
          grade_level: string | null
          id: string
          is_active: boolean | null
          language: string | null
          last_name: string | null
          learning_style: string | null
          mfa_enabled: boolean | null
          notify_email: boolean | null
          notify_push: boolean | null
          notify_sms: boolean | null
          parent_email: string | null
          parent_phone: string | null
          parents_linked: string | null
          phone: string | null
          postal_code: string | null
          school_name: string | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          academic_goals?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_verified?: boolean | null
          emergency_contact?: string | null
          first_name?: string | null
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_name?: string | null
          learning_style?: string | null
          mfa_enabled?: boolean | null
          notify_email?: boolean | null
          notify_push?: boolean | null
          notify_sms?: boolean | null
          parent_email?: string | null
          parent_phone?: string | null
          parents_linked?: string | null
          phone?: string | null
          postal_code?: string | null
          school_name?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          academic_goals?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_verified?: boolean | null
          emergency_contact?: string | null
          first_name?: string | null
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_name?: string | null
          learning_style?: string | null
          mfa_enabled?: boolean | null
          notify_email?: boolean | null
          notify_push?: boolean | null
          notify_sms?: boolean | null
          parent_email?: string | null
          parent_phone?: string | null
          parents_linked?: string | null
          phone?: string | null
          postal_code?: string | null
          school_name?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_parents_linked_fkey"
            columns: ["parents_linked"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          level: string | null
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          level?: string | null
          plan_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          level?: string | null
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_student_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          student_id: string | null
          tutor_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          student_id?: string | null
          tutor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          student_id?: string | null
          tutor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_student_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_student_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_student_assignments_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutors: {
        Row: {
          bio: string | null
          created_at: string | null
          experience_years: number | null
          hourly_rate_cents: number | null
          id: string
          is_available: boolean | null
          rating: number | null
          subjects: string[] | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate_cents?: number | null
          id?: string
          is_available?: boolean | null
          rating?: number | null
          subjects?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate_cents?: number | null
          id?: string
          is_available?: boolean | null
          rating?: number | null
          subjects?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_security_challenges: {
        Row: {
          created_at: string | null
          credential_type: string
          credential_value: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credential_type: string
          credential_value?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credential_type?: string
          credential_value?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_security_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          notifications: Json
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          notifications?: Json
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          notifications?: Json
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_tutor_to_student: {
        Args: {
          p_assigned_by?: string
          p_notes?: string
          p_student_id: string
          p_tutor_id: string
        }
        Returns: string
      }
      deassign_tutor_from_student: {
        Args: { p_student_id: string; p_tutor_id: string }
        Returns: boolean
      }
      get_student_assigned_tutors: {
        Args: { p_student_id: string }
        Returns: {
          assigned_at: string
          bio: string
          experience_years: number
          is_available: boolean
          notes: string
          subjects: string[]
          tutor_avatar: string
          tutor_email: string
          tutor_id: string
          tutor_name: string
        }[]
      }
    }
    Enums: {
      notification_type:
        | "ASSIGNMENT"
        | "MESSAGE"
        | "BOOKING"
        | "PAYMENT"
        | "SYSTEM"
        | "PROFILE"
        | "PASSWORD"
        | "SESSION_UPDATE"
        | "TUTOR_ASSIGNMENT"
      user_role: "ADMIN" | "TUTOR" | "STUDENT" | "PARENT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_type: [
        "ASSIGNMENT",
        "MESSAGE",
        "BOOKING",
        "PAYMENT",
        "SYSTEM",
        "PROFILE",
        "PASSWORD",
        "SESSION_UPDATE",
        "TUTOR_ASSIGNMENT",
      ],
      user_role: ["ADMIN", "TUTOR", "STUDENT", "PARENT"],
    },
  },
} as const

