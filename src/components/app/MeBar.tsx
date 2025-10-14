"use client";

import Link from "next/link";
import Image from "next/image";
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
    <div className="w-full h-full bg-[var(--background)] border-2 border-[var(--border-color)]">
      <Link
        href={"/app/channels/me/"}
        className="flex flex-row bg-red-500 w-full h-10 border-2 gap-2 "
      ></Link>
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
              className="flex flex-row w-full h-full border-2 gap-2 "
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
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <div>
                <h1>{user.display_name}</h1>
                <p>@{user.username}</p>
              </div>
            </Link>

            {userModal[user.user_id] && (
              <div
              tabIndex={-1}
              ref={(element: HTMLDivElement) => {
                element?.focus()
              }}
              onKeyDown={(event) => {
                if(event.key === "Escape"){
                  setUserModal((prev) => ({
                    ...prev,
                    [user.user_id]: false,
                  }));
                }
              }}
              className="absolute bg-green-500 flex flex-col justify-center items-start left-1/2 -translate-x-1/2  w-44 sm:w-20 md:w-40 lg:w-55 z-50">
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
                >
                  Profile
                </button>
                <Link href={`/app/channels/me/${user.user_id}`}>Message</Link>
                <button>Call</button>
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
                  className="flex justify-between w-full"
                >
                  Copy User ID
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
            )}

            {userProfileModal[user.user_id] && (
              <div
                tabIndex={-1}
                ref={(element: HTMLDivElement) => {
                  element?.focus();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setUserProfileModal((prev) => ({
                      ...prev,
                      [user.user_id]: false,
                    }));
                  }
                }}
                role="dialog"
                className="fixed inset-0 flex justify-center items-center z-30"
              >
                <div
                  onClick={() => {
                    setUserProfileModal((prev) => ({
                      ...prev,
                      [user.user_id]: false,
                    }));
                  }}
                  className="fixed inset-0 bg-black/80 z-40"
                />
                <div className="w-100 h-100 bg-red-500 z-50"></div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
