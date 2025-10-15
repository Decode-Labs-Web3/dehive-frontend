"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

interface UserDataProps {
  _id: string;
  dehive_role: string;
  status: string;
  server_count: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  last_login: string;
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: MutualFollower[];
  is_active: boolean;
}

interface MutualFollower {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
}

interface ServerUserInfoModalProps {
  userId: string;
  setUserProfileModal: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export default function ServerUserInfoModal({
  userId,
  setUserProfileModal,
}: ServerUserInfoModalProps) {
  const [activeUserId, setActiveUserId] = useState(userId);
  const [userInfo, setUserInfo] = useState<UserDataProps | null>(null);

  const fetchUserInfo = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/user/user-other", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ userId: activeUserId }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (response.statusCode === 200 && response.message === "User found") {
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch user chatting with errror");
    }
  }, [activeUserId]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return (
    <div
      tabIndex={-1}
      ref={(element: HTMLDivElement) => {
        element?.focus();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setUserProfileModal((prev) => ({
            ...prev,
            [userId]: false,
          }));
        }
      }}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-30 flex items-center justify-center px-4 py-8"
    >
      <div
        onClick={() => {
          setUserProfileModal((prev) => ({
            ...prev,
            [userId]: false,
          }));
        }}
        className="fixed inset-0 bg-black/80"
      />
      <div className="relative z-50 w-full max-w-4xl rounded-2xl bg-neutral-900 text-white shadow-2xl">
        {userInfo ? (
          <div className="flex h-full flex-col md:flex-row">
            <aside className="w-full md:w-80">
              <div className="px-6 pb-8">
                <div className="mt-2 flex items-end gap-4">
                  <div className="h-20 w-20 rounded-full border-4 border-neutral-900 bg-neutral-800">
                    <Image
                      src={`https://ipfs.de-id.xyz/ipfs/${userInfo.avatar_ipfs_hash}`}
                      alt={userInfo.display_name}
                      width={20}
                      height={20}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold uppercase text-neutral-200">
                    {userInfo.dehive_role}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold leading-tight">
                  {userInfo.display_name}
                </h2>

                <p className="text-sm text-neutral-400">@{userInfo.username}</p>

                <div className="mt-4 divide-y divide-neutral-800 text-sm">
                  <div className="grid grid-cols-2 items-center py-2">
                    <span className="text-neutral-500">Followers</span>
                    <span className="text-right font-semibold tabular-nums">
                      {userInfo.followers_number}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 items-center py-2">
                    <span className="text-neutral-500">Following</span>
                    <span className="text-right font-semibold tabular-nums">
                      {userInfo.following_number}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 items-center py-2">
                    <span className="text-neutral-500">Mutual Friends</span>
                    <span className="text-right font-semibold tabular-nums">
                      {userInfo.mutual_followers_number}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 items-center py-2">
                    <span className="text-neutral-500">Servers</span>
                    <span className="text-right font-semibold tabular-nums">
                      {userInfo.server_count}
                    </span>
                  </div>
                </div>

                {userInfo.bio && (
                  <div className="mt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      About Me
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-200">
                      {userInfo.bio}
                    </p>
                  </div>
                )}

                <Link
                  href={`/app/channels/me/${activeUserId}`}
                  onClick={() => {
                    setUserProfileModal((prev) => ({
                      ...prev,
                      [userId]: false,
                    }));
                  }}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                >
                  Message
                </Link>
              </div>
            </aside>

            <section className="flex-1 overflow-y-auto bg-neutral-900/60 px-6 py-6">
              <div className="flex flex-wrap items-center gap-4 border-b border-neutral-800 pb-4 text-sm font-medium">
                <span className="text-neutral-400">Activity</span>
                <span className="text-white">Mutual Friends</span>
                <span className="text-neutral-500">
                  Servers ({userInfo.server_count})
                </span>
              </div>

              {userInfo.mutual_followers_list.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-neutral-500">
                  No mutual friends yet.
                </div>
              ) : (
                <ul className="mt-6 space-y-4">
                  {userInfo.mutual_followers_list.map(
                    (mutual: MutualFollower) => (
                      <li
                        key={mutual.user_id}
                        onClick={() => setActiveUserId(mutual.user_id)}
                        className="flex items-center gap-4 rounded-xl border border-transparent bg-neutral-900/60 px-4 py-3 transition hover:border-neutral-700"
                      >
                        <div className="h-12 w-12 rounded-full bg-neutral-800">
                          <Image
                            src={`https://ipfs.de-id.xyz/ipfs/${mutual.avatar_ipfs_hash}`}
                            alt={mutual.display_name}
                            width={20}
                            height={20}
                            className="h-full w-full object-contain"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {mutual.display_name}
                          </p>
                          <p className="truncate text-xs text-neutral-400">
                            @{mutual.username}
                          </p>
                        </div>
                        <div className="text-right text-xs text-neutral-500">
                          <p>{mutual.followers_number} Followers</p>
                          <p>{mutual.following_number} Following</p>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              )}
            </section>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center text-sm text-neutral-400">
            Loading profile...
          </div>
        )}
      </div>
    </div>
  );
}
