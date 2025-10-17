"use client";

import { useEffect, useMemo, useRef } from "react";

export default function VideoPanel({
  localStream,
  remoteStream,
}: {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const hasLiveCam = useMemo(
    () =>
      !!localStream
        ?.getVideoTracks()
        .some((t) => t.readyState === "live" && t.enabled),
    [localStream]
  );

  useEffect(() => {
    const el = localVideoRef.current;
    if (!el) return;
    el.srcObject = localStream ?? null;
    if (localStream) el.play().catch(() => {});
  }, [localStream]);

  useEffect(() => {
    const el = remoteVideoRef.current;
    if (!el) return;
    el.srcObject = remoteStream ?? null;
    if (remoteStream) el.play().catch(() => {});
  }, [remoteStream]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="relative rounded-xl overflow-hidden aspect-video bg-[#191b22]">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!hasLiveCam && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            Camera off
          </div>
        )}
        <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">
          You
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden aspect-video bg-[#191b22]">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            Waiting for connection...
          </div>
        )}
        <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">
          Remote User
        </div>
      </div>
    </div>
  );
}
