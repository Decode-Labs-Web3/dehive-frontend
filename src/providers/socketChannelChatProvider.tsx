"use client";

import { useEffect, useRef } from "react";
import { getChannelChatSocketIO } from "@/library/socketioChannelChat";
import {
  IdentityConfirmedChannel,
  JoinedChannel,
  MessageChannel,
  WsErrorPayloadChannel,
  Pong,
  JoinChannelDto,
} from "@/interfaces/websocketChannelChat.interfaces";

interface SocketChannelProviderProps {
  userId: string;
  serverId: string;
  channelId: string;
  children: React.ReactNode;
}

export default function SocketChannelProvider({
  userId,
  serverId,
  channelId,
  children,
}: SocketChannelProviderProps) {
  const socket = useRef(getChannelChatSocketIO()).current;

  useEffect(() => {
    const identify = () => {
      if (userId) socket.emit("identity", userId);
    };

    const tryJoin = () => {
      if (serverId && channelId) {
        socket.emit("joinChannel", { serverId, channelId } as JoinChannelDto);
      }
    };

    const onConnect = () => {
      console.log("[channel ws connect]", socket.id);
      identify();
    };

    const onDisconnect = (reason: string) => {
      console.log("[channel ws disconnect]", reason);
    };

    const onConnectError = (err: Error) => {
      console.warn("[channel ws connect_error]", err);
    };

    const onError = (e: WsErrorPayloadChannel) => {
      console.warn("[channel ws error]", e);
    };

    const onManagerReconnect = (n: number) => {
      console.log("[channel ws reconnect]", n);
      identify();
    };

    const onManagerReconnectAttempt = (n: number) => {
      console.log("[channel ws reconnect_attempt]", n);
    };

    const onManagerReconnectError = (err: Error) => {
      console.warn("[channel ws reconnect_error]", err);
    };

    const onManagerReconnectFailed = () => {
      console.warn("[channel ws reconnect_failed]");
    };

    const onIdentityConfirmed = (p: IdentityConfirmedChannel) => {
      console.log("[channel identityConfirmed]", p);
      tryJoin();
    };

    const onJoinedChannel = (p: JoinedChannel) => {
      console.log("[channel joinedChannel]", p);
    };

    const onNewMessage = (m: MessageChannel) => {
      console.log("[channel newMessage]", m);
    };

    const onMessageEdited = (m: MessageChannel) => {
      console.log("[channel messageEdited]", m);
    };

    const onMessageDeleted = (m: MessageChannel) => {
      console.log("[channel messageDeleted]", m);
    };

    const onPong = (p: Pong) => {
      console.log("[channel pong]", p);
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
    socket.on("joinedChannel", onJoinedChannel);
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
      socket.off("joinedChannel", onJoinedChannel);
      socket.off("newMessage", onNewMessage);
      socket.off("messageEdited", onMessageEdited);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("pong", onPong);
    };
  }, [socket, userId, serverId, channelId]);

  useEffect(() => {
    if (userId && socket.connected) socket.emit("identity", userId);
  }, [userId, socket]);

  useEffect(() => {
    if (serverId && channelId && socket.connected)
      socket.emit("joinChannel", { serverId, channelId } as JoinChannelDto);
  }, [serverId, channelId, socket]);

  return <>{children}</>;
}
