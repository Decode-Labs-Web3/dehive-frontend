"use client";

import App from "@/components/app";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCookie } from "@/utils/cookie.utils";
import ChannelCallProvider from "@/providers/socketChannelCallProvider";
import ChannelChatProvider from "@/providers/socketChannelChatProvider";

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { serverId } = useParams<{
    serverId: string;
  }>();
  const [currentId, setCurrentId] = useState("");
  useEffect(() => {
    const userId = getCookie("userId");
    if (userId) {
      setCurrentId(userId);
    }
  }, []);
  return (
    <>
      {currentId && serverId ? (
        <ChannelChatProvider userId={currentId} serverId={serverId}>
          <ChannelCallProvider userId={currentId} serverId={serverId}>
            <div className="h-full grid grid-cols-[240px_1fr] overflow-hidden">
              <aside className="h-full overflow-y-auto border-r border-black/20">
                <App.ServerBar />
              </aside>
              <section className="min-w-0 min-h-0 overflow-hidden">
                <div className="h-full min-h-0">{children}</div>
              </section>
            </div>
          </ChannelCallProvider>
        </ChannelChatProvider>
      ) : (
        <h1>Loading...nha</h1>
      )}
    </>
  );
}
