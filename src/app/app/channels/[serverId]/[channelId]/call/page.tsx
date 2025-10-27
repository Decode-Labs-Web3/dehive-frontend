"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChannelCall } from "@/hooks/useChannelCall";
import ChannelCall from "@/components/common/ChannelCall";

export default function ChannelCallPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const { joinChannel, leaveChannel, updateUserStatus } = useChannelCall(channelId);
  useEffect(() => {
    joinChannel();
  }, [joinChannel]);
  return (
    <>
      <ChannelCall callId={channelId} endCall={leaveChannel} updateUserStatus={updateUserStatus}/>
    </>
  );
}
