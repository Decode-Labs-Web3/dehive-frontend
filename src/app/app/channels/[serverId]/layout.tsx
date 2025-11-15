"use client";

import App from "@/components/app";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useServerRoot } from "@/hooks/useServerRoot";
import { useParams, useRouter } from "next/navigation";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useCallback, useEffect, useState } from "react";
import { useServerMember } from "@/hooks/useServerMember";
import { useServerInfomation } from "@/hooks/useServerInfomation";
import { getStatusSocketIO } from "@/lib/socketioStatusSingleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ChannelCallProvider from "@/providers/socketChannelCallProvider";
import ChannelChatProvider from "@/providers/socketChannelChatProvider";
import SocketServerEventsProvider from "@/providers/socketServerEventsProvider";
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
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const { serverInfomation, setServerInfomation } = useServerInfomation();
  const [serverNotFound, setServerNotFound] = useState(false);
  const { serverId } = useParams<{
    serverId: string;
  }>();
  const { setServerMember, updateServerStatus } = useServerMember();
  const {
    createServerRoot,
    userJoinServerRoot,
    userJoinChannelRoot,
    userLeftChannelRoot,
    userStatusChangeRoot,
  } = useServerRoot();

  const fetchServerInfo = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/servers/server-info", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ serverId }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      setServerInfomation(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [serverId, fingerprintHash, setServerInfomation]);

  const fetchCategoryInfo = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/servers/category/get", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ serverId }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      createServerRoot(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [serverId, fingerprintHash, createServerRoot]);

  const fetchServerUsers = useCallback(async () => {
    if (!fingerprintHash || !serverId) return;
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

      if (apiResponse.status === 404) {
        setServerNotFound(true);
        return;
      }

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
        setServerMember(response.data.users);
      }
    } catch (error) {
      console.error(error);
      console.log("Server deleted channel fail");
    }
  }, [serverId, fingerprintHash, setServerMember]);

  useEffect(() => {
    fetchServerInfo();
    fetchServerUsers();
    fetchCategoryInfo();
  }, [fetchServerUsers, fetchCategoryInfo, fetchServerInfo]);

  useEffect(() => {
    const socket = getStatusSocketIO();
    const onUserStatusChanged = (
      p: string | { userId: string; status: string }
    ) => {
      console.log("[ws me bar userStatusChanged] quang minh", p);
      if (typeof p === "string") return;
      updateServerStatus(p.userId, p.status);
    };
    socket.on("userStatusChanged", onUserStatusChanged);
    return () => {
      socket.off("userStatusChanged", onUserStatusChanged);
    };
  }, [updateServerStatus]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onServerJoined = (p: JoinedServer) => {
      console.log("serverJoined quang minh", p);
      userJoinServerRoot(p.channels);
    };
    socket.on("serverJoined", onServerJoined);
    return () => {
      socket.off("serverJoined", onServerJoined);
    };
  }, [userJoinServerRoot]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserJoinedChannel = (p: UserJoinedChannelPayload) => {
      console.log("userJoinedChannel quang minh", p);
      userJoinChannelRoot(p);
    };
    socket.on("userJoinedChannel", onUserJoinedChannel);
    return () => {
      socket.off("userJoinedChannel", onUserJoinedChannel);
    };
  }, [userJoinChannelRoot]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserStatusChanged = (p: UserStatusChangedPayload) => {
      console.log("userStatusChanged quang minh", p);
      userStatusChangeRoot(p);
    };
    socket.on("userStatusChanged", onUserStatusChanged);
    return () => {
      socket.off("userStatusChanged", onUserStatusChanged);
    };
  }, [userStatusChangeRoot]);

  useEffect(() => {
    const socket = getChannelCallSocketIO();
    const onUserLeftChannel = (p: UserLeftChannelPayload) => {
      console.log("userLeftChannel quang minh", p);
      userLeftChannelRoot(p);
    };
    socket.on("userLeftChannel", onUserLeftChannel);
    return () => {
      socket.off("userLeftChannel", onUserLeftChannel);
    };
  }, [userLeftChannelRoot]);

  if (serverNotFound) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Server does not exist</h2>
            <p className="text-sm text-muted-foreground">
              You may have entered the wrong path, the server has been deleted,
              or you no longer have access.
            </p>
          </div>

          <Button
            onClick={() => router.push("/app/channels/me")}
            className="mt-2"
          >
            Back to Direct Messages
          </Button>
        </div>
      </div>
    );
  }

  if (!user._id || !serverId || !serverInfomation._id) {
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
    <SocketServerEventsProvider userId={user._id} serverId={serverId}>
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
    </SocketServerEventsProvider>
  );
}
