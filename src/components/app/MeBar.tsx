"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiHeaders } from "@/utils/api.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useState, useCallback, useEffect } from "react";
import { useDirectMember } from "@/hooks/useDirectMember";
import { MemberListProps } from "@/interfaces/user.interface";
import UserInfoModal from "@/components/common/UserInfoModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getStatusSocketIO } from "@/lib/socketioStatusSingleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { faCircle, faCopy } from "@fortawesome/free-solid-svg-icons";
import { getDirectChatSocketIO } from "@/lib/socketioDirectChatSingleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationUpdate } from "@/interfaces/websocketDirectChat.interface";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface MeBarProps {
  refreshVersion: number;
}

export default function MeBar({ refreshVersion }: MeBarProps) {
  const router = useRouter();
  const {
    directMembers,
    createDirectMember,
    updateDirectStatus,
    updateDirectConversation,
    deleteDirectMember,
  } = useDirectMember();
  const [userProfileModal, setUserProfileModal] = useState<
    Record<string, boolean>
  >({});

  // console.log("this is out side try catch", directMembers);
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const [userDropdown, setUserDropdown] = useState<Record<string, boolean>>({});

  const fetchUserData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    deleteDirectMember();
    try {
      const apiResponse = await fetch("/api/user/user-status", {
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
      if (
        response.statusCode === 200 &&
        response.message === "Successfully fetched following users status"
      ) {
        const userChatData = response.data.users.filter(
          (user: MemberListProps) => user.conversationid !== ""
        );

        createDirectMember(userChatData);

        setUserDropdown(
          Object.fromEntries(
            userChatData.map((user: MemberListProps) => [user.user_id, false])
          )
        );
        setUserProfileModal(
          Object.fromEntries(
            userChatData.map((user: MemberListProps) => [user.user_id, false])
          )
        );
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch user data error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData, refreshVersion]);

  useEffect(() => {
    const socket = getDirectChatSocketIO();
    const onConversationUpdate = (p: ConversationUpdate) => {
      console.log("[ws me chat conversationUpdate from me Bar]", p);
      const data = p.data;
      updateDirectConversation(
        data.conversationId,
        data.status,
        data.isCall,
        data.lastMessageAt
      );
    };
    socket.on("conversation_update", onConversationUpdate);
    return () => {
      socket.off("conversation_update", onConversationUpdate);
    };
  }, [fetchUserData]);

  useEffect(() => {
    const socket = getStatusSocketIO();
    const onUserStatusChanged = (
      p: string | { userId: string; status: string }
    ) => {
      console.log("[ws me bar userStatusChanged]", p);
      if (typeof p === "string") return;
      updateDirectStatus(p.userId, p.status);
    };
    socket.on("userStatusChanged", onUserStatusChanged);
    return () => {
      socket.off("userStatusChanged", onUserStatusChanged);
    };
  }, []);

  return (
    <div className="w-full h-full bg-background border-r border-border text-foreground overflow-y-auto">
      <Link
        href={"/app/channels/me/"}
        className="flex items-center w-full h-11 px-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground bg-muted border-b border-border"
      >
        Direct Messages
      </Link>
      <ScrollArea>
        {loading ? (
          <>
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </>
        ) : (
          directMembers.map((user) => (
            <div
              key={user.user_id}
              // onContextMenuCapture={(event) => {
              //   event.preventDefault();
              //   event.stopPropagation();
              // console.log("Test Mouse Right click");
              //   setUserModal((prev) => ({
              //     ...prev,
              //     [user.id]: !prev[user.id],
              //   }));
              // }}
              className="relative"
            >
              <DropdownMenu
                modal={false}
                open={userDropdown[user.user_id]}
                onOpenChange={() =>
                  setUserDropdown((prev) => ({
                    ...prev,
                    [user.user_id]: false,
                  }))
                }
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group flex w-full items-center gap-3 px-2 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setUserDropdown((prev) => ({
                        ...prev,
                        [user.user_id]: true,
                      }));
                    }}
                    onPointerDown={(e) => {
                      if (e.button !== 2) e.preventDefault();
                    }}
                    onClick={() =>
                      router.push(`/app/channels/me/${user.conversationid}`)
                    }
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={`https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`}
                      />
                      <AvatarFallback>{user.displayname} Avatar</AvatarFallback>
                    </Avatar>
                    <FontAwesomeIcon
                      icon={faCircle}
                      className={`text-[8px] ${
                        user.status === "online"
                          ? "text-emerald-500"
                          : "text-zinc-400"
                      }`}
                    />
                    <div className="min-w-0 leading-tight">
                      <h1 className="font-medium text-[15px] truncate">
                        {user.displayname}
                      </h1>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem
                    onClick={() =>
                      setUserProfileModal((prev) => ({
                        ...prev,
                        [user.user_id]: true,
                      }))
                    }
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    onClick={() => {
                      router.push(`/app/channels/me/${user.conversationid}`);
                    }}
                  >
                    Message
                  </DropdownMenuItem>
                  <DropdownMenuItem>Call</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await navigator.clipboard.writeText(user.user_id);
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 rounded text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Copy User ID
                    <FontAwesomeIcon
                      icon={faCopy}
                      className="ml-2 text-muted-foreground"
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await navigator.clipboard.writeText(user.conversationid);
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 rounded text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Copy Conversation ID
                    <FontAwesomeIcon
                      icon={faCopy}
                      className="ml-2 text-muted-foreground"
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {userProfileModal[user.user_id] && (
                <UserInfoModal
                  userId={user.user_id}
                  setUserProfileModal={setUserProfileModal}
                />
              )}
            </div>
          ))
        )}
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
