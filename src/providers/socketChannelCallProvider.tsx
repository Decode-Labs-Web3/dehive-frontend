"use client";

import { useEffect, useRef } from "react";
import { getChannelCallSocketIO } from "@/lib/socketioChannelCall";
import type {
  IdentityConfirmedCall,
  JoinedServer,
  ChannelJoinedPayload,
  UserJoinedChannelPayload,
  ChannelLeftPayload,
  UserLeftChannelPayload,
  PongPayload,
  WsErrorPayload,
} from "@/interfaces/websocketChannelCall.interface";

interface ChannelCallProviderProps {
  userId: string;
  serverId: string;
  children: React.ReactNode;
}

export default function ChannelCallProvider({
  userId,
  serverId,
  children,
}: ChannelCallProviderProps) {
  const socket = useRef(getChannelCallSocketIO()).current;

  useEffect(() => {
    const identify = () => {
      if (userId) socket.emit("identity", { userDehiveId: userId });
    };

    const tryJoinServer = () => {
      if (!serverId) return;
      socket.emit("joinServer", { server_id: serverId });
    };

    const onConnect = () => {
      console.log("[channel call ws connect]", socket.id);
      identify();
    };

    const onDisconnect = (reason: string) => {
      console.log("[channel call ws disconnect]", reason);
    };

    const onConnectError = (err: Error) => {
      console.warn("[channel call ws connect_error]", err);
    };

    const onError = (e: WsErrorPayload) => {
      console.warn("[channel call ws error]", e);
    };

    const onManagerReconnect = (n: number) => {
      console.log("[channel call ws reconnect]", n);
      identify();
    };

    const onManagerReconnectAttempt = (n: number) => {
      console.log("[channel call ws reconnect_attempt]", n);
    };

    const onManagerReconnectError = (err: Error) => {
      console.warn("[channel call ws reconnect_error]", err);
    };

    const onManagerReconnectFailed = () => {
      console.warn("[channel call ws reconnect_failed]");
    };

    const onIdentityConfirmed = (p: IdentityConfirmedCall) => {
      console.log("[channel call identityConfirmed]", p);
      tryJoinServer();
    };

    const onServerJoined = (p: JoinedServer) => {
      console.log("[channel call serverJoined]", p);
    };

    const onChannelJoined = (p: ChannelJoinedPayload) => {
      console.log("[channel call channelJoined]", p);
    };

    const onUserJoinedChannel = (p: UserJoinedChannelPayload) => {
      console.log("[channel call userJoinedChannel]", p);
    };

    const onChannelLeft = (p: ChannelLeftPayload) => {
      console.log("[channel call channelLeft]", p);
    };

    const onUserLeftChannel = (p: UserLeftChannelPayload) => {
      console.log("[channel call userLeftChannel]", p);
    };

    const onPong = (p: PongPayload) => {
      console.log("[channel call pong]", p);
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
    socket.on("serverJoined", onServerJoined);
    socket.on("channelJoined", onChannelJoined);
    socket.on("userJoinedChannel", onUserJoinedChannel);
    socket.on("userLeftChannel", onUserLeftChannel);
    socket.on("channelLeft", onChannelLeft);
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
      socket.off("serverJoined", onServerJoined);
      socket.off("channelJoined", onChannelJoined);
      socket.off("userJoinedChannel", onUserJoinedChannel);
      socket.off("channelLeft", onChannelLeft);
      socket.off("userLeftChannel", onUserLeftChannel);
      socket.off("pong", onPong);
    };
  }, [socket, userId, serverId]);

  useEffect(() => {
    if (userId && socket.connected)
      socket.emit("identity", { userDehiveId: userId });
  }, [userId, socket]);

  useEffect(() => {
    if (!serverId || !socket.connected) return;
    socket.emit("joinServer", { server_id: serverId });
  }, [serverId, socket]);

  return <>{children}</>;
}
