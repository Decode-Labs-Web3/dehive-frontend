"use client";

import { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { getMeCallSocketIO } from "@/library/sooketioMeCall";
import {
  ClientToServerCallEvents,
  ServerToClientCallEvents,
  WsErrorPayload,
  IdentityConfirmed,
  IncomingCallPayload,
  CallAcceptedPayload,
  CallDeclinedPayload,
  CallEndedPayload,
  CallStartedPayload,
  CallTimeoutPayload,
} from "@/interfaces/websocketMeCall.interfaces";

interface SocketMeCallProviderProps {
  userId: string;
  children: React.ReactNode;
}

export default function SocketMeCallProvider({
  userId,
  children,
}: SocketMeCallProviderProps) {
  const router = useRouter();
  const socket = useRef<
    Socket<ServerToClientCallEvents, ClientToServerCallEvents>
  >(getMeCallSocketIO()).current;

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
      console.log("this is incomming phone from socket provider");
    };

    const onStarted = (payload: CallStartedPayload) => {
      console.log("[callStarted]", payload);
    };

    const onAccepted = (payload: CallAcceptedPayload) => {
      console.log("[callAccepted]", payload);
    };

    const onDeclined = (payload: CallDeclinedPayload) => {
      console.log("[callDeclined]", payload);
    };

    const onEnded = (payload: CallEndedPayload) => {
      console.log("[callEnded]", payload);
    };

    const onPong = (data: { timestamp: string; message: "pong" }) =>
      console.log("[pong]", data);

    const onTimeout = (payload: CallTimeoutPayload) => {
      console.log("[callTimeout]", payload);
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
  }, [socket, userId, router]);

  useEffect(() => {
    if (!socket.connected) return;
    if (userId) socket.emit("identity", userId);
  }, [userId, socket]);

  return <>{children}</>;
}
