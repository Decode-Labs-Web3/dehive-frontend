"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChannelCall } from "@/hooks/useChannelCall";
import { useAudioSetting } from "@/hooks/useAudioSetting";
import ChannelCallStreamIOPage from "@/components/common/ChannelCall";

export default function ChannelCallPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const { updateMicrophone } = useAudioSetting();
  const { joinChannel, leaveChannel, updateUserStatus } = useChannelCall(channelId);
  useEffect(() => {
    joinChannel();
    updateMicrophone(false)
  }, [joinChannel, updateMicrophone]);
  return (
    <>
      <ChannelCallStreamIOPage callId={channelId} endCall={leaveChannel} updateUserStatus={updateUserStatus}/>
    </>
  );
}
