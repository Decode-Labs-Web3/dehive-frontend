"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface ServerData {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_count: number;
  is_private: boolean;
  tags: string[];
}

export default function ServerPage() {
  const { serverId } = useParams();
  const [server, setServer] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerInfo = async () => {
      if (!serverId) return;

      setLoading(true);
      setError(null);

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
          throw new Error(
            `Failed to fetch server info (${apiResponse.status})`
          );
        }

        const response = await apiResponse.json();
        setServer(response.data);
      } catch (err) {
        console.error("Error fetching server info:", err);
        setError(err instanceof Error ? err.message : "Failed to load server");
      } finally {
        setLoading(false);
      }
    };

    fetchServerInfo();
  }, [serverId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--foreground)]">Loading server...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error loading server</div>
          <div className="text-[var(--foreground)]/70">{error}</div>
        </div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--foreground)]">Server not found</div>
      </div>
    );
  }

  return (
    <></>
  );
}
