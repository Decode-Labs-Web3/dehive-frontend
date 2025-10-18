"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCallState } from "@/providers/socketMeCallProvider";
import type { StreamInfo } from "@/interfaces/websocketMeCall.interfaces";

export interface StreamCallState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  callId: string | null;
  token: string | null;
  streamInfo: StreamInfo | null;
  cameraStream: MediaStream | null;
  microphoneStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export function useStreamCall() {
  const { callState } = useCallState();
  const [streamState, setStreamState] = useState<StreamCallState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    callId: null,
    token: null,
    streamInfo: null,
    cameraStream: null,
    microphoneStream: null,
    remoteStream: null,
  });

  const streamCallRef = useRef<{
    id?: string;
    state?: { status: string };
    call?: unknown;
    client?: unknown;
    camera: {
      enable: () => Promise<unknown>;
      disable: () => Promise<void>;
      state: unknown;
    };
    microphone: {
      enable: () => Promise<unknown>;
      disable: () => Promise<void>;
      state: unknown;
    };
    leave: () => Promise<void>;
  } | null>(null);

  const initializeStreamCall = useCallback(async () => {
    if (!callState.streamInfo) {
      console.error("[useStreamCall] No stream info available");
      return;
    }

    setStreamState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const streamInfo = callState.streamInfo;

      // Determine if current user is caller or callee
      const isCaller =
        callState.isOutgoing || callState.callerId === callState.callerId;
      const token = isCaller ? streamInfo.callerToken : streamInfo.calleeToken;

      console.log("[useStreamCall] Initializing Stream call with:", {
        callId: streamInfo.callId,
        token: token,
        isCaller,
        apiKey: streamInfo.streamConfig.apiKey,
      });

      // Use full Stream.io SDK
      console.log("[useStreamCall] Creating Stream.io call object...");

      // Import Stream.io SDK
      const { StreamVideoClient } = await import("@stream-io/video-react-sdk");

      // Create Stream.io client
      const client = new StreamVideoClient({
        apiKey: streamInfo.streamConfig.apiKey,
        token,
        user: {
          id: isCaller
            ? streamInfo.streamConfig.members[0].user_id
            : streamInfo.streamConfig.members[1].user_id,
          name: isCaller ? "Caller" : "Callee",
        },
      });

      // Connect user to Stream.io
      // Use the correct token for the current user
      const callerUserId = streamInfo.streamConfig.members[0].user_id;
      const calleeUserId = streamInfo.streamConfig.members[1].user_id;

      // Use the appropriate token based on whether we're the caller or callee
      const userToken = isCaller
        ? streamInfo.callerToken
        : streamInfo.calleeToken;
      const userId = isCaller ? callerUserId : calleeUserId;

      if (!userId || !userToken) {
        throw new Error("User ID or token not found in stream info");
      }

      console.log("[useStreamCall] Using user ID:", userId);
      console.log(
        "[useStreamCall] Using token:",
        userToken.substring(0, 50) + "..."
      );

      await client.connectUser(
        {
          id: userId,
          name: isCaller ? "Caller" : "Callee",
        },
        userToken
      );

      // Create Stream.io call
      const call = client.call("default", streamInfo.callId);

      // Join the call
      await call.join({
        create: true,
      });

      // Enable camera and microphone by default
      await call.camera.enable();
      await call.microphone.enable();

      // Create a wrapper object that provides the same interface
      const streamCallWrapper = {
        // Stream.io call properties
        id: streamInfo.callId,
        state: { status: "joined" },
        call: call,
        client: client,

        // Camera controls
        camera: {
          enable: async () => {
            console.log("Stream.io Camera enabled");
            await call.camera.enable();
            return null;
          },
          disable: async () => {
            console.log("Stream.io Camera disabled");
            await call.camera.disable();
          },
          state: call.camera.state,
        },

        // Microphone controls
        microphone: {
          enable: async () => {
            console.log("Stream.io Microphone enabled");
            await call.microphone.enable();
            return null;
          },
          disable: async () => {
            console.log("Stream.io Microphone disabled");
            await call.microphone.disable();
          },
          state: call.microphone.state,
        },

        // Leave call
        leave: async () => {
          console.log("Leaving Stream.io call");
          await call.leave();
        },
      };

      streamCallRef.current = streamCallWrapper;

      setStreamState({
        isConnected: true,
        isConnecting: false,
        error: null,
        callId: streamInfo.callId,
        token,
        streamInfo,
        cameraStream: null,
        microphoneStream: null,
        remoteStream: null,
      });

      console.log(
        "[useStreamCall] Successfully connected to Stream call with camera and mic enabled"
      );
    } catch (error) {
      console.error("[useStreamCall] Failed to initialize Stream call:", error);
      setStreamState((prev) => ({
        ...prev,
        isConnecting: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to Stream",
      }));
    }
  }, [callState.streamInfo, callState.isOutgoing, callState.callerId]);

  // Initialize Stream.io when call is connected and we have stream info
  useEffect(() => {
    if (
      callState.status === "connected" &&
      callState.streamInfo &&
      !streamState.isConnected &&
      !streamState.isConnecting
    ) {
      initializeStreamCall();
    }
  }, [
    callState.status,
    callState.streamInfo,
    initializeStreamCall,
    streamState.isConnected,
    streamState.isConnecting,
  ]);

  // Clean up when call ends
  useEffect(() => {
    if (callState.status === "idle" || callState.status === "ended") {
      if (streamCallRef.current) {
        console.log("[useStreamCall] Call ended, cleaning up Stream call");
        streamCallRef.current = null;
      }
      setStreamState({
        isConnected: false,
        isConnecting: false,
        error: null,
        callId: null,
        token: null,
        streamInfo: null,
        cameraStream: null,
        microphoneStream: null,
        remoteStream: null,
      });
    }
  }, [
    callState.status,
    callState.callerId,
    callState.calleeId,
    callState.streamInfo,
    initializeStreamCall,
  ]);

  const toggleCamera = useCallback(async () => {
    if (streamCallRef.current) {
      try {
        const isEnabled = (
          streamCallRef.current.camera.state as { isEnabled: boolean }
        ).isEnabled;
        if (isEnabled) {
          await streamCallRef.current.camera.disable();
          setStreamState((prev) => ({ ...prev, cameraStream: null }));
          console.log("[useStreamCall] Camera disabled");
        } else {
          const stream = await streamCallRef.current.camera.enable();
          setStreamState((prev) => ({
            ...prev,
            cameraStream: stream as MediaStream,
          }));
          console.log("[useStreamCall] Camera enabled with stream:", stream);
        }
      } catch (error) {
        console.error("[useStreamCall] Error toggling camera:", error);
      }
    }
  }, []);

  const toggleMicrophone = useCallback(async () => {
    if (streamCallRef.current) {
      try {
        const isEnabled = (
          streamCallRef.current.microphone.state as { isEnabled: boolean }
        ).isEnabled;
        if (isEnabled) {
          await streamCallRef.current.microphone.disable();
          setStreamState((prev) => ({ ...prev, microphoneStream: null }));
          console.log("[useStreamCall] Microphone disabled");
        } else {
          const stream = await streamCallRef.current.microphone.enable();
          setStreamState((prev) => ({
            ...prev,
            microphoneStream: stream as MediaStream,
          }));
          console.log(
            "[useStreamCall] Microphone enabled with stream:",
            stream
          );
        }
      } catch (error) {
        console.error("[useStreamCall] Error toggling microphone:", error);
      }
    }
  }, []);

  const leaveCall = useCallback(async () => {
    console.log("[useStreamCall] Leave call");
    if (streamCallRef.current) {
      try {
        await streamCallRef.current.leave();
        console.log("[useStreamCall] Successfully left Stream call");
      } catch (error) {
        console.error("[useStreamCall] Error leaving call:", error);
      }
      streamCallRef.current = null;
    }
    setStreamState((prev) => ({ ...prev, isConnected: false }));
  }, []);

  return {
    // State
    streamState,
    streamCall: streamCallRef.current,

    // Computed
    isStreamReady:
      streamState.isConnected &&
      streamState.streamInfo &&
      streamCallRef.current,

    // Actions
    toggleCamera,
    toggleMicrophone,
    leaveCall,
  };
}
