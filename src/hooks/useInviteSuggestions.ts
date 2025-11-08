"use client";

import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useEffect, useMemo, useState, useCallback } from "react";
interface InviteSuggestion {
  user_id: string;
  avatar_ipfs_hash: string;
  username: string;
  display_name: string;
}

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

interface Friend {
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

export function useInviteSuggestions(serverId: string) {
  const { fingerprintHash } = useFingerprint();
  const [suggestions, setSuggestions] = useState<InviteSuggestion[]>([]);

  const fetchAllInfo = useCallback(async () => {
    try {
      const [membersResponse, friendsResponse] = await Promise.all([
        fetch("/api/servers/members/memberships", {
          method: "POST",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ serverId }),
          cache: "no-cache",
          signal: AbortSignal.timeout(10000),
        }),
        fetch("/api/user/user-following", {
          method: "GET",
          headers: getApiHeaders(fingerprintHash),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        }),
      ]);
      if (!membersResponse.ok) {
        console.error(membersResponse);
        return;
      }
      if (!friendsResponse.ok) {
        console.error(friendsResponse);
        return;
      }

      const members = (await membersResponse.json())
        .data as MemberInServerProps[];
      const friends = (await friendsResponse.json()).data as Friend[];
      // console.log("members", members);
      // console.log("friends", friends);
      const inServer = new Set(
        members.map((member: MemberInServerProps) => member._id)
      );
      const filtered = friends.filter(
        (friend: Friend) => !inServer.has(friend.user_id)
      );
      setSuggestions(
        filtered.map((filter) => ({
          user_id: filter.user_id,
          avatar_ipfs_hash: filter.avatar_ipfs_hash,
          username: filter.username,
          display_name: filter.display_name,
        }))
      );
    } catch (error) {
      console.error(error);
      console.log("Server for useInviteSuggestions");
    }
  }, [serverId]);

  useEffect(() => {
    fetchAllInfo();
  }, [fetchAllInfo]);

  return useMemo(
    () => ({
      suggestions,
    }),
    [suggestions]
  );
}
