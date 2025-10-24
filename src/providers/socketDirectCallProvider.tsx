"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CallProps } from "@/interfaces/call.interface";
import { getDirectCallSocketIO } from "@/lib/sooketioDirectCall";
import { DirectCallContext } from "@/contexts/DirectCallConetext.contexts";
import {
  WsErrorPayload,
  IdentityConfirmed,
  IncomingCallPayload,
  CallAcceptedPayload,
  CallDeclinedPayload,
  CallEndedPayload,
  CallStartedPayload,
  CallTimeoutPayload,
} from "@/interfaces/websocketDirectCall.interface";

interface SocketMeCallProviderProps {
  userId: string;
  children: React.ReactNode;
}

export default function DirectCallProvider({
  userId,
  children,
}: SocketMeCallProviderProps) {
  const router = useRouter();
  const socket = useRef(getDirectCallSocketIO()).current;

  const [meCallState, setMeCallState] = useState<CallProps>({
    call_id: null,
    status: "idle",
    user_info: null,
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
      setMeCallState({
        call_id: payload.call_id,
        status: payload.status,
        user_info: payload.user_info,
      });
      // console.log("[incomingCall] from directcall", payload.call_id);
      router.push(`/app/channels/me/${payload.call_id}/call`);
    };

    const onStarted = (payload: CallStartedPayload) => {
      console.log("[callStarted]", payload);
      setMeCallState({
        call_id: payload.call_id,
        status: payload.status,
        user_info: payload.user_info,
      });
    };

    const onAccepted = (payload: CallAcceptedPayload) => {
      console.log("[callAccepted]", payload);
      setMeCallState({
        call_id: payload.call_id,
        status: payload.status,
        user_info: payload.user_info,
      });
    };

    const onDeclined = (payload: CallDeclinedPayload) => {
      console.log("[callDeclined]", payload);
      setMeCallState({
        call_id: payload.call_id,
        status: payload.status,
        user_info: payload.user_info,
      });
      // console.log("[callDeclined] caller_id", payload.caller_id);
      // router.push("/app/channels/me/");
    };

    const onEnded = (payload: CallEndedPayload) => {
      console.log("[callEnded]", payload);
      setMeCallState({
        call_id: payload.call_id,
        status: payload.status,
        user_info: payload.user_info,
      });
      // console.log("[callEnded] caller_id", payload.caller_id);
      // router.push("/app/channels/me/");
    };

    const onPong = (data: { timestamp: string; message: "pong" }) =>
      console.log("[pong]", data);

    const onTimeout = (payload: CallTimeoutPayload) => {
      console.log("[callTimeout]", payload);
      setMeCallState({
        call_id: payload.call_id,
        status: payload.status,
        user_info: payload.user_info,
      });
      // console.log("[callTimeout] caller_id", payload.caller_id);
      // console.log("this is quang minh")
      // router.push("/app/channels/me/");
      // setTimeout(() => {
      //   setMeCallState((prev) => ({
      //     ...prev,
      //     isTimeout: false,
      //   }));
      // }, 3000);
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
      <DirectCallContext.Provider value={{ meCallState, setMeCallState }}>
        {children}
      </DirectCallContext.Provider>
    </>
  );
}
