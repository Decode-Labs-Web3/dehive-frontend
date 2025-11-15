"use client";

import { useEffect, useRef } from "react";
import { getServerEventsSocketIO } from "@/lib/socketioServerEventsSingleton";
import type {
  ServerToClientServerEvents,
  ClientToServerServerEvents,
  IdentityConfirmedEvent,
  ServerJoinedEvent,
  ServerDeletedEvent,
  ServerUpdatedEvent,
  UserKickedEvent,
  UserBannedEvent,
  MemberJoinedEvent,
  MemberLeftEvent,
  CategoryCreatedEvent,
  CategoryUpdatedEvent,
  CategoryDeletedEvent,
  ChannelCreatedEvent,
  ChannelUpdatedEvent,
  ChannelDeletedEvent,
  ChannelMovedEvent,
  WsErrorPayload,
} from "@/interfaces/websocketServerEvents.interface";

interface SocketServerEventsProviderProps {
  userId: string;
  serverId?: string;
  children: React.ReactNode;
}

export default function SocketServerEventsProvider({
  userId,
  serverId,
  children,
}: SocketServerEventsProviderProps) {
  const socket = useRef(getServerEventsSocketIO()).current;

  useEffect(() => {
    const identify = () => {
      if (!userId) return;
      socket.emit("identity", userId);
    };

    const tryJoinServer = () => {
      if (!serverId) return;
      socket.emit("joinServer", { serverId });
    };

    const onConnect = () => {
      console.log("[server-events ws connect]", socket.id);
      identify();
    };

    const onDisconnect = (reason: string) => {
      console.log("[server-events ws disconnect]", reason);
    };

    const onConnectError = (err: Error) => {
      console.warn("[server-events ws connect_error]", err);
    };

    const onError = (e: WsErrorPayload | string) => {
      console.warn("[server-events ws error]", e);
    };

    const onManagerReconnect = (n: number) => {
      console.log("[server-events ws reconnect]", n);
      identify();
    };

    const onManagerReconnectAttempt = (n: number) => {
      console.log("[server-events ws reconnect_attempt]", n);
    };

    const onManagerReconnectError = (err: Error) => {
      console.warn("[server-events ws reconnect_error]", err);
    };

    const onManagerReconnectFailed = () => {
      console.warn("[server-events ws reconnect_failed]");
    };

    const onDebug = (p: { message: string }) => {
      console.log("[server-events debug]", p);
    };

    const onIdentityConfirmed = (p: IdentityConfirmedEvent | string) => {
      console.log("[server-events identityConfirmed]", p);
      tryJoinServer();
    };

    const onServerJoined = (p: ServerJoinedEvent) => {
      console.log("[server-events serverJoined]", p);
    };

    // Level 1: user-level events
    const onServerDeleted = (p: ServerDeletedEvent) => {
      console.log("[server-events server:deleted]", p);
    };

    const onServerUpdated = (p: ServerUpdatedEvent) => {
      console.log("[server-events server:updated]", p);
    };

    const onUserKicked = (p: UserKickedEvent) => {
      console.log("[server-events server:kicked]", p);
    };

    const onUserBanned = (p: UserBannedEvent) => {
      console.log("[server-events server:banned]", p);
    };

    // Level 2: server-level events
    const onMemberJoined = (p: MemberJoinedEvent) => {
      console.log("[server-events member:joined]", p);
    };

    const onMemberLeft = (p: MemberLeftEvent) => {
      console.log("[server-events member:left]", p);
    };

    const onCategoryCreated = (p: CategoryCreatedEvent) => {
      console.log("[server-events category:created]", p);
    };

    const onCategoryUpdated = (p: CategoryUpdatedEvent) => {
      console.log("[server-events category:updated]", p);
    };

    const onCategoryDeleted = (p: CategoryDeletedEvent) => {
      console.log("[server-events category:deleted]", p);
    };

    const onChannelCreated = (p: ChannelCreatedEvent) => {
      console.log("[server-events channel:created]", p);
    };

    const onChannelUpdated = (p: ChannelUpdatedEvent) => {
      console.log("[server-events channel:updated]", p);
    };

    const onChannelDeleted = (p: ChannelDeletedEvent) => {
      console.log("[server-events channel:deleted]", p);
    };

    const onChannelMoved = (p: ChannelMovedEvent) => {
      console.log("[server-events channel:moved]", p);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("error", onError as ServerToClientServerEvents["error"]);

    socket.io.on("reconnect", onManagerReconnect);
    socket.io.on("reconnect_attempt", onManagerReconnectAttempt);
    socket.io.on("reconnect_error", onManagerReconnectError);
    socket.io.on("reconnect_failed", onManagerReconnectFailed);

    socket.on("debug", onDebug);
    socket.on("identityConfirmed", onIdentityConfirmed);
    socket.on("serverJoined", onServerJoined);

    // Level 1
    socket.on("server:deleted", onServerDeleted);
    socket.on("server:updated", onServerUpdated);
    socket.on("server:kicked", onUserKicked);
    socket.on("server:banned", onUserBanned);

    // Level 2
    socket.on("member:joined", onMemberJoined);
    socket.on("member:left", onMemberLeft);
    socket.on("category:created", onCategoryCreated);
    socket.on("category:updated", onCategoryUpdated);
    socket.on("category:deleted", onCategoryDeleted);
    socket.on("channel:created", onChannelCreated);
    socket.on("channel:updated", onChannelUpdated);
    socket.on("channel:deleted", onChannelDeleted);
    socket.on("channel:moved", onChannelMoved);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("error", onError as ServerToClientServerEvents["error"]);

      socket.io.off("reconnect", onManagerReconnect);
      socket.io.off("reconnect_attempt", onManagerReconnectAttempt);
      socket.io.off("reconnect_error", onManagerReconnectError);
      socket.io.off("reconnect_failed", onManagerReconnectFailed);

      socket.off("debug", onDebug);
      socket.off("identityConfirmed", onIdentityConfirmed);
      socket.off("serverJoined", onServerJoined);

      socket.off("server:deleted", onServerDeleted);
      socket.off("server:updated", onServerUpdated);
      socket.off("server:kicked", onUserKicked);
      socket.off("server:banned", onUserBanned);

      socket.off("member:joined", onMemberJoined);
      socket.off("member:left", onMemberLeft);
      socket.off("category:created", onCategoryCreated);
      socket.off("category:updated", onCategoryUpdated);
      socket.off("category:deleted", onCategoryDeleted);
      socket.off("channel:created", onChannelCreated);
      socket.off("channel:updated", onChannelUpdated);
      socket.off("channel:deleted", onChannelDeleted);
      socket.off("channel:moved", onChannelMoved);
    };
  }, [socket, userId, serverId]);

  // re-identify and re-join when inputs change while connected
  useEffect(() => {
    if (userId && socket.connected) socket.emit("identity", userId);
  }, [userId, socket]);

  useEffect(() => {
    if (serverId && socket.connected) socket.emit("joinServer", { serverId });
  }, [serverId, socket]);

  return <>{children}</>;
}
