import 'server-only';
import { AccessToken } from 'livekit-server-sdk';

export type LiveKitTokenParams = {
  identity: string;
  name?: string;
  roomName: string;
  roomAdmin?: boolean;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  ttlSeconds?: number;
};

function getRequiredEnvVar(key: 'LIVEKIT_API_KEY' | 'LIVEKIT_API_SECRET'): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined`);
  }
  return value;
}

export async function createLiveKitToken(params: LiveKitTokenParams): Promise<string> {
  const {
    identity,
    name,
    roomName,
    roomAdmin = false,
    canPublish = true,
    canSubscribe = true,
    canPublishData = true,
    ttlSeconds = 60 * 60,
  } = params;

  if (!identity) {
    throw new Error('LiveKit token generation requires a non-empty identity');
  }
  if (!roomName) {
    throw new Error('LiveKit token generation requires a non-empty room name');
  }

  const apiKey = getRequiredEnvVar('LIVEKIT_API_KEY');
  const apiSecret = getRequiredEnvVar('LIVEKIT_API_SECRET');

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    ttl: ttlSeconds,
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    roomAdmin,
    canPublish,
    canSubscribe,
    canPublishData,
  });

  return token.toJwt();
}
