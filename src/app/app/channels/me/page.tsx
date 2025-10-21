"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useConversationRefresh } from "@/contexts/ConversationRefreshContext";

interface UserDataProps {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_list: [];
  mutual_followers_number: number;
}

export default function Me() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserDataProps[]>([]);
  const { triggerRefreshConversation } = useConversationRefresh();

  const fetchUserData = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/user/user-following", {
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
        setUserData(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch user data error");
    }
  }, []);

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
            headers: {
              "Content-Type": "application/json",
              "X-Frontend-Internal-Request": "true",
            },
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
    [router, triggerRefreshConversation]
  );

  return (
    <div className="h-screen min-h-0 flex flex-col bg-[#313338] text-zinc-100">
      <h1 className="text-xl font-bold text-center">All Friends</h1>

      <div className="space-y-2 pb-4">
        {userData.map((user) => (
          <div
            key={user.user_id}
            onClick={() => fetchConversation(user.user_id)}
            className="group flex items-start gap-3 px-4 py-2 hover:bg-[#2b2d31]/60"
          >
            <div className="w-10 h-10 flex-shrink-0">
              <Image
                src={
                  user
                    ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
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
                <h1 className="font-semibold text-white cursor-pointer hover:underline break-all">
                  @{user.username}
                </h1>
              </div>
              <h1 className="font-medium text-white">{user.display_name}</h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
