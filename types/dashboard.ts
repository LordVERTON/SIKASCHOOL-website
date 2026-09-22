/**
 * Types used by student (and tutor) dashboard API routes.
 * Align with Supabase selects; extend as needed for session_type, PENDING, etc.
 */

export interface DashboardSession {
  id: string;
  student_id: string | null;
  tutor_id: string | null;
  subject: string | null;
  level: string;
  session_type?: string;
  type?: string;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  topics_covered?: string[] | string | null;
  homework_assigned?: string | null;
  student_rating?: number | null;
  tutor_rating?: number | null;
  tutor_notes?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SessionParticipantLink {
  session_id: string;
}

export interface DashboardUser {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar_url?: string | null;
}

export interface DashboardMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  thread_id: string;
  subject?: string | null;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  data?: unknown;
}

export interface DashboardAssessment {
  id?: string;
  concentration?: number;
  participation?: number;
  preparation?: number;
  improvement?: number;
  retention?: number;
  comprehension?: number;
  time_management?: number;
  collaboration?: number;
}

export interface StudentProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  students?: Array<{ grade_level?: string; academic_goals?: string; created_at?: string }> | null;
  created_at?: string;
}
