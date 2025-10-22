"use client";

import { useParams } from "next/navigation";
import MessageChannelPage from "@/components/channelChat/page";

export default function DirectMessagePage() {
  const { channelId } = useParams<{
    channelId: string;
  }>();

  return <MessageChannelPage channelId={channelId} />;
}
