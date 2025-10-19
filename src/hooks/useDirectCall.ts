"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";
import { getMeCallSocketIO } from "@/library/sooketioMeCall";
import { CallProps } from "@/interfaces/call.interfaces";

export function useDirectCall(targetUserId: string) {
  const socket = useRef(getMeCallSocketIO()).current;
  const router = useRouter();

  const [callState, setCallState] = useState<CallProps>({
    callId: null,
    status: "idle",
    isIncoming: false,
    isOutgoing: false,
    callerId: null,
    calleeId: null,
    error: null,
  });

  useEffect(() => {
    console.log("[useDirectCall] Global call me call ", callState);
  }, [callState]);

  const startCall = useCallback(() => {
    if (callState.status !== "idle") {
      console.warn("Cannot start call - already in call");
      return;
    }

    console.log("[useDirectCall] Starting call to:", targetUserId);
    socket.emit("startCall", {
      target_user_id: targetUserId,
    });
  }, [socket, callState.status, targetUserId]);

  const acceptCall = useCallback(() => {
    if (
      !callState.callId ||
      callState.status !== "ringing" ||
      !callState.isIncoming
    ) {
      console.warn("Cannot accept call - no incoming call");
      return;
    }

    console.log("[useDirectCall] Accepting call:", callState.callId);
    socket.emit("acceptCall", {
      call_id: callState.callId,
    });
  }, [socket, callState]);

  const declineCall = useCallback(() => {
    if (
      !callState.callId ||
      callState.status !== "ringing" ||
      !callState.isIncoming
    ) {
      console.warn("Cannot decline call - no incoming call");
      return;
    }

    console.log("[useDirectCall] Declining call:", callState.callId);
    socket.emit("declineCall", { call_id: callState.callId });
  }, [socket, callState]);

  const endCall = useCallback(() => {
    if (!callState.callId || callState.status === "idle") {
      console.warn("Cannot end call - no active call");
      return;
    }

    console.log("[useDirectCall] Ending call:", callState.callId);
    socket.emit("endCall", { call_id: callState.callId });
  }, [socket, callState]);

  const clearError = useCallback(() => {
    setCallState((prev) => ({ ...prev, error: null }));
  }, []);

  const handleDeclineCall = () => {
    declineCall();
    router.push(`/app/channels/me/${targetUserId}`);
  };

  const handleEndCall = () => {
    endCall();
    router.push(`/app/channels/me/${targetUserId}`);
  };

  return {
    // State
    callState,
    isInCall: callState.status === "connected",
    isRinging: callState.status === "ringing",
    isTimeout: callState.status === "timeout",
    isDeclined: callState.status === "declined",
    hasIncomingCall: callState.isIncoming && callState.status === "ringing",
    hasOutgoingCall: callState.isOutgoing && callState.status === "ringing",

    // Actions
    startCall,
    acceptCall,
    declineCall,
    endCall,
    clearError,
    handleDeclineCall,
    handleEndCall,
  };
}
