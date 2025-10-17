"use client";

import { useParams } from "next/navigation";
import { useDirectCall } from "@/hooks/useDirectCall";

export default function DirectCallPage() {
  const { userId } = useParams();

  // Use the direct call hook for Socket.IO call management
  const {
    callState,
    isInCall,
    hasIncomingCall,
    hasOutgoingCall,
    startCall,
    acceptCall,
    declineCall,
    endCall,
  } = useDirectCall();

  // Handle starting a call through Socket.IO
  const handleStartCall = async () => {
    if (!userId) return;
    startCall(userId as string, { withVideo: true, withAudio: true });
  };

  // Handle accepting an incoming call
  const handleAcceptCall = async () => {
    acceptCall({ withVideo: true, withAudio: true });
  };

  // Handle declining an incoming call
  const handleDeclineCall = () => {
    declineCall();
  };

  // Handle ending the call
  const handleEndCall = () => {
    endCall();
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b1614] text-white p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Direct Call (Socket.IO Only)</h1>

        {/* Call Controls based on call state */}
        {callState.status === "idle" && (
          <button
            onClick={handleStartCall}
            className="rounded-xl px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
            disabled={!userId}
          >
            📞 Call User #{userId}
          </button>
        )}

        {hasIncomingCall && (
          <div className="flex gap-3">
            <button
              onClick={handleAcceptCall}
              className="rounded-xl px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
            >
              ✅ Accept
            </button>
            <button
              onClick={handleDeclineCall}
              className="rounded-xl px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
            >
              ❌ Decline
            </button>
          </div>
        )}

        {hasOutgoingCall && (
          <div className="flex items-center gap-3">
            <span className="text-yellow-400">📞 Ringing...</span>
            <button
              onClick={handleEndCall}
              className="rounded-xl px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
            >
              ✕ Cancel
            </button>
          </div>
        )}

        {isInCall && (
          <button
            onClick={handleEndCall}
            className="rounded-xl px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
          >
            ✕ End Call
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full rounded-xl bg-[#191b22] flex flex-col items-center justify-center text-gray-300">
          {callState.status === "idle" && (
            <div className="text-center">
              <div className="text-6xl mb-4">📞</div>
              <h2 className="text-xl font-semibold mb-2">Ready to Call</h2>
              <p className="text-gray-400">
                Click the call button to start a call with User #{userId}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                (Stream.io video will be added after backend fix)
              </p>
            </div>
          )}

          {hasIncomingCall && (
            <div className="text-center">
              <div className="text-6xl mb-4">📞</div>
              <h2 className="text-xl font-semibold mb-2">Incoming Call</h2>
              <p className="text-gray-400">
                User {callState.callerId} is calling you
              </p>
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={handleAcceptCall}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={handleDeclineCall}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {hasOutgoingCall && (
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">📞</div>
              <h2 className="text-xl font-semibold mb-2">Calling...</h2>
              <p className="text-gray-400">
                Waiting for User #{userId} to answer outgoing call
              </p>
            </div>
          )}

          {callState.status === "ringing" &&
            !hasIncomingCall &&
            !hasOutgoingCall && (
              <div className="text-center">
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-xl font-semibold mb-2">Connecting...</h2>
                <p className="text-gray-400">Setting up your call</p>
              </div>
            )}

          {isInCall && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold mb-2">Call Connected!</h2>
              <p className="text-gray-400">
                Socket.IO call is active. Video will be added after backend fix.
              </p>
              <div className="mt-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm">
                    ✅ Socket.IO call established
                  </p>
                  <p className="text-green-400 text-sm">
                    ⏳ Stream.io video integration pending
                  </p>
                </div>
              </div>
            </div>
          )}

          {callState.error && (
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2 text-red-400">Error</h2>
              <p className="text-red-300">{callState.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
