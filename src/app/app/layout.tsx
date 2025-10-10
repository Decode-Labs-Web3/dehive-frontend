"use client";

import App from "@/components/app";
import { getCookie } from "@/utils/cookie.utils";
import { useState, useEffect, useCallback } from "react";
import SocketProvider from "@/providers/socketProvider";
import { ServerContext } from "@/contexts/ServerRefreshContext.contexts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState("");
  useEffect(() => {
    const userId = getCookie("userId");

    if (userId) {
      setUserId(userId);
    }
  }, []);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const triggerRefeshServer = useCallback(() => {
    setRefreshVersion((prev) => prev + 1);
  }, []);

  return (
    <ServerContext.Provider value={{ refreshServers: triggerRefeshServer }}>
      <div className="relative flex h-screen">
        <div className="flex w-15 relative ">
          <App.GuildBar refreshVersion={refreshVersion} />
        </div>

        <SocketProvider userId={userId}>
          <div className="flex-1">{children}</div>
        </SocketProvider>

        <div className="absolute bottom-5 left-5 w-65 h-30 z-10">
          <App.UserBar />
        </div>
      </div>
    </ServerContext.Provider>
  );
}
