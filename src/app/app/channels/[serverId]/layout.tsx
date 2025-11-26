"use client";

import { useMemo } from "react";
import App from "@/components/app";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useServerRoot } from "@/hooks/useServerRoot";
import { useParams, useRouter } from "next/navigation";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useServersList } from "@/hooks/useServersList";
import { useCallback, useEffect, useState } from "react";
import { useServerMember } from "@/hooks/useServerMember";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ChannelCallProvider from "@/providers/socketChannelCallProvider";
import ChannelChatProvider from "@/providers/socketChannelChatProvider";
import SocketServerEventsProvider from "@/providers/socketServerEventsProvider";

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();
  const { serversList } = useServersList();
  const { fingerprintHash } = useFingerprint();
  const [serverNotFound, setServerNotFound] = useState(false);
  const { setServerMember, updateServerStatusMember } = useServerMember();
  const { serverId } = useParams<{
    serverId: string;
  }>();
  const {
    createServerRoot,
  } = useServerRoot();

  const serverInfomation = useMemo(() => {
    return serversList.find((server) => server._id === serverId);
  }, [serversList, serverId]);

  useEffect(() => {
    if (serverInfomation === undefined) {
      setServerNotFound(true);
    }
  }, [serverInfomation]);

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
    fetchServerUsers();
    fetchCategoryInfo();
  }, [fetchServerUsers, fetchCategoryInfo]);

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
