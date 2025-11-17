"use client";

import { useRouter } from "next/navigation";
import { getApiHeaders } from "@/utils/api.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useEffect, useState, useCallback } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversationRefresh } from "@/contexts/ConversationRefreshContext";
import { FollowingUserItem } from "@/interfaces/following.interface";

export default function Me() {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<FollowingUserItem[]>([]);
  const { triggerRefreshConversation } = useConversationRefresh();

  const fetchUserData = useCallback(async () => {
    if (!fingerprintHash) return;
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/user/user-following", {
        method: "GET",
        headers: getApiHeaders(fingerprintHash),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      // console.log("This is response data", response)
      if (response.statusCode === 200 && response.message === "OK") {
        setUserData(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch user data error");
    } finally {
      setLoading(false);
    }
  }, [fingerprintHash]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const fetchConversation = useCallback(
    async (otherUserDehiveId: string) => {
      try {
        const apiResponse = await fetch(
          "/api/me/conversation/conversation-create",
          {
            method: "POST",
            headers: getApiHeaders(fingerprintHash, {
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({ otherUserDehiveId }),
            cache: "no-cache",
            signal: AbortSignal.timeout(10000),
          }
        );

        if (!apiResponse.ok) {
          console.error(apiResponse);
          return;
        }

        const response = await apiResponse.json();
        if (response.statusCode === 200 && response.message === "OK") {
          router.push(`/app/channels/me/${response.data._id}`);
          triggerRefreshConversation?.();
        }
      } catch (error) {
        console.error(error);
        console.log("Server create conversation is error");
      }
    },
    [router, triggerRefreshConversation, fingerprintHash]
  );

  if (loading) {
    return (
      <div className="h-full min-h-0 flex flex-col bg-background text-foreground">
        <header className="shrink-0 px-4 py-3 text-center border-b border-border bg-muted">
          <h1 className="text-xl font-bold">All Friends</h1>
        </header>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-2 p-2 pb-4">
              {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3 px-4 py-2">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-background text-foreground">
      <header className="shrink-0 px-4 py-3 text-center border-b border-border bg-muted">
        <h1 className="text-xl font-bold">All Friends</h1>
      </header>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-2 pb-4">
            {userData.map((user) => (
              <div
                key={user.user_id}
                onClick={() => fetchConversation(user.user_id)}
                className="group flex items-start gap-3 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={`https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`}
                  />
                  <AvatarFallback>{user.display_name} Avatar</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h1 className="font-semibold text-muted-foreground cursor-pointer hover:underline break-all">
                      @{user.username}
                    </h1>
                  </div>
                  <h1 className="font-medium text-foreground">
                    {user.display_name}
                  </h1>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
