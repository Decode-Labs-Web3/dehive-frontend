"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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
  username: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: string;
  last_login: string;
  is_active: boolean;
  __v: number;
  following_number: number;
  followers_number: number;
}

export default function UserBar({ userData }: { userData: UserDataProps }) {
  const [theme, setTheme] = useState(false);
  const [sound, setSound] = useState(false);
  const [microphone, setMicrophone] = useState(false);

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

  // console.log("this is userData", userData)

  return (
    <div className="fixed bottom-0 left-0 z-15 m-3 w-70 h-30 rounded-lg bg-[var(--background)] border border-[var(--border-color)] shadow">
      <div className="flex flex-col justify-end w-full h-full p-2">
        {/* Controls */}
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
          <button className="h-8 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:opacity-90 flex items-center justify-center">
            <FontAwesomeIcon icon={faGear} />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 relative group">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={
                userData
                  ? `https://gateway.pinata.cloud/ipfs/${userData.avatar_ipfs_hash}`
                  : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
              }
              alt={"Avatar"}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate">
              {userData?.display_name}
            </h3>
            <h4 className="text-xs text-[var(--muted-foreground)] truncate">
              {userData?.role}
            </h4>
          </div>

          {/* hover group */}
          <div className="absolute pointer-events-none opacity-0 group-hover:opacity-100 bottom-full mb-20 bg-[var(--background)] border border-[var(--border-color)] w-65 h-30">
            <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <Image
                    src={
                      userData
                        ? `https://gateway.pinata.cloud/ipfs/${userData.avatar_ipfs_hash}`
                        : "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                    }
                    alt={"Avatar"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col">
                  <h1>{userData?.display_name}</h1>
                  <h2>@{userData?.username}</h2>
                  <div className="flex flex-row">
                    <p>Followers: {userData?.followers_number}</p>
                    <p>Following: {userData?.following_number}</p>
                  </div>
                </div>
              </div>
              <p>{userData?.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
