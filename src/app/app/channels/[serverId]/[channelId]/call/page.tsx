"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import MeCallPage from "@/components/common/CallPage";
import { useChannelCall } from "@/hooks/useChannelCall";

export default function ServerCallPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const { joinChannel, leaveChannel } = useChannelCall(channelId);
  useEffect(() => {
    joinChannel();
  }, [joinChannel]);
  return (
    <>
      <MeCallPage callId={channelId} endCall={leaveChannel} />
    </>
  );
}
