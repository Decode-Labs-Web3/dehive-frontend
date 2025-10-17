"use client";

import { getMeCallSocketIO } from "@/library/sooketioMeCall";
import { useEffect, useRef, useState, useCallback } from "react";
import type {
  IncomingCallPayload,
  CallStartedPayload,
  CallAcceptedPayload,
  CallDeclinedPayload,
  CallEndedPayload,
  WsErrorPayload,
  ToggleMediaInbound,
} from "@/interfaces/websocketMeCall.interfaces";

export interface CallState {
  callId: string | null;
  status: "idle" | "ringing" | "connecting" | "connected" | "ended";
  isIncoming: boolean;
  isOutgoing: boolean;
  callerId: string | null;
  calleeId: string | null;
  withVideo: boolean;
  withAudio: boolean;
  error: string | null;
}

export function useDirectCall() {
  const socket = useRef(getMeCallSocketIO()).current;

  const [callState, setCallState] = useState<CallState>({
    callId: null,
    status: "idle",
    isIncoming: false,
    isOutgoing: false,
    callerId: null,
    calleeId: null,
    withVideo: false,
    withAudio: false,
    error: null,
  });

  // Handle incoming calls
  useEffect(() => {
    const onIncomingCall = (payload: IncomingCallPayload) => {
      console.log("[useDirectCall] Incoming call:", payload);
      setCallState({
        callId: payload.call_id,
        status: "ringing",
        isIncoming: true,
        isOutgoing: false,
        callerId: payload.caller_id,
        calleeId: null,
        withVideo: payload.with_video ?? false,
        withAudio: payload.with_audio ?? false,
        error: null,
      });
    };

    const onCallStarted = (payload: CallStartedPayload) => {
      console.log("[useDirectCall] Call started:", payload);
      setCallState((prev) => ({
        ...prev,
        status: "ringing",
        isOutgoing: true,
        isIncoming: false,
        calleeId: payload.target_user_id || null,
      }));
    };

    const onCallAccepted = (payload: CallAcceptedPayload) => {
      console.log("[useDirectCall] Call accepted:", payload);
      setCallState((prev) => ({
        ...prev,
        status: "connected",
        isIncoming: false,
        isOutgoing: false,
        calleeId: payload.callee_id || null,
        withVideo: payload.with_video ?? prev.withVideo,
        withAudio: payload.with_audio ?? prev.withAudio,
      }));
    };

    const onCallDeclined = (payload: CallDeclinedPayload) => {
      console.log("[useDirectCall] Call declined:", payload);
      setCallState({
        callId: null,
        status: "idle",
        isIncoming: false,
        isOutgoing: false,
        callerId: null,
        calleeId: null,
        withVideo: false,
        withAudio: false,
        error: null,
      });
    };

    const onCallEnded = (payload: CallEndedPayload) => {
      console.log("[useDirectCall] Call ended:", payload);
      setCallState({
        callId: null,
        status: "idle",
        isIncoming: false,
        isOutgoing: false,
        callerId: null,
        calleeId: null,
        withVideo: false,
        withAudio: false,
        error: null,
      });
    };

    const onError = (error: WsErrorPayload) => {
      console.error("[useDirectCall] Error:", error);
      setCallState((prev) => ({
        ...prev,
        error: error.message,
        status: "idle",
      }));
    };

    const onMediaToggled = (data: ToggleMediaInbound) => {
      console.log("[useDirectCall] Media toggled:", data);
      setCallState((prev) => ({
        ...prev,
        [data.media_type === "audio" ? "withAudio" : "withVideo"]:
          data.state === "enabled",
      }));
    };

    socket.on("incomingCall", onIncomingCall);
    socket.on("callStarted", onCallStarted);
    socket.on("callAccepted", onCallAccepted);
    socket.on("callDeclined", onCallDeclined);
    socket.on("callEnded", onCallEnded);
    socket.on("error", onError);
    socket.on("mediaToggled", onMediaToggled);

    return () => {
      socket.off("incomingCall", onIncomingCall);
      socket.off("callStarted", onCallStarted);
      socket.off("callAccepted", onCallAccepted);
      socket.off("callDeclined", onCallDeclined);
      socket.off("callEnded", onCallEnded);
      socket.off("error", onError);
      socket.off("mediaToggled", onMediaToggled);
    };
  }, [socket]);

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
    setCallState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    callState,
    isInCall: callState.status === "connected",
    isRinging: callState.status === "ringing",
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
