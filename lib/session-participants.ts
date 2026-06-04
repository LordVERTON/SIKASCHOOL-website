import { supabaseAdmin } from "@/lib/supabase";

export async function syncSessionParticipants(
  sessionId: string,
  studentIds: string[]
) {
  const participantIds = Array.from(new Set(studentIds.filter(Boolean)));

  const { error: deleteError } = await (supabaseAdmin as any)
    .from("session_participants")
    .delete()
    .eq("session_id", sessionId);

  if (deleteError) {
    return { error: deleteError };
  }

  if (participantIds.length === 0) {
    return { error: null };
  }

  const rows = participantIds.map((studentId) => ({
    session_id: sessionId,
    student_id: studentId,
  }));

  const { error } = await (supabaseAdmin as any)
    .from("session_participants")
    .upsert(rows, { onConflict: "session_id,student_id" });

  return { error };
}

export async function getSessionParticipantsMap(sessionIds: string[]) {
  const ids = Array.from(new Set(sessionIds.filter(Boolean)));
  const participantsMap = new Map<string, string[]>();

  if (ids.length === 0) {
    return { participantsMap, error: null };
  }

  const { data, error } = await (supabaseAdmin as any)
    .from("session_participants")
    .select("session_id, student_id")
    .in("session_id", ids);

  if (error) {
    return { participantsMap, error };
  }

  for (const row of data || []) {
    const sessionId = row.session_id as string;
    const studentId = row.student_id as string;
    participantsMap.set(sessionId, [
      ...(participantsMap.get(sessionId) || []),
      studentId,
    ]);
  }

  return { participantsMap, error: null };
}

export function mergeSessionStudentIds(session: {
  id: string;
  student_id?: string | null;
}, participantsMap: Map<string, string[]>) {
  return Array.from(
    new Set([
      session.student_id,
      ...(participantsMap.get(session.id) || []),
    ].filter(Boolean))
  ) as string[];
}
