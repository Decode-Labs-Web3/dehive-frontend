"use client";

import { useRef, useCallback } from "react";
import { getChannelCallSocketIO } from "@/lib/socketioChannelCall";

export function useChannelCall(channelId: string) {
  const socket = useRef(getChannelCallSocketIO()).current;

  const joinChannel = useCallback(() => {
    if (!channelId) return;
    console.log("[useChannelCall] Joining channel:", channelId);
    socket.emit("joinChannel", {
      channel_id: channelId,
    });
  }, [socket, channelId]);

  const leaveChannel = useCallback(() => {
    if (!channelId) return;
    console.log("[useChannelCall] Leaving channel:", channelId);
    socket.emit("leaveChannel", {
      channel_id: channelId,
    });
  }, [socket, channelId]);

  return {
    joinChannel,
    leaveChannel,
  };
}
