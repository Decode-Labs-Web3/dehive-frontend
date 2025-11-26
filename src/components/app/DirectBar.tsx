"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AvatarComponent from "@/components/common/AvatarComponent";
import { useDirectMember } from "@/hooks/useDirectMember";
import UserInfoModal from "@/components/common/UserInfoModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DirectMemberListProps } from "@/interfaces/user.interface";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface DirectBarProps {
  refreshVersion: number;
}

export default function DirectBar({ refreshVersion }: DirectBarProps) {
  const router = useRouter();
  const { directMembers } = useDirectMember();
  const [userProfileModal, setUserProfileModal] = useState<
    Record<string, boolean>
  >({});

  // console.log("this is out side try catch", directMembers);
  const [userDropdown, setUserDropdown] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setUserDropdown(
      Object.fromEntries(
        directMembers.map((user: DirectMemberListProps) => [
          user.user_id,
          false,
        ])
      )
    );
    setUserProfileModal(
      Object.fromEntries(
        directMembers.map((user: DirectMemberListProps) => [
          user.user_id,
          false,
        ])
      )
    );
  }, [refreshVersion, directMembers]);

  return (
    <div className="w-full h-full bg-background border-r border-border text-foreground overflow-y-auto">
      <Link
        href={"/app/channels/me/"}
        className="flex items-center w-full h-11 px-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground bg-muted border-b border-border"
      >
        Direct Messages
      </Link>
      <ScrollArea>
        {directMembers.map((user) => (
          <div key={user.user_id} className="relative">
            <DropdownMenu
              modal={false}
              open={userDropdown[user.user_id] ?? false}
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
                  <AvatarComponent
                    avatar_ipfs_hash={user?.avatar_ipfs_hash!}
                    displayname={user?.displayname}
                    status={user?.status}
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
        ))}
        <div
          className="h-[180px] shrink-0 pointer-events-none"
          aria-hidden="true"
        />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
