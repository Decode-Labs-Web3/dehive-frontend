"use client";

import { useRef, useCallback } from "react";
import { getDirectCallSocketIO } from "@/lib/sooketioDirectCallSingleton";
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
    if (!meCallState.conversation_id || meCallState.status !== "ringing") {
      console.warn("Cannot accept call - no incoming call");
      return;
    }

    console.log("[useDirectCall] Accepting call:", meCallState.conversation_id);
    socket.emit("acceptCall", {
      conversation_id: meCallState.conversation_id,
    });
  }, [socket, meCallState]);

  const declineCall = useCallback(() => {
    if (!meCallState.conversation_id || meCallState.status !== "ringing") {
      console.warn("Cannot decline call - no incoming call");
      return;
    }

    console.log("[useDirectCall] Declining call:", meCallState.conversation_id);
    socket.emit("declineCall", {
      conversation_id: meCallState.conversation_id,
    });
  }, [socket, meCallState]);

  const endCall = useCallback(() => {
    if (!meCallState.conversation_id || meCallState.status === "idle") {
      console.warn("Cannot end call - no active call");
      return;
    }

    console.log("[useDirectCall] Ending call:", meCallState.conversation_id);
    socket.emit("endCall", { conversation_id: meCallState.conversation_id });
  }, [socket, meCallState]);

  return {
    startCall,
    acceptCall,
    declineCall,
    endCall,
  };
}
