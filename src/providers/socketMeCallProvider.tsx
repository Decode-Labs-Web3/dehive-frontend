"use client";

import { useEffect, useRef } from "react";
import { getMeCallSocketIO } from "@/library/sooketioMeCall";
import type {
  IdentityConfirmed,
  WsErrorPayload,
} from "@/interfaces/websocketMeCall.interfaces";

type Props = { userId?: string | null; children: React.ReactNode };

export default function SocketMeCallProvider({ userId, children }: Props) {
  const socket = useRef(getMeCallSocketIO()).current;

  useEffect(() => {
    const identify = () => userId && socket.emit("identity", userId);

    const onConnect = () => {
      console.log("[mecall connect]", socket.id);
      identify();
    };
    const onConnectError = (e: Error) =>
      console.warn("[mecall connect_error]", e);
    const onDisconnect = (reason: string) =>
      console.log("[mecall disconnect]", reason);
    const onError = (e: WsErrorPayload) => console.warn("[mecall error]", e);
    const onIdentityConfirmed = (p: IdentityConfirmed) =>
      console.log("[mecall identityConfirmed]", p);

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    socket.on("error", onError);
    socket.on("identityConfirmed", onIdentityConfirmed);
    socket.io.on("reconnect", identify);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
      socket.off("error", onError);
      socket.off("identityConfirmed", onIdentityConfirmed);
      socket.io.off("reconnect", identify);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (userId && socket.connected) socket.emit("identity", userId);
  }, [userId, socket]);

  return <>{children}</>;
}
