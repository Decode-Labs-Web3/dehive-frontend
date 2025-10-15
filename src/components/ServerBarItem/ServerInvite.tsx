"use client";

import { useState, useEffect, useCallback } from "react";

interface ServerInviteProps {
  serverId: string;
}

export default function ServerInvite({ serverId }: ServerInviteProps) {
  const [code, setCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCode = useCallback(async () => {
    setLoading(true);
    try {
      const apiResponse = await fetch("/api/servers/server-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          serverId,
        }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (
        response.statusCode === 201 &&
        response.message === "Operation successful"
      ) {
        setCode(response.data.code);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      console.error("Server error create category");
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchCode();
  }, [fetchCode]);

  if (loading) {
    return <h1>Loading ...</h1>;
  }
  return (
    <div
      role="dialog"
      className="fixed inset-0 flex items-center justify-center z-30"
    >
      <div className="fixed inset-0 bg-black/80 z-40" />
      <div className="bg-green-500 w-100 h-100 z-50">
        <h1>Hello this this server invited</h1>
        <h1>http://localhost:9000/invite/inviteCode={code}</h1>
      </div>
    </div>
  );
}
