"use client";

import App from "@/components/app";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  const { user } = useUser();
  if (!user._id || !serverId) {
    return (
      <div className="h-full grid grid-cols-[240px_1fr] overflow-hidden">
        <aside className="h-full overflow-y-auto border-r border-black/20">
          <div className="w-full h-full bg-background border border-border">
            <div className="relative bg-secondary border border-border p-2">
              <Skeleton className="h-6 w-3/4" />
            </div>
            <div className="p-3 space-y-3">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-full" />
              ))}
            </div>
          </div>
        </aside>
        <section className="min-w-0 min-h-0 overflow-hidden">
          <div className="h-full min-h-0 flex flex-col bg-background text-foreground">
            <header className="shrink-0 px-4 py-3 text-center border-b border-border bg-muted">
              <Skeleton className="h-6 w-32 mx-auto" />
            </header>
            <ScrollArea className="h-full">
              <div className="space-y-2 p-2 pb-4">
                {Array.from({ length: 20 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3 px-4 py-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </section>
      </div>
    );
  }

  return (
    <ChannelChatProvider userId={user._id} serverId={serverId}>
      <ChannelCallProvider userId={user._id} serverId={serverId}>
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
  );
}
