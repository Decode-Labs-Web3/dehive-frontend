"use client";

import { useRouter, useParams } from "next/navigation";
import { useRef, useCallback } from "react";
import { getChannelCallSocketIO } from "@/lib/socketioChannelCallSingleton";

export function useChannelCall(channelId: string) {
  const router = useRouter();
  const { serverId } = useParams<{ serverId: string }>();
  const socket = useRef(getChannelCallSocketIO()).current;

  const joinChannel = useCallback(() => {
    if (!channelId) return;
    console.log("[useChannelCall] Joining channel:", channelId);
    socket.emit("joinChannel", { channel_id: channelId });
  }, [socket, channelId]);

  const leaveChannel = useCallback(() => {
    if (!channelId) return;
    console.log("[useChannelCall] Leaving channel:", channelId);
    socket.emit("leaveChannel", { channel_id: channelId });
    router.push(`/app/channels/${serverId}`);
  }, [socket, channelId, router, serverId]);

  const updateUserStatus = useCallback(
    (payload: {
      isCamera?: boolean;
      isMic?: boolean;
      isHeadphone?: boolean;
      isLive?: boolean;
    }) => {
      socket.emit("updateUserStatus", payload);
    },
    [socket]
  );

  return {
    joinChannel,
    leaveChannel,
    updateUserStatus,
  };
}
