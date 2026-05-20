import { createHmac } from "crypto";

type MercureEventType = "message" | "notification" | "session";

type MercurePayload = {
  type: MercureEventType;
  action: string;
  userId?: string;
  threadId?: string;
  sessionId?: string;
  timestamp?: string;
};

const hubUrl = process.env.MERCURE_URL || process.env.NEXT_PUBLIC_MERCURE_URL;
const publisherJwt = process.env.MERCURE_PUBLISHER_JWT;
const jwtSecret = process.env.MERCURE_JWT_SECRET;

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function createPublisherJwt() {
  if (publisherJwt) {
    return publisherJwt;
  }

  if (!jwtSecret) {
    return null;
  }

  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      mercure: { publish: ["*"] },
      exp: Math.floor(Date.now() / 1000) + 60,
    })
  );
  const signature = createHmac("sha256", jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

export function mercureUserTopic(userId: string) {
  return `https://sikaschool.app/realtime/users/${userId}`;
}

export function mercureThreadTopic(threadId: string) {
  return `https://sikaschool.app/realtime/messages/threads/${threadId}`;
}

export async function publishMercureUpdate(topics: string[], payload: MercurePayload) {
  if (!hubUrl || topics.length === 0) {
    return;
  }

  const jwt = createPublisherJwt();
  if (!jwt) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[mercure] MERCURE_PUBLISHER_JWT ou MERCURE_JWT_SECRET manquant, publication ignoree.");
    }
    return;
  }

  const body = new URLSearchParams();
  for (const topic of Array.from(new Set(topics))) {
    body.append("topic", topic);
  }
  body.set(
    "data",
    JSON.stringify({
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
    })
  );

  try {
    const response = await fetch(hubUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok && process.env.NODE_ENV === "development") {
      console.warn(`[mercure] Publication refusee par le hub (${response.status}).`);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[mercure] Hub injoignable, evenement ignore.", error);
    }
  }
}

export async function publishUserMercureUpdate(userIds: string[], payload: MercurePayload) {
  await publishMercureUpdate(
    userIds.filter(Boolean).map((userId) => mercureUserTopic(userId)),
    payload
  );
}

