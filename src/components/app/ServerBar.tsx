"use client";

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import ServerBarItems from "@/components/server-bar";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX, faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface ServerProps {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  _v: boolean;
}

export default function ServerBar() {
  const { serverId } = useParams();
  const [loading, setLoading] = useState(false);
  const [serverPanel, setServerPanel] = useState(false);
  const [server, setServer] = useState<ServerProps | null>(null);
  const [serverSettingModal, setServerSettingModal] = useState(false);

  const fetchServerInfo = useCallback(async () => {
    setLoading(true);
    setServerSettingModal(false);

    try {
      const apiResponse = await fetch("/api/servers/server-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ serverId }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      setServer(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchServerInfo();
  }, [fetchServerInfo]);

  if (loading) {
    return (
      <div className="w-full h-full bg-background border border-border">
        <div className="relative bg-secondary border border-border p-2">
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="p-3 space-y-3">
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background border border-border">
      <div className="relative bg-secondary border border-border p-2 font-bold z-20">
        <button
          onClick={() => setServerSettingModal(true)}
          className="flex w-full items-center justify-between text-foreground"
        >
          <span>{server?.name}</span>
          <FontAwesomeIcon icon={serverSettingModal ? faX : faChevronDown} />
        </button>

        {serverSettingModal && (
          <>
            <div
              role="presentation"
              tabIndex={-1}
              ref={(element) => element?.focus()}
              onKeyDown={(event) =>
                event.key === "Escape" && setServerSettingModal(false)
              }
              onClick={() => setServerSettingModal(false)}
              className="fixed inset-0 bg-black/50 z-30"
            />

            <div>
              {server && (
                <ServerBarItems.EditModal
                  server={server}
                  fetchServerInfo={fetchServerInfo}
                  setServerPanel={setServerPanel}
                  setServerSettingModal={setServerSettingModal}
                />
              )}
            </div>
          </>
        )}
      </div>

      {server && <ServerBarItems.Categories server={server} />}

      {serverPanel && server && (
        <ServerBarItems.ServerPanel
          server={server}
          fetchServerInfo={fetchServerInfo}
          setServerPanel={setServerPanel}
          setServerSettingModal={setServerSettingModal}
        />
      )}
    </div>
  );
}
