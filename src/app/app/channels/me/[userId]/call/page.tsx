"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDirectCall } from "@/hooks/useDirectCall";
import { useMeCallContext } from "@/contexts/MeCallConetext.contexts";

export default function CallPage() {
  const { userId } = useParams<{ userId: string }>();
  const { meCallState } = useMeCallContext();
  const { startCall, acceptCall, declineCall, endCall } = useDirectCall(userId);
  console.log("[CallPage] meCallState", meCallState.status, meCallState.isTimeout);

  useEffect(() => {
    if (userId && meCallState.status === "idle" && !meCallState.isTimeout) {
      startCall();
    }
  }, [userId, meCallState.status, meCallState.isTimeout, startCall]);

  return (
    <>
      {meCallState.status === "idle" && !meCallState.isTimeout && (
        <div>
          <h1>Idle Page</h1>
        </div>
      )}

      {meCallState.isTimeout && (
        <div>
          <h1>Timeout Page</h1>
        </div>
      )}

      {meCallState.status === "ringing" && (
        <div>
          <h1>Ringing Page</h1>
          <h1>{meCallState.caller_info?.username}</h1>
          <button onClick={() => acceptCall()}>Accept</button>
          <button onClick={() => declineCall()}>Decline</button>
        </div>
      )}

      {meCallState.status === "calling" && (
        <div>
          <h1>Calling Page</h1>
          <h1>{meCallState.callId}</h1>
          <button onClick={() => endCall()}>End Call</button>
        </div>
      )}

      {meCallState.status === "connected" && (
        <div>
          <h1>Connected Page</h1>
          <h1>{meCallState.callId}</h1>
          <button onClick={() => endCall()}>End Call</button>
        </div>
      )}
    </>
  );
}
