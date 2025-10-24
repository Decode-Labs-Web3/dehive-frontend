"use client";

import { useRef, useCallback } from "react";
import { getDirectCallSocketIO } from "@/lib/sooketioDirectCall";
import { useDirectCallContext } from "@/contexts/DirectCallConetext.contexts";

export function useDirectCall(targetUserId: string) {
  const socket = useRef(getDirectCallSocketIO()).current;
  const { meCallState } = useDirectCallContext();

  const startCall = useCallback(() => {
    if (meCallState.status !== "idle") {
      console.warn("Cannot start call - already in call");
      return;
    }

    console.log("[useDirectCall] Starting call to:", targetUserId);
    socket.emit("startCall", {
      target_user_id: targetUserId,
    });
  }, [socket, meCallState.status, targetUserId]);

  const acceptCall = useCallback(() => {
    if (
      !meCallState.call_id ||
      meCallState.status !== "ringing"
    ) {
      console.warn("Cannot accept call - no incoming call");
      return;
    }

    console.log("[useDirectCall] Accepting call:", meCallState.call_id);
    socket.emit("acceptCall", {
      call_id: meCallState.call_id,
    });
  }, [socket, meCallState]);

  const declineCall = useCallback(() => {
    if (
      !meCallState.call_id ||
      meCallState.status !== "ringing"
    ) {
      console.warn("Cannot decline call - no incoming call");
      return;
    }

    console.log("[useDirectCall] Declining call:", meCallState.call_id);
    socket.emit("declineCall", { call_id: meCallState.call_id });
  }, [socket, meCallState]);

  const endCall = useCallback(() => {
    if (!meCallState.call_id || meCallState.status === "idle") {
      console.warn("Cannot end call - no active call");
      return;
    }

    console.log("[useDirectCall] Ending call:", meCallState.call_id);
    socket.emit("endCall", { call_id: meCallState.call_id });
  }, [socket, meCallState]);

  return {
    // Actions
    startCall,
    acceptCall,
    declineCall,
    endCall,
  };
}
