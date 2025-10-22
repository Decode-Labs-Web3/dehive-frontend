"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import GuideBarItems from "@/components/guildeBaritem";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { toastSuccess, toastError } from "@/utils/toast.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);

  const getActiveId = () => {
    if (pathname.includes("/me")) return "me";
    const serverMatch = pathname.match(/\/channels\/([^\/]+)/);
    return serverMatch ? serverMatch[1] : "";
  };

  const activeId = getActiveId();

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

        <Separator decorative className="mx-auto my-1 w-8 bg-black" />

        <ScrollArea>
          {loading && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          )}

          {servers.length > 0 &&
            servers.map((server) => (
              <div
                key={server._id}
                className="relative group w-10 h-10 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition"
              >
                <span
                  className={`absolute top-1/2 -translate-y-1/2 w-1 rounded-r-full -left-3 ${
                    activeId === server._id
                      ? "h-8 bg-red-500"
                      : "h-4 bg-blue-500"
                  }`}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        router.push(`/app/channels/${server._id}`);
                      }}
                      className="w-full h-full flex items-center font-bold justify-center rounded-md hover:bg-blue-400"
                    >
                      {server.name.slice(0, 1).toUpperCase()}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="center"
                    className="bg-black text-white h-10 text-center font-semibold text-xl"
                  >
                    <p>{server.name}</p>
                  </TooltipContent>
                </Tooltip>
                {/* <div className="pointer-events-none absolute rounded-md font-semibold px-2 py-1 ml-2 left-full top-1/2 -translate-y-1/2 bg-black text-[var(--accent-foreground)] opacity-0 z-1000 group-hover:opacity-100 whitespace-nowrap shadow">
                {server.name}
                </div> */}
              </div>
            ))}
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        <GuideBarItems.AddServer handleGetServer={handleGetServer} />
      </aside>
    </TooltipProvider>
  );
}
