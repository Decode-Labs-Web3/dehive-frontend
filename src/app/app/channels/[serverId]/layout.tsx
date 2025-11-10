"use client";

import App from "@/components/app";
import { useUser } from "@/hooks/useUser";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { getApiHeaders } from "@/utils/api.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useServerMember } from "@/hooks/useServerMember";
import { useChannelMember } from "@/hooks/useChannelMember";
import { getStatusSocketIO } from "@/lib/socketioStatusSingleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ChannelCallProvider from "@/providers/socketChannelCallProvider";
import ChannelChatProvider from "@/providers/socketChannelChatProvider";
import { getChannelCallSocketIO } from "@/lib/socketioChannelCallSingleton";
import {
  JoinedServer,
  UserJoinedChannelPayload,
  UserStatusChangedPayload,
  UserLeftChannelPayload,
} from "@/interfaces/websocketChannelCall.interface";

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const { fingerprintHash } = useFingerprint();
  const { serverId } = useParams<{
    serverId: string;
  }>();
  const {
    createChannelMember,
    serverChannelMember,
    joinChannelMember,
    statusChannelMember,
    leftChannelMember,
    deleteChannelMember,
  } = useChannelMember();
  const { createServerMember, updateServerStatus, deleteServerMember } =
    useServerMember();
  const fetchServerUsers = useCallback(async () => {
    deleteServerMember();
    try {
      const apiResponse = await fetch("/api/servers/members/status", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ serverId }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (
        response.statusCode === 200 &&
        response.message === "Successfully fetched all server members"
      ) {
        // console.log("Server members fetched:", response.data.users);
        createServerMember(response.data.users);
      }
    } catch (error) {
      console.error(error);
      console.log("Server deleted channel fail");
    }
  }, [serverId]);

  const fetchChannelList = useCallback(async () => {
    deleteChannelMember();
    try {
      const apiResponse = await fetch("/api/servers/channel-list", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ serverId }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        // console.log("channelMembers in server layout hai:", response);
        createChannelMember(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server deleted channel fail");
    }
  }, [serverId]);

  useEffect(() => {
    fetchChannelList();
    fetchServerUsers();
  }, [fetchServerUsers, fetchChannelList, serverId]);

  useEffect(() => {
    const socket = getStatusSocketIO();
    const onUserStatusChanged = (
      p: string | { userId: string; status: string }
    ) => {
      console.log("[ws me bar userStatusChanged]", p);
      if (typeof p === "string") return;
      updateServerStatus(p.userId, p.status);
    };
    socket.on("userStatusChanged", onUserStatusChanged);
    return () => {
      socket.off("userStatusChanged", onUserStatusChanged);
    };
  }, []);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onServerJoined = (p: JoinedServer) => {
      serverChannelMember(p.channels);
    };
    socket.on("serverJoined", onServerJoined);
    return () => {
      socket.off("serverJoined", onServerJoined);
    };
  }, []);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserJoinedChannel = (p: UserJoinedChannelPayload) => {
      joinChannelMember(p);
    };
    socket.on("userJoinedChannel", onUserJoinedChannel);
    return () => {
      socket.off("userJoinedChannel", onUserJoinedChannel);
    };
  }, []);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserStatusChanged = (p: UserStatusChangedPayload) => {
      statusChannelMember(p);
    };
    socket.on("userStatusChanged", onUserStatusChanged);
    return () => {
      socket.off("userStatusChanged", onUserStatusChanged);
    };
  }, []);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserLeftChannel = (p: UserLeftChannelPayload) => {
      leftChannelMember(p);
    };
    socket.on("userLeftChannel", onUserLeftChannel);
    return () => {
      socket.off("userLeftChannel", onUserLeftChannel);
    };
  }, []);

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
