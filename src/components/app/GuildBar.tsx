"use client";

import { Button } from "@/components/ui/button";
import { getCookie } from "@/utils/cookie.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import GuideBarItems from "@/components/guildeBaritem";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toastSuccess, toastError } from "@/utils/toast.utils";
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
        toastError(`Fetch servers failed (${apiResponse.status})`);
        return;
      }
      const response = await apiResponse.json();
      setServers(response.data);
      // console.log("This is server data", response.data);
      toastSuccess(response.message);
    } catch (error) {
      console.log(error);
      toastError("Server error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetServer();
  }, [handleGetServer, refreshVersion]);

  const handleLeaveServer = async (serverId: string) => {
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
      <aside className="flex flex-col gap-2 p-3 w-full h-full bg-[var(--background)] border-r-2 border-[var(--border-color)]">
        <div className="relative group w-10 h-10 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition">
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
                className="w-full h-full flex items-center justify-center rounded-md hover:bg-blue-400"
              >
                <FontAwesomeIcon icon={faMessage} />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              className="bg-black text-white h-10 text-center font-semibold text-xl"
            >
              <p>Direct Message</p>
            </TooltipContent>
            {/* <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 px-2 py-1 ml-2 bg-black text-[var(--accent-foreground)] font-semibold z-1000 left-full whitespace-nowrap rounded-md shadow opacity-0 group-hover:opacity-100">
              Direct Message
            </div> */}
          </Tooltip>
        </div>

        <Separator className="mx-auto my-1 w-8 h-1 bg-black" />

        <ScrollArea className="-mx-3">
          {loading && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          )}

          {servers.length > 0 &&
            servers.map((server) => (
              <Tooltip key={server._id}>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          router.push(`/app/channels/${server._id}`)
                        }
                        className="relative group w-10 h-10 rounded-md ml-3 flex items-center font-bold justify-center hover:bg-blue-400"
                      >
                        {server.name.slice(0, 1).toUpperCase()}
                        <span
                          className={`absolute top-1/2 -translate-y-1/2 w-1 rounded-r-full -left-3 ${
                            activeId === server._id
                              ? "h-8 bg-red-500"
                              : "h-4 bg-blue-500"
                          }`}
                        />
                      </button>
                    </TooltipTrigger>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="w-48">
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
                          className="text-red-500"
                          onClick={() => handleLeaveServer(server._id)}
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
                        className="ml-2 text-neutral-400"
                      />
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>

                <TooltipContent
                  side="right"
                  align="center"
                  className="pointer-events-none bg-black text-white h-10 text-center font-semibold text-xl"
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
