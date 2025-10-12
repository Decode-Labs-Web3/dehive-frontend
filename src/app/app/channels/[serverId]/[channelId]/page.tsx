"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "@/utils/cookie.utils";
import MessageChannelPage from "@/components/channelChat/page";
import { useChannelConversation } from "@/hooks/useChannelConversation";

export default function DirectMessagePage() {
  const { serverId, channelId } = useParams<{
    serverId: string;
    channelId: string;
  }>();
  const [userId, setUserId] = useState("");
  useEffect(() => {
    const currentId = getCookie("userId");
    if (currentId) {
      setUserId(currentId);
    }
  }, []);

  const { conversationId, status, error } = useChannelConversation({
    userId,
    serverId,
    channelId,
  });

  console.log(conversationId)
  console.log(status)
  console.log(error)


  return conversationId ? <MessageChannelPage conversationId={conversationId} /> : null;
}
