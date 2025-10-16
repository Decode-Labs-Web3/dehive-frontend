"use client";

import Link from "next/link";
import Image from "next/image";
import UserInfoModal from "@/components/meBarItem/UserInfoModal";
import { useState, useCallback, useEffect } from "react";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

export default function MeBar() {
  const [userData, setUserData] = useState<UserDataProps[]>([]);
  const [userModal, setUserModal] = useState<Record<string, boolean>>({});
  const [userProfileModal, setUserProfileModal] = useState<
    Record<string, boolean>
  >({});
  // console.log("this is out side try catch", userData.length);
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
        setUserModal(
          Object.fromEntries(
            response.data.map((user: UserDataProps) => [user.user_id, false])
          )
        );
        setUserProfileModal(
          Object.fromEntries(
            response.data.map((user: UserDataProps) => [user.user_id, false])
          )
        );
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch user data error");
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <div className="w-full h-full bg-[#2b2d31] border-r border-black/20 text-neutral-200 overflow-y-auto">
      <Link
        href={"/app/channels/me/"}
        className="flex items-center w-full h-11 px-3 text-xs font-semibold tracking-wide uppercase text-neutral-400 bg-[#1e1f22] border-b border-black/20"
      >
        Direct Messages
      </Link>
      {userData.length > 0 &&
        userData.map((user) => (
          <div
            key={user.user_id}
            onContextMenuCapture={(event) => {
              event.preventDefault();
              event.stopPropagation();
              // console.log("Test Mouse Right click");
              setUserModal((prev) => ({
                ...prev,
                [user.user_id]: !prev[user.user_id],
              }));
            }}
            className="relative"
          >
            <Link
              href={`/app/channels/me/${user.user_id}`}
              className="group flex items-center w-full gap-3 px-2 py-2 rounded-md hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10">
                <Image
                  src={
                    userData
                      ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                      : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={"Avatar"}
                  width={40}
                  height={40}
                  className="w-full h-full rounded-full object-contain"
                  unoptimized
                />
              </div>
              <div className="min-w-0 leading-tight">
                <h1 className="font-medium text-[15px] truncate">
                  {user.display_name}
                </h1>
                <p className="text-xs text-neutral-400 truncate">
                  @{user.username}
                </p>
              </div>
            </Link>

            {userModal[user.user_id] && (
              <div
                role="dialog"
                tabIndex={-1}
                ref={(element: HTMLDivElement) => {
                  element?.focus();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setUserModal((prev) => ({
                      ...prev,
                      [user.user_id]: false,
                    }));
                  }
                }}
                className="absolute inset-0 z-30"
              >
                <div
                  onClick={() => {
                    setUserModal((prev) => ({
                      ...prev,
                      [user.user_id]: false,
                    }));
                    setUserProfileModal((prev) => ({
                      ...prev,
                      [user.user_id]: false,
                    }));
                  }}
                  className="fixed inset-0 bg-black/50 z-40"
                />
                <div className="absolute left-1/2 -translate-x-1/2 mt-15 w-56 rounded-md bg-[#232428] text-neutral-200 border border-black/20 p-1 z-50">
                  {" "}
                  <button
                    onClick={() => {
                      setUserModal((prev) => ({
                        ...prev,
                        [user.user_id]: false,
                      }));
                      setUserProfileModal((prev) => ({
                        ...prev,
                        [user.user_id]: true,
                      }));
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-white/10 active:bg-white/20 transition-colors"
                  >
                    Profile
                  </button>
                  <Link
                    onClick={() => {
                      setUserModal((prev) => ({
                        ...prev,
                        [user.user_id]: false,
                      }));
                    }}
                    href={`/app/channels/me/${user.user_id}`}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-white/10 active:bg-white/20 transition-colors"
                  >
                    Message
                  </Link>
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-white/10 active:bg-white/20 transition-colors">
                    Call
                  </button>
                  <button
                    onClick={async (
                      event: React.MouseEvent<HTMLButtonElement>
                    ) => {
                      const button = event.currentTarget;
                      const oldText = button.textContent;

                      await navigator.clipboard.writeText(user.user_id);

                      button.textContent = "Copied!";
                      setTimeout(() => {
                        button.textContent = oldText;
                      }, 1000);
                    }}
                    className="flex items-center justify-between w-full px-3 py-2 rounded text-left hover:bg-white/10 active:bg-white/20 transition-colors"
                  >
                    Copy User ID
                    <FontAwesomeIcon
                      icon={faCopy}
                      className="ml-2 text-neutral-400"
                    />
                  </button>
                </div>
              </div>
            )}

            {userProfileModal[user.user_id] && (
              <UserInfoModal
                userId={user.user_id}
                setUserProfileModal={setUserProfileModal}
              />
            )}
          </div>
        ))}
    </div>
  );
}
