"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useCallback, useEffect } from "react";
import UserInfoModal from "@/components/common/UserInfoModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getDirectChatSocketIO } from "@/lib/socketioDirectChat";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { faCircle, faCopy } from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationUpdate } from "@/interfaces/websocketDirectChat.interface";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface UserDataProps {
  id: string;
  conversationid: string;
  displayname: string;
  username: string;
  avatar_ipfs_hash: string;
  isActive: boolean;
  isCall: boolean;
  lastMessageAt: string;
}

interface MeBarProps {
  refreshVersion: number;
}

export default function MeBar({ refreshVersion }: MeBarProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserDataProps[]>([]);
  const [userProfileModal, setUserProfileModal] = useState<
    Record<string, boolean>
  >({});
  // console.log("this is out side try catch", userData);
  const [loading, setLoading] = useState(false);
  const [userDropdown, setUserDropdown] = useState<Record<string, boolean>>({});
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/user/user-chat", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
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
        const userChatData = response.data.filter(
          (user: UserDataProps) => user.conversationid !== ""
        );
        setUserData(userChatData);
        setUserDropdown(
          Object.fromEntries(
            userChatData.map((user: UserDataProps) => [user.id, false])
          )
        );
        setUserProfileModal(
          Object.fromEntries(
            userChatData.map((user: UserDataProps) => [user.id, false])
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
      setUserData((prev: UserDataProps[]) => {
        const listIndex = prev.findIndex(
          (old) => old.conversationid === data.conversationId
        );
        if (listIndex === -1) {
          fetchUserData();
          return prev;
        }
        const newList = [...prev];
        newList[listIndex] = {
          ...newList[listIndex],
          isActive: data.isActive,
          isCall: data.isCall,
          lastMessageAt: data.lastMessageAt,
        };

        newList.sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime()
        );
        return newList;
      });
    };
    socket.on("conversation_update", onConversationUpdate);
    return () => {
      socket.off("conversation_update", onConversationUpdate);
    };
  });

  return (
    <div className="w-full h-full bg-background border-r border-border text-foreground overflow-y-auto">
      <Link
        href={"/app/channels/me/"}
        className="flex items-center w-full h-11 px-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground bg-muted border-b border-border"
      >
        Direct Messages
      </Link>
      <ScrollArea>
        {loading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-10" />
            <Skeleton className="h-20 w-10" />
          </>
        )}
        {userData.length > 0 &&
          userData
            .sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime()
            )
            .map((user) => (
              <div
                key={user.id}
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
                  open={userDropdown[user.id]}
                  onOpenChange={() =>
                    setUserDropdown((prev) => ({ ...prev, [user.id]: false }))
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
                          [user.id]: true,
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
                        <AvatarFallback>
                          {user.displayname} Avatar
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 leading-tight">
                        <h1 className="font-medium text-[15px] truncate">
                          {user.displayname}{" "}
                          <FontAwesomeIcon
                            icon={faCircle}
                            className={`h-2 w-2 ${
                              user.isActive
                                ? "text-emerald-500"
                                : "text-zinc-400"
                            }`}
                          />
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
                          [user.id]: true,
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
                        await navigator.clipboard.writeText(user.id);
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
                        await navigator.clipboard.writeText(
                          user.conversationid
                        );
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

                {userProfileModal[user.id] && (
                  <UserInfoModal
                    userId={user.id}
                    setUserProfileModal={setUserProfileModal}
                  />
                )}
              </div>
            ))}
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
