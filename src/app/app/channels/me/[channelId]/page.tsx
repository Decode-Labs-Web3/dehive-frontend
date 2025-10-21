"use client";

import { useParams } from "next/navigation";
import MessageMePage from "@/components/meChat/page";

export default function DirectMessagePage() {
  const { channelId } = useParams<{
    channelId: string;
  }>();
  console.log("channelId", channelId);

  return (<MessageMePage channelId={channelId} />);
}
