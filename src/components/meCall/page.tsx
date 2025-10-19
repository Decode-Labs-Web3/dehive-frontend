"use client";

import { useDirectCall } from "@/hooks/useDirectCall";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserDataProps {
  _id: string;
  dehive_role: string;
  status: string;
  server_count: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  last_login: string;
  following_number: number;
  followers_number: number;
  is_active: boolean;
}

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const { callState, startCall, acceptCall, declineCall, endCall, clearError } =
    useDirectCall();
  const [userData, setUserData] = useState<UserDataProps | null>(null);
  const [otherUserData, setOtherUserData] = useState<UserDataProps | null>(
    null
  );

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setUserData(JSON.parse(userData));
    }
  }, []);

  // Get the other user ID from URL params
  const otherUserId = params?.userId as string;

  useEffect(() => {
    if (otherUserId && callState.status === "idle") {
      // Start a call when component mounts
      startCall(otherUserId);
    }
  }, [otherUserId, startCall, callState.status]);

  const handleAcceptCall = () => {
    acceptCall();
  };

  const handleDeclineCall = () => {
    declineCall();
    router.back();
  };

  const handleEndCall = () => {
    endCall();
    router.back();
  };

  const handleClearError = () => {
    clearError();
  };

  if (callState.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Call Error</h2>
          <p className="text-gray-700 mb-4">{callState.error}</p>
          <button
            onClick={handleClearError}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Clear Error
          </button>
        </div>
      </div>
    );
  }

  if (callState.status === "timeout") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">
            Call Timeout
          </h2>
          <p className="text-gray-700 mb-4">The call has timed out.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (callState.status === "ringing" && callState.isIncoming) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Incoming Call
            </h2>
            <p className="text-gray-600">Call from user {callState.callerId}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleAcceptCall}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Accept
            </button>
            <button
              onClick={handleDeclineCall}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (callState.status === "ringing" && callState.isOutgoing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Calling...
            </h2>
            <p className="text-gray-600">Calling user {callState.calleeId}</p>
          </div>

          <button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-medium transition-colors"
          >
            Cancel Call
          </button>
        </div>
      </div>
    );
  }

  if (callState.status === "connected") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Call Connected
            </h2>
            <p className="text-gray-600">You are now connected</p>
          </div>

          <button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-medium transition-colors"
          >
            End Call
          </button>
        </div>
      </div>
    );
  }

  // Default loading state
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Initializing call...</p>
      </div>
    </div>
  );
}
