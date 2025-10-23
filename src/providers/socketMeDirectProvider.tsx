"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CallProps } from "@/interfaces/call.interfaces";
import { getDirectCallSocketIO } from "@/lib/sooketioDirectCall";
import { MeCallContext } from "@/contexts/MeCallConetext.contexts";
import {
  WsErrorPayload,
  IdentityConfirmed,
  IncomingCallPayload,
  CallAcceptedPayload,
  CallDeclinedPayload,
  CallEndedPayload,
  CallStartedPayload,
  CallTimeoutPayload,
} from "@/interfaces/websocketDirectCall.interfaces";

interface SocketMeCallProviderProps {
  userId: string;
  children: React.ReactNode;
}

export default function SocketMeCallProvider({
  userId,
  children,
}: SocketMeCallProviderProps) {
  const router = useRouter();
  const socket = useRef(getDirectCallSocketIO()).current;

  const [meCallState, setMeCallState] = useState<CallProps>({
    callId: null,
    status: "idle",
    isIncoming: false,
    isOutgoing: false,
    caller_info: null,
    callee_info: null,
    isTimeout: false,
  });

  useEffect(() => {
    const identify = () => {
      if (!userId) return;
      socket.emit("identity", userId);
    };

    const onConnect = () => {
      console.log("[mecall connect]");
      identify();
    };

    const onConnectError = (e: Error) => {
      console.warn("[mecall connect_error]", e);
    };

    const onDisconnect = (reason: string) => {
      console.log("[mecall disconnect]", reason);
    };

    const onError = (error: WsErrorPayload) => {
      console.warn("[mecall error]", error);
    };

    const onIdentityConfirmed = (p: IdentityConfirmed) => {
      console.log("[mecall identityConfirmed]", p);
    };

    const onIncoming = (payload: IncomingCallPayload) => {
      console.log("[incomingCall]", payload);
      setMeCallState((prev) => {
        return {
          ...prev,
          callId: payload.call_id,
          status: "ringing",
          isIncoming: true,
          caller_info: payload.caller_info || null,
          callee_info: null,
          isTimeout: false,
        };
      });
      // console.log("[incomingCall] caller_info", payload.caller_info?._id);
      router.push(`/app/channels/me/${payload.caller_info?._id}/call`);
    };

    const onStarted = (payload: CallStartedPayload) => {
      console.log("[callStarted]", payload);
      console.log("this is call id", payload.call_id);
      setMeCallState({
        callId: payload.call_id,
        status: "calling",
        isIncoming: false,
        isOutgoing: true,
        caller_info: null,
        callee_info: null,
        isTimeout: false,
      });
    };

    const onAccepted = (payload: CallAcceptedPayload) => {
      console.log("[callAccepted]", payload);
      setMeCallState({
        callId: payload.call_id,
        status: "connected",
        isIncoming: false,
        isOutgoing: false,
        caller_info: null,
        callee_info: null,
        isTimeout: false,
      });
    };

    const onDeclined = (payload: CallDeclinedPayload) => {
      console.log("[callDeclined]", payload);
      setMeCallState({
        callId: null,
        status: "idle",
        isIncoming: false,
        isOutgoing: false,
        caller_info: null,
        callee_info: null,
        isTimeout: true,
      });
      // console.log("[callDeclined] caller_id", payload.caller_id);
      // console.log("this is quang minh")
      router.push("/app/channels/me/");
      setTimeout(() => {
        setMeCallState((prev) => ({
          ...prev,
          isTimeout: false,
        }));
      }, 3000);
    };

    const onEnded = (payload: CallEndedPayload) => {
      console.log("[callEnded]", payload);
      setMeCallState({
        callId: null,
        status: "idle",
        isIncoming: false,
        isOutgoing: false,
        caller_info: null,
        callee_info: null,
        isTimeout: true,
      });
      // console.log("[callEnded] caller_id", payload.caller_id);
      // console.log("this is quang minh")
      router.push("/app/channels/me/");
      setTimeout(() => {
        setMeCallState((prev) => ({
          ...prev,
          isTimeout: false,
        }));
      }, 3000);
    };

    const onPong = (data: { timestamp: string; message: "pong" }) =>
      console.log("[pong]", data);

    const onTimeout = (payload: CallTimeoutPayload) => {
      console.log("[callTimeout]", payload);
      setMeCallState({
        callId: null,
        status: "idle",
        isIncoming: false,
        isOutgoing: false,
        caller_info: null,
        callee_info: null,
        isTimeout: true,
      });
      // console.log("[callTimeout] caller_id", payload.caller_id);
      // console.log("this is quang minh")
      router.push("/app/channels/me/");
      setTimeout(() => {
        setMeCallState((prev) => ({
          ...prev,
          isTimeout: false,
        }));
      }, 3000);
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);

    socket.on("error", onError);
    socket.on("identityConfirmed", onIdentityConfirmed);

    socket.on("incomingCall", onIncoming);
    socket.on("callStarted", onStarted);
    socket.on("callAccepted", onAccepted);
    socket.on("callDeclined", onDeclined);
    socket.on("callEnded", onEnded);
    socket.on("callTimeout", onTimeout);

    socket.on("pong", onPong);

    socket.connect();
    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);

      socket.off("error", onError);
      socket.off("identityConfirmed", onIdentityConfirmed);

      socket.off("incomingCall", onIncoming);
      socket.off("callStarted", onStarted);
      socket.off("callAccepted", onAccepted);
      socket.off("callDeclined", onDeclined);
      socket.off("callEnded", onEnded);
      socket.off("callTimeout", onTimeout);

      socket.off("pong", onPong);
    };
  }, [socket, userId, router, setMeCallState]);

  useEffect(() => {
    if (!socket.connected) return;
    if (userId) socket.emit("identity", userId);
  }, [userId, socket]);

  return (
    <>
      <MeCallContext.Provider value={{ meCallState, setMeCallState }}>
        {children}
      </MeCallContext.Provider>
    </>
  );
}
