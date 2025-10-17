"use client";

import { getChannelChatSocketIO } from "@/library/socketioChannelChat";
import { useEffect, useRef, useState, useCallback } from "react";
import type {
  IdentityConfirmedChannel,
  JoinedChannel,
  WsErrorPayloadChannel,
  JoinChannelDto,
} from "@/interfaces/websocketChannelChat.interfaces";

type Args = {
  userId?: string | null;
  serverId?: string | null;
  channelId?: string | null;
};

type Status =
  | "idle"
  | "connecting"
  | "identifying"
  | "joining"
  | "ready"
  | "error";

export function useChannelConversation({ userId, serverId, channelId }: Args) {
  const socket = useRef(getChannelChatSocketIO()).current;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState<string | null>(null);

  const canJoin = !!userId && !!serverId && !!channelId;

  const identify = useCallback(() => {
    if (!userId) return;
    setStatus("identifying");
    socket.emit("identity", userId);
  }, [socket, userId]);

  const join = useCallback(() => {
    if (!canJoin) return;
    setStatus("joining");
    const dto: JoinChannelDto = { serverId: serverId!, channelId: channelId! };
    socket.emit("joinChannel", dto);
  }, [socket, canJoin, serverId, channelId]);

  useEffect(() => {
    const onConnect = () => {
      setStatus("connecting");
      identify();
    };
    const onDisconnect = () => {
      setConversationId(null);
      setStatus("idle");
    };
    const onConnectError = (e: Error) => {
      setErr(e.message ?? "connect_error");
      setStatus("error");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    socket.io.on("reconnect", () => identify());
    socket.io.on("reconnect_attempt", () => {});
    socket.io.on("reconnect_error", (e: Error) =>
      setErr(e.message ?? "reconnect_error")
    );
    socket.io.on("reconnect_failed", () => setErr("reconnect_failed"));

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);

      socket.io.off("reconnect");
      socket.io.off("reconnect_attempt");
      socket.io.off("reconnect_error");
      socket.io.off("reconnect_failed");
    };
  }, [socket, identify]);

  useEffect(() => {
    const onIdentityConfirmed = (p: IdentityConfirmedChannel) => {
      console.log(p);
      if (canJoin) join();
    };
    const onJoinedChannel = (p: JoinedChannel) => {
      setConversationId(p.conversationId);
      setStatus("ready");
      setErr(null);
    };
    const onWsError = (e: WsErrorPayloadChannel) => {
      setErr(String(e?.message ?? "WS error"));
      setStatus("error");
    };

    socket.on("identityConfirmed", onIdentityConfirmed);
    socket.on("joinedChannel", onJoinedChannel);
    socket.on("error", onWsError);

    return () => {
      socket.off("identityConfirmed", onIdentityConfirmed);
      socket.off("joinedChannel", onJoinedChannel);
      socket.off("error", onWsError);
    };
  }, [socket, join, canJoin]);

  useEffect(() => {
    if (userId && socket.connected) identify();
  }, [userId, socket, identify]);

  useEffect(() => {
    setConversationId(null);
    if (serverId && channelId && socket.connected) join();
  }, [serverId, channelId, socket, join]);

  return { conversationId, status, error: err, joinManually: join };
}
