"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCookie } from "@/utils/cookie.utils";
import SocketChannelProvider from "@/providers/socketChannelProvider";

export default function ChannelLayout({ children }: { children: React.ReactNode }) {
  const { serverId, channelId } = useParams<{
    serverId: string;
    channelId: string;
  }>();
  const [currentId, setCurrentId] = useState("");
  useEffect(() => {
    const userId = getCookie("userId");
    if (userId) {
      setCurrentId(userId);
    }
  }, []);
  return (
    <SocketChannelProvider
      userId={currentId}
      serverId={serverId}
      channelId={channelId}
    >
      {children}
    </SocketChannelProvider>
  );
}
