"use client";
import ServerBarItem from "../ServerBaritem/index";
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

export default function ServerBar() {
  const [active, setActive] = useState<string>("dm");
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
      console.log("This is server data", response.data);
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
    <aside className="fix flex flex-col gap-2 left-0 top-0 p-3 w-16 h-screen border-white border-r-1 bg-gray-800">
      <div className="relative group w-10 h-10 bg-green-500 rounded-xl">
        <span
          className={`absolute -left-3 top-1/2 -translate-y-1/2 rounded-r-full w-1 bg-white ${
            active === "dm" ? "h-8" : "h-4"
          }`}
        />
        <button onClick={() => setActive("dm")} className={`w-full h-full`}>
          <FontAwesomeIcon icon={faMessage} />
        </button>

        <div className="absolute top-1/2 -translate-y-1/2 p-2 ml-2 bg-black text-white font-bold z-100 left-full whitespace-nowrap rounded-md opacity-0 group-hover:opacity-100">
          Direct Message
        </div>
      </div>

      {servers.length > 0 &&
        servers.map((server) => (
          <div
            key={server.id}
            className="relative group w-10 h-10 bg-pink-500 rounded-xl"
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white -left-3 ${
                active === server.id ? "h-8" : "h-4"
              }`}
            />
            <button
              onClick={() => setActive(server.id)}
              className="w-full h-full font-bold"
            >
              {server.name.slice(0,1).toUpperCase()}
            </button>
            <div className="absolute rounded-md font-bold p-2 ml-2 left-full top-1/2 -translate-y-1/2 bg-black text-white opacity-0 z-100 group-hover:opacity-100 whitespace-nowrap">
              {server.name}
            </div>
          </div>
        ))}

      <ServerBarItem.AddServer handleGetServer={handleGetServer}/>
    </aside>
  );
}
