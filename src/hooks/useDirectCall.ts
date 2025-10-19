"use client";

import { useEffect, useRef, useCallback } from "react";
import { getMeCallSocketIO } from "@/library/sooketioMeCall";
import { useCallState } from "@/providers/socketMeCallProvider";

export interface CallState {
  callId: string | null;
  status: "idle" | "ringing" | "connecting" | "connected" | "ended" | "timeout";
  isIncoming: boolean;
  isOutgoing: boolean;
  callerId: string | null;
  calleeId: string | null;
  error: string | null;
}

export function useDirectCall() {
  const socket = useRef(getMeCallSocketIO()).current;
  console.log("socketio me call", socket);

  const { callState: globalCallState, setGlobalCallState } = useCallState();

  const callState = globalCallState;

  // Debug log to track state changes
  useEffect(() => {
    console.log("[useDirectCall] Global call me call ", callState);
  }, [callState]);

  // Note: Event handlers are already managed in the SocketMeCallProvider
  // This hook focuses on call actions and state access

  // Call actions
  const startCall = useCallback(
    (targetUserId: string) => {
      if (callState.status !== "idle") {
        console.warn("Cannot start call - already in call");
        return;
      }

      console.log("[useDirectCall] Starting call to:", targetUserId);
      socket.emit("startCall", {
        target_user_id: targetUserId,
      });
    },
    [socket, callState.status]
  );

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
    setGlobalCallState((prev) => ({ ...prev, error: null }));
  }, [setGlobalCallState]);

  return {
    // State
    callState,
    isInCall: callState.status === "connected",
    isRinging: callState.status === "ringing",
    isTimeout: callState.status === "timeout",
    hasIncomingCall: callState.isIncoming && callState.status === "ringing",
    hasOutgoingCall: callState.isOutgoing && callState.status === "ringing",

    // Actions
    startCall,
    acceptCall,
    declineCall,
    endCall,
    clearError,
  };
}
