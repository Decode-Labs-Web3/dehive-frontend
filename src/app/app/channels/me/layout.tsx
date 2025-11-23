"use client";

import App from "@/components/app";
import { useUser } from "@/hooks/useUser";
import { getApiHeaders } from "@/utils/api.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useCallback, useEffect, useState } from "react";
import { useDirectMember } from "@/hooks/useDirectMember";
import { getStatusSocketIO } from "@/lib/socketioStatusSingleton";
import { DirectMemberListProps } from "@/interfaces/user.interface";
import DirectChatProvider from "@/providers/socketDirectChatProvider";
import { getDirectChatSocketIO } from "@/lib/socketioDirectChatSingleton";
import { ConversationUpdate } from "@/interfaces/websocketDirectChat.interface";
import { ConversationRefreshContext } from "@/contexts/ConversationRefreshContext";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const triggerRefreshConversation = useCallback(() => {
    setRefreshVersion((prev) => prev + 1);
  }, []);
  const {
    setDirectMember,
    updateDirectStatus,
    updateDirectConversation,
  } = useDirectMember();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/user/user-status", {
        method: "GET",
        headers: getApiHeaders(fingerprintHash),
        cache: "no-cache",
        signal: AbortSignal.timeout(20000),
      });

      if (!apiResponse) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      // console.log("This is response data", response)
      if (
        response.statusCode === 200 &&
        response.message === "Successfully fetched following users status"
      ) {
        const userChatData = response.data.users.filter(
          (user: DirectMemberListProps) => user.conversationid !== ""
        );

        setDirectMember(userChatData);
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch user data error");
    } finally {
      setLoading(false);
    }
  }, [setDirectMember, fingerprintHash]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData, refreshVersion]);

  const handleConversationUpdate = useCallback(
    (p: ConversationUpdate) => {
      console.log("[ws me chat conversationUpdate from me Bar]", p);
      const data = p.data;
      updateDirectConversation(
        data.conversationId,
        data.status,
        data.isCall,
        data.lastMessageAt
      );
    },
    [updateDirectConversation]
  );

  useEffect(() => {
    const socket = getDirectChatSocketIO();
    socket.on("conversation_update", handleConversationUpdate);
    return () => {
      socket.off("conversation_update", handleConversationUpdate);
    };
  }, [handleConversationUpdate]);

  const handleUserStatusChanged = useCallback(
    (p: string | { userId: string; status: string }) => {
      console.log("[ws me bar userStatusChanged]", p);
      if (typeof p === "string") return;
      updateDirectStatus(p.userId, p.status);
    },
    [updateDirectStatus]
  );

  useEffect(() => {
    const socket = getStatusSocketIO();
    socket.on("userStatusChanged", handleUserStatusChanged);
    return () => {
      socket.off("userStatusChanged", handleUserStatusChanged);
    };
  }, [handleUserStatusChanged]);

  if (!user._id || loading) {
    return (
      <div className="h-full grid grid-cols-[240px_1fr] overflow-hidden">
        <aside className="h-full overflow-y-auto border-r border-black/20 p-4 space-y-3">
          <Skeleton className="h-8 w-32 mb-4" />
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-md">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </aside>

        <section className="min-w-0 min-h-0 overflow-hidden p-4">
          <div className="h-full space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full max-w-md" />
                    <Skeleton className="h-4 w-3/4 max-w-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <DirectChatProvider userId={user._id}>
      <ConversationRefreshContext.Provider
        value={{ triggerRefreshConversation }}
      >
        <div className="h-full grid grid-cols-[240px_1fr] overflow-hidden">
          <aside className="h-full overflow-y-auto border-r border-black/20">
            <App.DirectBar refreshVersion={refreshVersion} />
          </aside>

          <section className="min-w-0 min-h-0 overflow-hidden">
            <div className="h-full min-h-0">{children}</div>
          </section>
        </div>
      </ConversationRefreshContext.Provider>
    </DirectChatProvider>
  );
}
