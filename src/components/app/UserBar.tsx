"use client";

import Image from "next/image";
import UserPannel from "../userBarItem/UserPannel";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faGear,
  faMicrophoneSlash,
  faMicrophone,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";

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
  is_active: boolean;
}

export default function UserBar() {
  const [theme, setTheme] = useState(false);
  const [sound, setSound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userPannel, setUserPannel] = useState(false);
  const [microphone, setMicrophone] = useState(false);
  const [userData, setUserData] = useState<UserDataProps | null>(null);

  const handleUserData = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/user/user-info", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-store",
        credentials: "include",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      setUserData(response.data);
      // console.log("this is user data from user bar",response.data )
      localStorage.setItem("userData", JSON.stringify(response.data));
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    handleUserData();
  }, [handleUserData]);

  const handleTheme = () => {
    setTheme((prev) => !prev);
    const next = theme ? "light" : "dark";
    localStorage.setItem("theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (!saved) {
      localStorage.setItem("theme", "dark");
      setTheme(false);
      document.documentElement.classList.add("dark");
      return;
    }
    if (saved === "light") {
      setTheme(true);
      document.documentElement.classList.remove("dark");
      return;
    }
    setTheme(false);
    document.documentElement.classList.add("dark");
  }, []);

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <>
      <aside className="w-full h-full rounded-md p-2 bg-[var(--background)] border-2 border-[var(--border-color)] overflow-visible">
        <div className="flex flex-col justify-end w-full h-full">
          <div className="grid grid-cols-4 gap-2 mb-2">
            <button
              onClick={handleTheme}
              className="h-8 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:opacity-90 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={theme ? faSun : faMoon} />
            </button>
            <button
              onClick={() => setMicrophone((prev) => !prev)}
              className="h-8 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:opacity-90 flex items-center justify-center"
            >
              <FontAwesomeIcon
                icon={microphone ? faMicrophone : faMicrophoneSlash}
              />
            </button>
            <button
              onClick={() => setSound((prev) => !prev)}
              className="h-8 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:opacity-90 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={sound ? faVolumeHigh : faVolumeXmark} />
            </button>
            <button
              onClick={() => setUserPannel(true)}
              className="h-8 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:opacity-90 flex items-center justify-center"
            >
              <FontAwesomeIcon
                className="hover:animate-[spin_1s]"
                icon={faGear}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 relative group">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={
                  userData
                    ? `https://ipfs.de-id.xyz/ipfs/${userData.avatar_ipfs_hash}`
                    : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                }
                alt={"Avatar"}
                width={40}
                height={40}
                className="w-full h-full object-contain"
                unoptimized
                priority
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">
                {userData?.display_name}
              </h3>
              <h4 className="text-xs text-[var(--muted-foreground)] truncate">
                {userData?.dehive_role}
              </h4>
            </div>

            <div className="absolute -left-2 bottom-full mb-22 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none transform translate-y-2 group-hover:translate-y-0 bg-[var(--background)] border border-[var(--border-color)] w-65 max-w-xs rounded-lg shadow-lg p-3 z-20">
              <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[var(--border-color)]">
                    <Image
                      src={
                        userData
                          ? `https://ipfs.de-id.xyz/ipfs/${userData.avatar_ipfs_hash}`
                          : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                      }
                      alt={"Avatar"}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                      unoptimized
                      priority
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold truncate">
                          {userData?.display_name}
                        </h3>
                        <div className="text-xs text-[var(--muted-foreground)] truncate">
                          @{userData?.username}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-secondary)] text-[var(--muted-foreground)]">
                        {userData?.dehive_role}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2 text-xs">
                      <div className="px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border-color)] text-[var(--muted-foreground)]">
                        Followers: {userData?.followers_number}
                      </div>
                      <div className="px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border-color)] text-[var(--muted-foreground)]">
                        Following: {userData?.following_number}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[var(--muted-foreground)] line-clamp-3">
                  {userData?.bio || "No bio yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      {userPannel && userData && <UserPannel setUserPannel={setUserPannel} userData={userData} handleUserData={handleUserData}/>}
    </>
  );
}
