"use client";

import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserPanel from "@/components/user-bar/UserPanel";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AvatarComponent from "@/components/common/AvatarComponent";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  faGear,
  faMicrophone,
  faVolumeHigh,
  faVolumeXmark,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UserBar() {
  const { user } = useUser();
  const [sound, setSound] = useState(false);
  const [userPanel, setUserPanel] = useState(false);
  const [theme, setTheme] = useState<string>("light");
  const [microphone, setMicrophone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (!saved || saved === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark", "alt");
      return;
    }
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.remove("alt");
      document.documentElement.classList.add("dark");
      return;
    }
    if (saved === "alt") {
      setTheme("alt");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("alt");
      return;
    }
  }, []);

  if (!user) {
    return (
      <TooltipProvider>
        <Card className="w-full h-full p-3">
          <div className="flex flex-col h-full gap-3">
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-3 w-full max-w-xs">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </Card>
      </TooltipProvider>
    );
  }

  return (
    <>
      <TooltipProvider>
        <Card className="w-full h-full p-3">
          <div className="flex flex-col h-full gap-3">
            <div className="flex-1 flex items-center justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors border-none bg-transparent w-full max-w-xs"
                    type="button"
                  >
                    <AvatarComponent
                      avatar_ipfs_hash={user.avatar_ipfs_hash}
                      displayname={user.display_name}
                      status="online"
                    />
                    <div className="min-w-0 flex-1 text-left">
                      <h3 className="text-sm font-semibold truncate">
                        {user.display_name}
                      </h3>
                      <h4 className="text-xs text-muted-foreground truncate">
                        {user.dehive_role}
                      </h4>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-60 mb-2" align="center">
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center gap-4">
                        <AvatarComponent
                          avatar_ipfs_hash={user.avatar_ipfs_hash}
                          displayname={user.display_name}
                          status="online"
                        />

                        <div className="text-center">
                          <h3 className="text-lg font-semibold truncate">
                            {user.display_name}
                          </h3>
                          <div className="text-sm text-muted-foreground truncate">
                            @{user.username}
                          </div>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {user.dehive_role}
                          </Badge>
                        </div>

                        <div className="flex gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            Followers: {user.followers_number}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Following: {user.following_number}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground text-center line-clamp-3">
                          {user.bio}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setMicrophone((prev) => !prev)}
                    className="h-10 w-full bg-background text-foreground hover:bg-accent rounded-lg"
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
                    className="h-10 w-full bg-background text-foreground hover:bg-accent rounded-lg"
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
                    onClick={() => setUserPanel(true)}
                    className="h-10 w-full bg-background text-foreground hover:bg-accent rounded-lg"
                  >
                    <FontAwesomeIcon
                      className="hover:animate-spin"
                      icon={faGear}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground border border-border">
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Card>
      </TooltipProvider>
      {userPanel && user && (
        <UserPanel
          theme={theme}
          setTheme={setTheme}
          setUserPanel={setUserPanel}
        />
      )}
    </>
  );
}
