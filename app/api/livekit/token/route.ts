import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createLiveKitToken } from "@/lib/livekit";
import { getUserSession } from "@/lib/auth-simple";
import { buildClassRoomName, resolveLiveClassMembership } from "@/lib/livekit-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  classId: z.string().min(1, "classId is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId } = parsed.data;
    const membership = await resolveLiveClassMembership(user.id, classId);

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const roomName = buildClassRoomName(classId);
    const token = await createLiveKitToken({
      identity: user.id,
      name: user.name,
      roomName,
      roomAdmin: membership.role === "instructor",
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return NextResponse.json({ token, role: membership.role, roomName });
  } catch (error) {
    console.error("LiveKit token endpoint error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
