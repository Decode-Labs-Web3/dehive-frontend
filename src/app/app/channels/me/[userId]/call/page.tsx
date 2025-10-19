"use client";

import { useParams, useRouter } from "next/navigation";
import { useDirectCall } from "@/hooks/useDirectCall";
import { useEffect } from "react";

export default function DirectCallPage() {
  const { userId } = useParams();
  const router = useRouter();

  // Use the direct call hook for Socket.IO call management
  const {
    callState,
    isInCall,
    isTimeout,
    hasIncomingCall,
    hasOutgoingCall,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    clearError,
  } = useDirectCall();

  // Auto-start call when component mounts
  useEffect(() => {
    if (userId && callState.status === "idle") {
      startCall(userId as string);
    }
  }, [userId, startCall, callState.status]);

  const handleAcceptCall = () => {
    acceptCall();
  };

  const handleDeclineCall = () => {
    declineCall();
    router.back();
  };

  // Handle ending the call
  const handleEndCall = () => {
    endCall();
    router.back();
  };

  const handleClearError = () => {
    clearError();
  };

  // Show error state
  if (callState.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Call Error</h2>
          <p className="text-gray-600 mb-6">{callState.error}</p>
          <button
            onClick={handleClearError}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Clear Error
          </button>
        </div>
      </div>
    );
  }

  // Show timeout state
  if (isTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-yellow-500 text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Call Timeout
          </h2>
          <p className="text-gray-600 mb-6">The call has timed out.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show incoming call state
  if (hasIncomingCall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-blue-500 text-6xl mb-4">📞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Incoming Call
          </h2>
          <p className="text-gray-600 mb-6">
            Call from user {callState.callerId}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleAcceptCall}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <span>✓</span>
              Accept
            </button>
            <button
              onClick={handleDeclineCall}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <span>✕</span>
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show outgoing call state
  if (hasOutgoingCall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-blue-500 text-6xl mb-4 animate-pulse">📞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Calling...</h2>
          <p className="text-gray-600 mb-6">
            Calling user {callState.calleeId}
          </p>

          <button
            onClick={handleEndCall}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Cancel Call
          </button>
        </div>
      </div>
    );
  }

  // Show connected call state
  if (isInCall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Call Connected
          </h2>
          <p className="text-gray-600 mb-6">You are now connected</p>

          <button
            onClick={handleEndCall}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            End Call
          </button>
        </div>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing call...</p>
      </div>
    </div>
  );
}
