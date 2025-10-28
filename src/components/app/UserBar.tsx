"use client";

import dynamic from "next/dynamic";
import UserPannel from "../userBarItem/UserPannel";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faGear,
  faMicrophone,
  faVolumeHigh,
  faVolumeXmark,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const Popover = dynamic(
  () => import("@/components/ui/popover").then((mod) => mod.Popover),
  { ssr: false }
);
const PopoverContent = dynamic(
  () => import("@/components/ui/popover").then((mod) => mod.PopoverContent),
  { ssr: false }
);
const PopoverTrigger = dynamic(
  () => import("@/components/ui/popover").then((mod) => mod.PopoverTrigger),
  { ssr: false }
);

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
    return (
      <Card className="w-full h-full p-2">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-full h-full p-2">
        <div className="flex flex-col justify-end w-full h-full">
          <div className="grid grid-cols-4 gap-2 mb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={handleTheme} className="h-8 w-full bg-background text-foreground hover:bg-accent">
                  <FontAwesomeIcon icon={theme ? faSun : faMoon} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border border-border ">
                <p>{theme ? "Switch to dark" : "Switch to light"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => setMicrophone((prev) => !prev)}
                  className="h-8 w-full bg-background text-foreground hover:bg-accent"
                >
                  <FontAwesomeIcon
                    icon={microphone ? faMicrophone : faMicrophoneSlash}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border border-border">
                <p>{microphone ? "Mute microphone" : "Unmute microphone"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => setSound((prev) => !prev)}
                  className="h-8 w-full bg-background text-foreground hover:bg-accent"
                >
                  <FontAwesomeIcon
                    icon={sound ? faVolumeHigh : faVolumeXmark}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border border-border">
                <p>{sound ? "Mute sound" : "Unmute sound"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => setUserPannel(true)}
                  className="h-8 w-full bg-background text-foreground hover:bg-accent"
                >
                  <FontAwesomeIcon
                    className="hover:animate-spin"
                    icon={faGear}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border border-border">
                <p >Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors border-none bg-transparent"
                type="button"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={`https://ipfs.de-id.xyz/ipfs/${userData?.avatar_ipfs_hash}`}
                    alt="Avatar"
                  />
                  <AvatarFallback>
                    {userData?.display_name} Avatar
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold truncate">
                    {userData?.display_name}
                  </h3>
                  <h4 className="text-xs text-muted-foreground truncate">
                    {userData?.dehive_role}
                  </h4>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 mb-12" align="start">
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={`https://ipfs.de-id.xyz/ipfs/${userData?.avatar_ipfs_hash}`}
                          alt="Avatar"
                        />
                        <AvatarFallback>
                          {userData?.display_name}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold truncate">
                              {userData?.display_name}
                            </h3>
                            <div className="text-xs text-muted-foreground truncate">
                              @{userData?.username}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {userData?.dehive_role}
                          </Badge>
                        </div>

                        <div className="flex gap-2 text-xs">
                          <Badge variant="outline">
                            Followers: {userData?.followers_number}
                          </Badge>
                          <Badge variant="outline">
                            Following: {userData?.following_number}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {userData?.bio || "No bio yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      </Card>
      {userPannel && userData && (
        <UserPannel
          setUserPannel={setUserPannel}
          userData={userData}
          handleUserData={handleUserData}
        />
      )}
    </TooltipProvider>
  );
}
