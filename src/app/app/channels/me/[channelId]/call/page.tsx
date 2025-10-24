"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDirectCall } from "@/hooks/useDirectCall";
import MeCallPage from "@/components/common/CallPage";
import { useDirectCallContext } from "@/contexts/DirectCallConetext.contexts";

export default function CallPage() {
  const { userId } = useParams<{ userId: string }>();
  const { meCallState } = useDirectCallContext();
  const { startCall, acceptCall, declineCall, endCall } = useDirectCall(userId);
  console.log(
    "[CallPage] meCallState",
    meCallState.status,
  );
  console.log("this is quang minh callid:", meCallState.call_id);

  useEffect(() => {
    if (userId && meCallState.status === "idle") {
      startCall();
    }
  }, [userId, meCallState.status, startCall]);

  return (
    <div className="h-screen flex items-center justify-center">
      {meCallState.status === "idle" && (
        <div className="text-center">
          <h1 className="text-xl mb-2">Preparing Call</h1>
          <p>Setting up connection...</p>
        </div>
      )}

      {meCallState.status === "ended" && (
        <div className="text-center">
          <h1 className="text-xl mb-2">Call Timeout</h1>
          <p>The call request has timed out</p>
        </div>
      )}

      {meCallState.status === "ringing" && (
        <div className="text-center">
          <h1 className="text-xl mb-2">Incoming Call</h1>
          <p className="mb-4">{meCallState.user_info?.display_name}</p>
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
          <p className="mb-4">Connecting to {meCallState.user_info?.display_name}</p>
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
          <p className="mb-4">Call ID: {meCallState.user_info?.display_name}</p>
          {meCallState.call_id && (
            <MeCallPage callId={meCallState.call_id} endCall={endCall} />
          )}
        </div>
      )}
    </div>
  );
}
