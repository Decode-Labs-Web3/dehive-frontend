"use client";

import { useState, useEffect, useCallback } from "react";

interface ServerProps {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: boolean;
  tags: [];
  createdAt: string;
  updatedAt: string;
  _v: boolean;
}

interface ServerBansProps {
  server: ServerProps;
}

interface MembersBanProps {
  _id: string;
  server_id: string;
  user_dehive_id: string;
  banned_by: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
  is_banned: boolean;
  user_profile: UserProfile;
}

interface UserProfile {
  _id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: string;
  last_login: string;
  is_active: boolean;
  __v: number;
  wallets: [];
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: [];
}

export default function ServerBans({ server }: ServerBansProps) {
  const [loading, setLoading] = useState(false);
  const [membersBan, setMembersBan] = useState<MembersBanProps[]>([]);
  console.log("wqdqwdvjqwdvqwhjdvqwudjqvwduqwvd", membersBan);
  const fetchBanList = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/members/ban-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ serverId: server._id }),
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
        console.log(response.data);
        setMembersBan(response.data.banned_users);
      }
    } catch (error) {
      console.error(error);
      console.log("Sever error for fetch server membership");
    } finally {
      setLoading(false);
    }
  }, [server]);

  useEffect(() => {
    fetchBanList();
  }, [fetchBanList]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {membersBan.map((member) => (
        <div key={member.user_dehive_id}>
          <h1>{member.user_dehive_id}</h1>
        </div>
      ))}
    </>
  );
}
