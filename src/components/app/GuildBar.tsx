"use client";

import { Button } from "@/components/ui/button";
import { getCookie } from "@/utils/cookie.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import GuideBarItems from "@/components/guilde-bar";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { faCopy, faMessage } from "@fortawesome/free-solid-svg-icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Server {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: number;
  tags: [];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function GuildBar({
  refreshVersion,
}: {
  refreshVersion: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [isLeaving, setIsLeaving] = useState(false);

  const getActiveId = () => {
    if (pathname.includes("/me")) return "me";
    const serverMatch = pathname.match(/\/channels\/([^\/]+)/);
    return serverMatch ? serverMatch[1] : "";
  };

  const activeId = getActiveId();
  // console.log("This is activeId from Guide bar",activeId);

  const handleGetServer = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/server/get", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      setServers(response.data);
      // console.log("This is server data", response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetServer();
  }, [handleGetServer, refreshVersion]);

  const handleLeaveServer = async (serverId: string) => {
    setIsLeaving(true);
    try {
      const apiResponse = await fetch("/api/servers/members/leave-server", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ serverId }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse) {
        console.error(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      console.log("hello this is response", response);

      if (
        response.statusCode === 200 &&
        response.message === "Operation successful"
      ) {
        handleGetServer();
        router.push("/app/channels/me");
      }
    } catch (error) {
      console.error(error);
      console.log("Server error for leave server");
    } finally {
      setIsLeaving(false);
    }
  };

  useEffect(() => {
    const currentUserId = getCookie("userId");
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, []);

  return (
    <TooltipProvider>
      <aside className="flex flex-col gap-2 p-3 w-full h-full bg-background border-r-2 border-border">
        <div className="relative group w-10 h-10 rounded-md bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition">
          <span
            className={`absolute -left-3 top-1/2 -translate-y-1/2 w-1 rounded-r-full ${
              activeId === "me" ? "h-8 bg-red-500" : "h-4 bg-blue-500"
            }`}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  router.push("/app/channels/me");
                }}
                className="w-full h-full bg-background flex items-center text-foreground justify-center rounded-md hover:bg-accent"
              >
                <FontAwesomeIcon icon={faMessage} />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              className="bg-popover text-popover-foreground border border-border"
            >
              <p>Direct Message</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator className="mx-auto my-1 w-8 h-1 bg-border" />

        <ScrollArea className="-mx-3">
          {loading && (
            <>
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={index}
                  className="relative mb-2 group w-10 h-10 rounded-md ml-3"
                >
                  <Skeleton className="w-10 h-10 rounded-md bg-muted" />
                  <span className="absolute top-1/2 -translate-y-1/2 w-1 rounded-r-full -left-3 h-4 bg-blue-500" />
                </div>
              ))}
            </>
          )}

          {servers.length > 0 &&
            servers.map((server) => (
              <Tooltip key={server._id}>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() =>
                          router.push(`/app/channels/${server._id}`)
                        }
                        className="relative mb-2 group w-10 h-10 rounded-md ml-3 text-foreground flex items-center bg-background font-bold justify-center hover:bg-accent"
                      >
                        {server.name.slice(0, 1).toUpperCase()}
                        <span
                          className={`absolute top-1/2 -translate-y-1/2 w-1 rounded-r-full -left-3 ${
                            activeId === server._id
                              ? "h-8 bg-red-500"
                              : "h-4 bg-blue-500"
                          }`}
                        />
                      </Button>
                    </TooltipTrigger>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="w-48 bg-popover text-popover-foreground border border-border">
                    <ContextMenuItem
                      onClick={() => router.push(`/app/channels/${server._id}`)}
                    >
                      Open
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem>Invite people</ContextMenuItem>
                    {userId !== server.owner_id && (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          className="text-destructive"
                          onClick={() => handleLeaveServer(server._id)}
                          disabled={isLeaving}
                        >
                          Leave server
                        </ContextMenuItem>
                      </>
                    )}
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={async () =>
                        navigator.clipboard.writeText(server._id)
                      }
                    >
                      Copy Server Id{" "}
                      <FontAwesomeIcon
                        icon={faCopy}
                        className="ml-2 text-muted-foreground"
                      />
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>

                <TooltipContent
                  side="right"
                  align="center"
                  className="bg-popover text-popover-foreground border border-border"
                >
                  <p>{server.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        <GuideBarItems.AddServer handleGetServer={handleGetServer} />
      </aside>
    </TooltipProvider>
  );
}
