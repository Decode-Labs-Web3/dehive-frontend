"use client";

import { getMeCallSocketIO } from "@/library/sooketioMeCall";
import { useEffect, useRef, useCallback } from "react";
import { useCallState } from "@/providers/socketMeCallProvider";
import type { StreamInfo } from "@/interfaces/websocketMeCall.interfaces";

export interface CallState {
  callId: string | null;
  status: "idle" | "ringing" | "connecting" | "connected" | "ended" | "timeout";
  isIncoming: boolean;
  isOutgoing: boolean;
  callerId: string | null;
  calleeId: string | null;
  withVideo: boolean;
  withAudio: boolean;
  error: string | null;
  streamInfo: StreamInfo | null;
}

export function useDirectCall() {
  const socket = useRef(getMeCallSocketIO()).current;

  // Use global call state from provider
  const { callState: globalCallState, setGlobalCallState } = useCallState();

  // Note: Local state removed - using global state from provider

  // Use global state as primary source
  const callState = globalCallState;

  // Debug log to track state changes
  useEffect(() => {
    console.log("[useDirectCall] Global call me call ", callState);
  }, [callState]);

  // Note: Event handlers are already managed in the SocketMeCallProvider
  // This hook focuses on call actions and state access

  // Call actions
  const startCall = useCallback(
    (
      targetUserId: string,
      options: { withVideo?: boolean; withAudio?: boolean } = {}
    ) => {
      if (callState.status !== "idle") {
        console.warn("Cannot start call - already in call");
        return;
      }

      console.log("[useDirectCall] Starting call to:", targetUserId);
      socket.emit("startCall", {
        target_user_id: targetUserId,
        with_video: options.withVideo ?? true,
        with_audio: options.withAudio ?? true,
      });
    },
    [socket, callState.status]
  );

  const acceptCall = useCallback(
    (options: { withVideo?: boolean; withAudio?: boolean } = {}) => {
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
        with_video: options.withVideo ?? callState.withVideo,
        with_audio: options.withAudio ?? callState.withAudio,
      });
    },
    [socket, callState]
  );

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

  const toggleMedia = useCallback(
    (mediaType: "audio" | "video", state: "enabled" | "disabled") => {
      if (!callState.callId || callState.status !== "connected") {
        console.warn("Cannot toggle media - no active call");
        return;
      }

      console.log("[useDirectCall] Toggling media:", mediaType, state);
      socket.emit("toggleMedia", {
        call_id: callState.callId,
        media_type: mediaType,
        state,
      });
    },
    [socket, callState]
  );

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
    toggleMedia,
    clearError,
  };
}
