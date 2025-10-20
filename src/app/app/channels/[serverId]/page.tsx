"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
    <div className="h-screen min-h-0 flex flex-col bg-[#313338] text-zinc-100">
      <h1 className="text-xl font-bold text-center">Welcome to Server!</h1>

      <div className="space-y-2 pb-4">
        {memberships.map((member) => (
          <div
            key={member._id}
            className="group flex items-start gap-3 px-4 py-2 hover:bg-[#2b2d31]/60"
          >
            <div className="w-10 h-10 flex-shrink-0">
              <Image
                src={
                  member
                    ? `https://ipfs.de-id.xyz/ipfs/${member.avatar_ipfs_hash}`
                    : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                }
                alt={"Avatar"}
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-white cursor-pointer hover:underline break-all">
                  @{member.username}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {new Date(member.joined_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-zinc-200">
                Welcome to the server,{" "}
                <span className="font-medium text-white">
                  {member.display_name}
                </span>
                !
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
