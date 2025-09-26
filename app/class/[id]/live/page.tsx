import { redirect, notFound } from "next/navigation";
import LiveClass from "@/components/LiveClass";
import { createLiveKitToken } from "@/lib/livekit";
import { getUserSession } from "@/lib/auth-simple";
import { buildClassRoomName, resolveLiveClassMembership } from "@/lib/livekit-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  params?: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const user = await getUserSession();
  if (!user) {
    redirect("/auth/signin");
  }

  const resolved = params ? await params : undefined;
  const classId = resolved?.id;
  if (!classId) {
    return notFound();
  }
  const membership = await resolveLiveClassMembership(user.id, classId);

  if (!membership) {
    return notFound();
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL;
  if (!serverUrl) {
    throw new Error("NEXT_PUBLIC_LIVEKIT_SERVER_URL is missing");
  }

  const token = await createLiveKitToken({
    identity: user.id,
    name: user.name,
    roomName: buildClassRoomName(classId),
    roomAdmin: membership.role === "instructor",
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return <LiveClass serverUrl={serverUrl} token={token} />;
}
