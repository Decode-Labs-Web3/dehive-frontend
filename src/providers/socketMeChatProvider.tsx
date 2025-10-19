"use client";

import { useEffect, useRef } from "react";
import { getMeChatSocketIO } from "@/library/socketioMeChat";
import {
  IdentityConfirmed,
  Message,
  WsErrorPayload,
} from "@/interfaces/websocketMeChat.interfaces";

interface SocketMeChatProviderProps {
  userId: string;
  children: React.ReactNode;
}

export default function SocketMeChatProvider({
  userId,
  children,
}: SocketMeChatProviderProps) {
  const socket = useRef(getMeChatSocketIO()).current;

  useEffect(() => {
    const identify = () => {
      if (userId) socket.emit("identity", userId);
    };

    const onConnect = () => {
      console.log("[ws me chat connect]", socket.id);
      identify();
    };

    const onManagerReconnect = (attempt: number) => {
      console.log("[ws me chat reconnect]", attempt);
      identify();
    };

    const onManagerReconnectAttempt = (attempt: number) => {
      console.log("[ws me chat reconnect_attempt]", attempt);
    };

    const onManagerReconnectError = (err: Error) => {
      console.warn("[ws me chat reconnect_error]", err);
    };

    const onManagerReconnectFailed = () => {
      console.warn("[ws me chat reconnect_failed]");
    };

    const onConnectError = (error: Error) => {
      console.warn("[ws me chat connect_error]", error);
    };

    const onError = (error: WsErrorPayload) => {
      console.warn("[ws me chat error]", error);
    };

    const onDisconnect = (reason: string) => {
      console.log("[ws me chat disconnect]", reason);
    };

    const onIdentityConfirmed = (p: IdentityConfirmed) => {
      console.log("[ws me chat identityConfirmed]", p);
    };

    const onNewMessage = (message: Message) => {
      console.log("[ws me chat newMessage]", message);
    };

    const onMessageEdited = (message: Message) => {
      console.log("[ws me chat messageEdited]", message);
    };

    const onMessageDeleted = (message: Message) => {
      console.log("[ws me chat messageDeleted]", message);
    };

    socket.on("connect", onConnect);

    socket.on("connect_error", onConnectError);
    socket.on("error", onError);
    socket.on("disconnect", onDisconnect);

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
