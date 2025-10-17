"use client";

import React, { useEffect, useRef } from "react";
import { getMeCallSocketIO } from "@/library/sooketioMeCall";
import type {
  ClientToServerCallEvents,
  ServerToClientCallEvents,
  WsErrorPayload,
  IdentityConfirmed,
  IncomingCallPayload,
  CallAcceptedPayload,
  CallDeclinedPayload,
  CallEndedPayload,
  CallStartedPayload,
} from "@/interfaces/websocketMeCall.interfaces";
import type { Socket } from "socket.io-client";

type Props = { userId?: string | null; children: React.ReactNode };

export default function SocketMeCallProvider({ userId, children }: Props) {
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
    const onConnectError = (e: Error) =>
      console.warn("[mecall connect_error]", e);
    const onDisconnect = (reason: string) =>
      console.log("[mecall disconnect]", reason);

    const onError = (e: WsErrorPayload) => console.warn("[mecall error]", e);
    const onIdentityConfirmed = (p: IdentityConfirmed) =>
      console.log("[mecall identityConfirmed]", p);

    const onIncoming = (p: IncomingCallPayload) =>
      console.log("[incomingCall]", p);
    const onStarted = (p: CallStartedPayload) =>
      console.log("[callStarted]", p);
    const onAccepted = (p: CallAcceptedPayload) =>
      console.log("[callAccepted]", p);
    const onDeclined = (p: CallDeclinedPayload) =>
      console.log("[callDeclined]", p);
    const onEnded = (p: CallEndedPayload) => console.log("[callEnded]", p);

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
    };
  }, [socket, userId]);

  // re-identify when userId changes
  useEffect(() => {
    if (!socket.connected) return;
    if (userId) socket.emit("identity", userId);
  }, [userId, socket]);

  return <>{children}</>;
}
