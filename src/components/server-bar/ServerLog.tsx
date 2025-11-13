"use client";

import { useParams } from "next/navigation";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useState, useEffect, useCallback } from "react";

export default function ServerLog() {
  const { serverId } = useParams<{ serverId: string }>();
  const [loading, setLoading] = useState(false);
  const { fingerprintHash } = useFingerprint();
  const fetchServerLogs = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/server-log", {
        method: "PATCH",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ serverId }),
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
        response.message === "Operation successful"
      ) {
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [fingerprintHash, serverId]);

  useEffect(() => {
    fetchServerLogs();
  }, [fetchServerLogs]);


  if (loading) {
    return <div>Loading server logs...</div>;
  }
  return <div>Server Log Component</div>;
}
