"use client";

import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface AuditLogItem {
  _id: string;
  server_id: string;
  actor: {
    _id: string;
    username: string;
    display_name: string;
    avatar: string;
  };
  action: string;
  message: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServerLog() {
  const { serverId } = useParams<{ serverId: string }>();
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const { fingerprintHash } = useFingerprint();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const fetchServerLogs = useCallback(async () => {
    if (isLastPage) return;
    try {
      const apiResponse = await fetch("/api/servers/server-log", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ serverId, page }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (
        response.statusCode === 200 &&
        response.message === "Audit logs retrieved successfully"
      ) {
        setLogs((prev) => {
          return [...prev, ...response.data.logs];
        });
        setIsLastPage(response.data.is_last_page);
      }
    } catch (error) {
      console.log(error);
    }
  }, [fingerprintHash, serverId, page, isLastPage]);

  useEffect(() => {
    setLogs([]);
    setIsLastPage(false);
    setPage(0);
  }, [serverId]);

  useEffect(() => {
    fetchServerLogs();
  }, [fetchServerLogs]);

  const logsRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);

  const handleScroll = () => {
    const element = logsRef.current;
    if (!element || isLastPage || loadingMore) return;
    if (element.scrollTop + element.clientHeight === element.scrollHeight) {
      prevScrollHeightRef.current = element.scrollHeight;
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (page === 0) return;
    setLoadingMore(false);
    const element = logsRef.current;
    if (element) {
      element.scrollTop = prevScrollHeightRef.current - element.clientHeight;
      prevScrollHeightRef.current = element.scrollHeight;
    }
  }, [logs, page]);

  if (loading) {
    return <div>Loading server logs...</div>;
  }
  return (
    <div className="flex flex-col h-screen">
      <ScrollArea
        className="flex-1"
        ref={logsRef}
        onScrollViewport={handleScroll}
      >
        <div className="space-y-2 p-2 pb-4">
          {logs.length !== 0 &&
            logs.map((log) => (
              <Card key={log._id} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={`https://ipfs.de-id.xyz/ipfs/${log.actor.avatar}`}
                        alt={log.actor.display_name}
                      />
                      <AvatarFallback>
                        {log.actor.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {log.actor.display_name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {log.action.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-1">
                        {log.message}
                      </p>
                      {log.reason && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Reason: {log.reason}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          {loadingMore && (
            <div className="p-3 text-center text-xs text-muted-foreground">
              Loading more...
            </div>
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
