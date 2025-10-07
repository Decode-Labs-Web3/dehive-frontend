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
  const params = useParams();
  const serverId = params.server_id as string;
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-14 px-6 flex items-center border-b border-[var(--border-color)]/60">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
            <span className="text-[var(--accent-foreground)] font-bold text-sm">
              {server.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--foreground)]">
              {server.name}
            </h1>
            <p className="text-sm text-[var(--foreground)]/70">
              {server.member_count} members
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Server Info Card */}
          <div className="bg-[var(--background-secondary)] rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Server Information
            </h2>
            <p className="text-[var(--foreground)]/70 mb-4">
              {server.description || "No description available"}
            </p>
            <div className="flex flex-wrap gap-2">
              {server.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-1 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Channels placeholder */}
          <div className="bg-[var(--background-secondary)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Channels
            </h3>
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-[var(--foreground)]/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <p className="text-[var(--foreground)]/70">
                Channels will be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
