"use client";

import { useEffect, useState } from "react";
import { useDirectCall } from "@/hooks/useDirectCall";
import VideoPanel from "@/components/meCall/VideoPanel";
import CallControls from "@/components/meCall/CallControls";
import IncomingCallModal from "@/components/meCall/IncomingCallModal";
import { useParams } from "next/navigation";

export default function DirectCallPage() {
  const { userId } = useParams() as { userId: string };
  const {
    callId,
    localStream,
    remoteStream,
    incomingCall,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    muteMic,
    muteCam,
    initMedia,
  } = useDirectCall();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // 👇 ADD: Auto-sync state với actual tracks khi stream thay đổi
  useEffect(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      const videoTrack = localStream.getVideoTracks()[0];

      if (audioTrack) setMicOn(audioTrack.enabled);
      if (videoTrack) setCamOn(videoTrack.enabled);
    }
  }, [localStream]);

  useEffect(() => {
    // mở camera/mic preview khi vào trang
    initMedia().catch(() => {});
  }, [initMedia]);

  const handleToggleMic = (enabled: boolean) => {
    setMicOn(enabled);
    muteMic(enabled);
  };

  const handleToggleCam = (enabled: boolean) => {
    setCamOn(enabled);
    muteCam(enabled);
  };

  const showIncoming = useMemo(() => Boolean(incomingCall), [incomingCall]);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Direct Call</h1>
        {!callId && (
          <button
            onClick={() => startCall(userId)}
            className="rounded-xl px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
          >
            📞 Call User #{userId}
          </button>
        )}
      </div>

      {/* Video Panel */}
      <div className="flex-1 mb-6">
        <VideoPanel localStream={localStream} remoteStream={remoteStream} />
      </div>

      {/* Call Status */}
      {callId && (
        <div className="text-center mb-4 text-gray-400">
          Call ID: <span className="font-mono text-indigo-400">{callId}</span>
        </div>
      )}

      {/* Controls */}
      <CallControls
        onHangup={endCall}
        onToggleMic={handleToggleMic}
        onToggleCam={handleToggleCam}
        micOn={micOn}
        camOn={camOn}
        disabled={!callId}
      />

      {/* Incoming Call Modal */}
      <IncomingCallModal
        open={showIncoming}
        callerName={incomingCall?.caller_id || "Unknown"}
        onAccept={() => incomingCall && acceptCall(incomingCall.call_id)}
        onDecline={() => incomingCall && declineCall(incomingCall.call_id)}
      />
    </div>
  );
}
