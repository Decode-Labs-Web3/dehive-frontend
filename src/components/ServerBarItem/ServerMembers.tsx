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

interface ServerMembersProps {
  server: ServerProps;
}

interface MembershipProps {
  membership_id: string;
  _id: string;
  username: string;
  display_name: string;
  avatar: string;
  status: string;
  server_count: number;
  bio: string;
  is_banned: boolean;
  role: string;
  is_muted: boolean;
  joined_at: string;
}

export default function ServerMembers({ server }: ServerMembersProps) {
  const [membership, setMembership] = useState<MembershipProps[]>([]);
  const fetchServerMember = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/servers/members/memberships", {
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
        setMembership(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Sever error for fetch server membership");
    }
  }, [server]);

  useEffect(() => {
    fetchServerMember();
  }, [fetchServerMember]);

  if (!server) {
    return <div>Loading...</div>;
  }

  return <div>{server.name}</div>;
}
