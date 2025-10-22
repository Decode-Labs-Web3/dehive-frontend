"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberInServerProps {
  membership_id: string;
  _id: string;
  username: string;
  display_name: string;
  avatar: string;
  avatar_ipfs_hash: string;
  status: string;
  server_count: number;
  bio: string;
  is_banned: boolean;
  last_login: string;
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: [];
  is_active: boolean;
  wallets: [];
  __v: number;
  role: string;
  is_muted: boolean;
  joined_at: string;
}

export default function Server() {
  const { serverId } = useParams<{ serverId: string }>();
  const [memberships, setMemberships] = useState<MemberInServerProps[]>([]);
  const fetchMember = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/servers/members/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
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
        setMemberships(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch server member error");
    }
  }, [serverId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  return (
    <div className="h-full min-h-0 flex flex-col bg-background text-foreground">
      <header className="shrink-0 px-4 py-3 text-center border-b border-border bg-muted">
        <h1 className="text-xl font-bold">All Member</h1>
      </header>

      <ScrollArea className="h-full">
        <div className="space-y-2 p-2 pb-4">
          {memberships.map((member) => (
            <div
              key={member._id}
              className="group flex items-start gap-3 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={`https://ipfs.de-id.xyz/ipfs/${member.avatar_ipfs_hash}`}
                />
                <AvatarFallback>{member.display_name} Avatar</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-muted-foreground cursor-pointer hover:underline break-all">
                    @{member.username}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(member.joined_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  Welcome to the server,{" "}
                  <span className="font-medium text-foreground">
                    {member.display_name}
                  </span>
                  !
                </p>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
