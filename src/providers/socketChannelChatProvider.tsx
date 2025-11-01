"use client";

import { useEffect, useRef } from "react";
import { getChannelChatSocketIO } from "@/lib/socketioChannelChatSingleton";
import {
  IdentityConfirmedChannel,
  JoinedServer,
  MessageChannel,
  WsErrorPayloadChannel,
  JoinServerDto,
  Pong,
} from "@/interfaces/websocketChannelChat.interface";

interface SocketChannelProviderProps {
  userId: string;
  serverId: string;
  children: React.ReactNode;
}

export default function ChannelChatProvider({
  userId,
  serverId,
  children,
}: SocketChannelProviderProps) {
  const socket = useRef(getChannelChatSocketIO()).current;

  useEffect(() => {
    const identify = () => {
      if (userId) socket.emit("identity", userId);
    };

    const tryJoin = () => {
      if (serverId) {
        socket.emit("joinServer", { serverId });
      }
    };

    const onConnect = () => {
      console.log("[channel chat ws connect]", socket.id);
      identify();
    };

    const onDisconnect = (reason: string) => {
      console.log("[channel chat ws disconnect]", reason);
    };

    const onConnectError = (err: Error) => {
      console.warn("[channel chat ws connect_error]", err);
    };

    const onError = (e: WsErrorPayloadChannel) => {
      console.warn("[channel chat ws error]", e);
    };

    const onManagerReconnect = (n: number) => {
      console.log("[channel chat ws reconnect]", n);
      identify();
    };

    const onManagerReconnectAttempt = (n: number) => {
      console.log("[channel chat ws reconnect_attempt]", n);
    };

    const onManagerReconnectError = (err: Error) => {
      console.warn("[channel chat ws reconnect_error]", err);
    };

    const onManagerReconnectFailed = () => {
      console.warn("[channel chat ws reconnect_failed]");
    };

    const onIdentityConfirmed = (p: IdentityConfirmedChannel) => {
      console.log("[channel chat identityConfirmed]", p);
      tryJoin();
    };

    const onJoinedServer = (p: JoinedServer) => {
      console.log("[channel chat joinedChannel]", p);
    };

    const onNewMessage = (m: MessageChannel) => {
      console.log("[channel chat newMessage]", m);
    };

    const onMessageEdited = (m: MessageChannel) => {
      console.log("[channel chat messageEdited]", m);
    };

    const onMessageDeleted = (m: MessageChannel) => {
      console.log("[channel chat messageDeleted]", m);
    };

    const onPong = (p: Pong) => {
      console.log("[channel chat pong]", p);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("error", onError);

    socket.io.on("reconnect", onManagerReconnect);
    socket.io.on("reconnect_attempt", onManagerReconnectAttempt);
    socket.io.on("reconnect_error", onManagerReconnectError);
    socket.io.on("reconnect_failed", onManagerReconnectFailed);

    socket.on("identityConfirmed", onIdentityConfirmed);
    socket.on("joinedServer", onJoinedServer);
    socket.on("newMessage", onNewMessage);
    socket.on("messageEdited", onMessageEdited);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("pong", onPong);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("error", onError);

      socket.io.off("reconnect", onManagerReconnect);
      socket.io.off("reconnect_attempt", onManagerReconnectAttempt);
      socket.io.off("reconnect_error", onManagerReconnectError);
      socket.io.off("reconnect_failed", onManagerReconnectFailed);

      socket.off("identityConfirmed", onIdentityConfirmed);
      socket.off("joinedServer", onJoinedServer);
      socket.off("newMessage", onNewMessage);
      socket.off("messageEdited", onMessageEdited);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("pong", onPong);
    };
  }, [socket, userId, serverId]);

  useEffect(() => {
    if (userId && socket.connected) socket.emit("identity", userId);
  }, [userId, socket]);

  useEffect(() => {
    if (serverId && socket.connected)
      socket.emit("joinServer", { serverId } as JoinServerDto);
  }, [serverId, socket]);

  return <>{children}</>;
}
