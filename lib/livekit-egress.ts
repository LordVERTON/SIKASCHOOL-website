import 'server-only';
import { EgressClient } from 'livekit-server-sdk';
import { buildClassRoomName } from '@/lib/livekit-access';

function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not defined`);
  return v;
}

function getLiveKitHttpBaseUrl(): string {
  // Prefer explicit LIVEKIT_HTTP_URL (e.g., https://your-livekit-host)
  const explicit = process.env.LIVEKIT_HTTP_URL;
  if (explicit) return explicit;
  // Fallback: derive from NEXT_PUBLIC_LIVEKIT_SERVER_URL (wss:// -> https://)
  const ws = process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL;
  if (!ws) throw new Error('LIVEKIT_HTTP_URL or NEXT_PUBLIC_LIVEKIT_SERVER_URL must be set');
  return ws.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
}

export function getEgressClient(): EgressClient {
  const baseUrl = getLiveKitHttpBaseUrl();
  const apiKey = getRequiredEnv('LIVEKIT_API_KEY');
  const apiSecret = getRequiredEnv('LIVEKIT_API_SECRET');
  return new EgressClient(baseUrl, apiKey, apiSecret);
}

export type StartRecordingResult = { egressId: string };

export async function startRoomCompositeRecording(params: { classId: string }): Promise<StartRecordingResult> {
  const client = getEgressClient();
  const roomName = buildClassRoomName(params.classId);

  // S3-compatible output
  const bucket = getRequiredEnv('EGRESS_S3_BUCKET');
  const accessKey = getRequiredEnv('EGRESS_S3_ACCESS_KEY');
  const secretKey = getRequiredEnv('EGRESS_S3_SECRET_KEY');
  const region = process.env.EGRESS_S3_REGION || 'auto';
  const endpoint = process.env.EGRESS_S3_ENDPOINT; // optional

  const pathPrefix = `recordings/${params.classId}/`;

  // Use flexible any to accommodate SDK type variations across versions
  const fileOutput: any = {
    s3: {
      bucket,
      accessKey,
      secret: secretKey,
      region,
      endpoint,
      forcePathStyle: Boolean(endpoint),
    },
    fileType: 'MP4',
    filenamePrefix: pathPrefix,
  };

  // Try modern signature: (roomName, options, output)
  const info = await (client as any).startRoomCompositeEgress(
    roomName,
    { layout: 'grid', audioOnly: false, videoOnly: false },
    fileOutput
  );
  return { egressId: info.egressId! };
}

export async function stopRecording(egressId: string): Promise<void> {
  const client = getEgressClient();
  await client.stopEgress(egressId);
}


