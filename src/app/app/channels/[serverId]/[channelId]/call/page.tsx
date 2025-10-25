"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import CallPage from "@/components/common/CallPage";
import { useChannelCall } from "@/hooks/useChannelCall";

export default function ChannelCallPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const { joinChannel, leaveChannel } = useChannelCall(channelId);
  useEffect(() => {
    joinChannel();
  }, [joinChannel]);
  return (
    <>
      <CallPage callId={channelId} endCall={leaveChannel} />
    </>
  );
}
