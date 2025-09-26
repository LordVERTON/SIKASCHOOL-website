"use client";

import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

type LiveClassProps = {
  serverUrl: string;
  token: string;
  className?: string;
  onLeavePath?: string;
};

export default function LiveClass({ serverUrl, token, className, onLeavePath }: LiveClassProps) {
  const router = useRouter();
  const roomOptions = useMemo(
    () => ({
      video: true,
      audio: true,
    }),
    []
  );

  return (
    <div className={className ?? 'h-screen w-full'}>
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect
        {...roomOptions}
        data-lk-theme="default"
        onDisconnected={() => {
          if (onLeavePath) router.push(onLeavePath);
        }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
