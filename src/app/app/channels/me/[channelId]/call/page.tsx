"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDirectCall } from "@/hooks/useDirectCall";
import MeCallPage from "@/components/common/CallPage";
import { useMeCallContext } from "@/contexts/MeCallConetext.contexts";

export default function CallPage() {
  const { userId } = useParams<{ userId: string }>();
  const { meCallState } = useMeCallContext();
  const { startCall, acceptCall, declineCall, endCall } = useDirectCall(userId);
  console.log(
    "[CallPage] meCallState",
    meCallState.status,
    meCallState.isTimeout
  );
  console.log("this is quang minh callid:", meCallState.callId);

  useEffect(() => {
    if (userId && meCallState.status === "idle" && !meCallState.isTimeout) {
      startCall();
    }
  }, [userId, meCallState.status, meCallState.isTimeout, startCall]);

  return (
    <div className="h-screen flex items-center justify-center">
      {meCallState.status === "idle" && !meCallState.isTimeout && (
        <div className="text-center">
          <h1 className="text-xl mb-2">Preparing Call</h1>
          <p>Setting up connection...</p>
        </div>
      )}

      {meCallState.isTimeout && (
        <div className="text-center">
          <h1 className="text-xl mb-2">Call Timeout</h1>
          <p>The call request has timed out</p>
        </div>
      )}

      {meCallState.status === "ringing" && (
        <div className="text-center">
          <h1 className="text-xl mb-2">Incoming Call</h1>
          <p className="mb-4">{meCallState.caller_info?.username}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => acceptCall()}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Accept
            </button>
            <button
              onClick={() => declineCall()}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {meCallState.status === "calling" && (
        <div className="text-center">
          <h1 className="text-xl mb-2">Calling...</h1>
          <p className="mb-4">Connecting to {meCallState.callId}</p>
          <button
            onClick={() => endCall()}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            End Call
          </button>
        </div>
      )}

      {meCallState.status === "connected" && (
        <div className="text-center">
          <h1 className="text-xl mb-2">Connected</h1>
          <p className="mb-4">Call ID: {meCallState.callId}</p>
          {meCallState.callId && (
            <MeCallPage callId={meCallState.callId} endCall={endCall} />
          )}
        </div>
      )}
    </div>
  );
}
