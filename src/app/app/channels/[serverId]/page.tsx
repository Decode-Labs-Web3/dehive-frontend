"use client";

import { useParams } from "next/navigation";
import { getApiHeaders } from "@/utils/api.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useCallback, useEffect, useState } from "react";
import { MemberInServerProps } from "@/interfaces/user.interface";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Server() {
  const { fingerprintHash } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const { serverId } = useParams<{ serverId: string }>();
  const [memberships, setMemberships] = useState<MemberInServerProps[]>([]);
  const fetchMember = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/members/memberships", {
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
        setMemberships(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch server member error");
    } finally {
      setLoading(false);
    }
  }, [serverId, fingerprintHash]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  if (loading) {
    return (
      <div className="h-full min-h-0 flex flex-col bg-background text-foreground">
        <header className="shrink-0 px-4 py-3 text-center border-b border-border bg-muted">
          <h1 className="text-xl font-bold">All Member</h1>
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
    );
  }

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
