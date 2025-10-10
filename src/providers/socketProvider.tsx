"use client";

import { useEffect, useRef } from "react";
import { getSocketIO } from "@/library/socketio";
import type {
  IdentityConfirmed,
  NewMessage,
  MessageEdited,
  MessageDeleted,
  WsErrorPayload,
} from "@/interfaces/index.interfaces";

type Props = { userId?: string | null; children: React.ReactNode };

export default function SocketProvider({ userId, children }: Props) {
  const socket = useRef(getSocketIO()).current;

  useEffect(() => {
    const identify = () => {
      if (userId) socket.emit("identity", userId);
    };

    const onConnect = () => {
      console.log("[ws connect]", socket.id);
      identify();
    };

    const onManagerReconnect = (attempt: number) => {
      console.log("[ws reconnect]", attempt);
      identify();
    };

    const onManagerReconnectAttempt = (attempt: number) => {
      console.log("[ws reconnect_attempt]", attempt);
    };

    const onManagerReconnectError = (err: Error) => {
      console.warn("[ws reconnect_error]", err);
    };

    const onManagerReconnectFailed = () => {
      console.warn("[ws reconnect_failed]");
    };

    const onConnectError = (e: Error) => {
      console.warn("[ws connect_error]", e);
    };

    const onError = (e: WsErrorPayload) => {
      console.warn("[ws error]", e);
    };

    const onDisconnect = (reason: string) => {
      console.log("[ws disconnect]", reason);
    };

    const onIdentityConfirmed = (p: IdentityConfirmed) => {
      console.log("[ws identityConfirmed]", p);
    };

    const onNewMessage = (m: NewMessage) => {
      console.log("[ws newMessage]", m);
    };

    const onMessageEdited = (m: MessageEdited) => {
      console.log("[ws messageEdited]", m);
    };

    const onMessageDeleted = (m: MessageDeleted) => {
      console.log("[ws messageDeleted]", m);
    };

    socket.on("connect", onConnect);

    socket.on("connect_error", onConnectError);
    socket.on("error", onError);
    socket.on("disconnect", onDisconnect);

    // Manager-level reconnection events
    socket.io.on("reconnect", onManagerReconnect);
    socket.io.on("reconnect_attempt", onManagerReconnectAttempt);
    socket.io.on("reconnect_error", onManagerReconnectError);
    socket.io.on("reconnect_failed", onManagerReconnectFailed);

    socket.on("identityConfirmed", onIdentityConfirmed);
    socket.on("newMessage", onNewMessage);
    socket.on("messageEdited", onMessageEdited);
    socket.on("messageDeleted", onMessageDeleted);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);

      socket.off("connect_error", onConnectError);
      socket.off("error", onError);
      socket.off("disconnect", onDisconnect);

      // Cleanup manager-level listeners
      socket.io.off("reconnect", onManagerReconnect);
      socket.io.off("reconnect_attempt", onManagerReconnectAttempt);
      socket.io.off("reconnect_error", onManagerReconnectError);
      socket.io.off("reconnect_failed", onManagerReconnectFailed);

      socket.off("identityConfirmed", onIdentityConfirmed);
      socket.off("newMessage", onNewMessage);
      socket.off("messageEdited", onMessageEdited);
      socket.off("messageDeleted", onMessageDeleted);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (userId && socket.connected) {
      console.log("[ws re-identify due to userId change]", userId);
      socket.emit("identity", userId);
    }
  }, [userId, socket]);

  return <>{children}</>;
}
