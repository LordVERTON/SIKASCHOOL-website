import 'server-only';
import { supabaseAdmin } from '@/lib/supabase';

export const LIVEKIT_CLASS_ROOM_PREFIX = 'class_';

export type LiveClassRole = 'instructor' | 'student';

export type LiveClassMembership = {
  role: LiveClassRole;
  session: {
    id: string;
    tutor_id: string | null;
    student_id: string | null;
  };
};

export function buildClassRoomName(classId: string): string {
  return `${LIVEKIT_CLASS_ROOM_PREFIX}${classId}`;
}

export async function resolveLiveClassMembership(
  userId: string,
  classId: string
): Promise<LiveClassMembership | null> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('id,tutor_id,student_id')
    .eq('id', classId)
    .maybeSingle<{ id: string; tutor_id: string | null; student_id: string | null }>();

  if (error) {
    console.error('Failed to resolve class membership', error);
    throw new Error('Unable to resolve class membership');
  }

  if (!data) {
    return null;
  }

  const isInstructor = data.tutor_id === userId;
  const isStudent = data.student_id === userId;

  if (!isInstructor && !isStudent) {
    return null;
  }

  return {
    role: isInstructor ? 'instructor' : 'student',
    session: data,
  };
}
