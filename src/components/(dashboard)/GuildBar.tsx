"use client";
import ServerBarItem from "../GuildBaritem/index";
import { useState, useEffect, useCallback } from "react";
import { toastSuccess, toastError } from "@/utils/toast.utils";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Server {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: boolean;
  tags: [];
}

interface ApiServer {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: boolean;
  tags: [];
}

interface GuildBarProps {
  activeId: string;
  setActiveId: (id: string) => void;
}

export default function GuildBar({ activeId, setActiveId }: GuildBarProps) {
  const [servers, setServers] = useState<Server[]>([]);

  const handleGetServer = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/server/get-post-server", {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.log(apiResponse);
        toastError(`Fetch servers failed (${apiResponse.status})`);
        return;
      }
      const response = await apiResponse.json();
      const data = Array.isArray(response?.data) ? response.data : [];
      const serverList: Server[] = data.map((server: ApiServer) => ({
        id: server._id,
        name: server.name,
        description: server.description,
        owner_id: server.owner_id,
        member_count: server.member_count,
        is_private: server.is_private,
        tags: server.tags,
      }));

      setServers(serverList);
      // console.log("This is server data", response.data);
      toastSuccess(response.message);
    } catch (error) {
      console.log(error);
      toastError("Server error");
    }
  }, []);

  useEffect(() => {
    handleGetServer();
  }, [handleGetServer]);

  return (
    <aside className="fixed left-0 top-0 z-12 flex flex-col gap-3 p-3 w-16 h-screen bg-[var(--background)] border-r-2 border-[var(--border-color)]">
      <div className="relative group w-10 h-10 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition">
        <span
          className={`absolute -left-3 top-1/2 -translate-y-1/2 w-1 rounded-r-full ${
            activeId === "dm"
              ? "h-8 bg-[var(--accent)]"
              : "h-4 bg-[var(--border-color)]"
          }`}
        />
        <button
          onClick={() => setActiveId("dm")}
          className="w-full h-full flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faMessage} />
        </button>

        <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 px-2 py-1 ml-2 bg-[var(--foreground)] text-[var(--accent-foreground)] font-semibold z-1000 left-full whitespace-nowrap rounded-md shadow opacity-0 group-hover:opacity-100">
          Direct Message
        </div>
      </div>

      <div className="mx-auto my-1 h-px w-8 rounded bg-[var(--border-color)] opacity-30" />

      {servers.length > 0 &&
        servers.map((server) => (
          <div
            key={server.id}
            className="relative group w-10 h-10 rounded-md bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition"
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 w-1 rounded-r-full -left-3 ${
                activeId === server.id
                  ? "h-8 bg-[var(--accent)]"
                  : "h-4 bg-[var(--border-color)]"
              }`}
            />
            <button
              onClick={() => setActiveId(server.id)}
              className="w-full h-full font-bold flex items-center justify-center"
            >
              {server.name.slice(0, 1).toUpperCase()}
            </button>
            <div className="pointer-events-none absolute rounded-md font-semibold px-2 py-1 ml-2 left-full top-1/2 -translate-y-1/2 bg-[var(--foreground)] text-[var(--accent-foreground)] opacity-0 z-100 group-hover:opacity-100 whitespace-nowrap shadow">
              {server.name}
            </div>
          </div>
        ))}

      <ServerBarItem.AddServer handleGetServer={handleGetServer} />
    </aside>
  );
}
