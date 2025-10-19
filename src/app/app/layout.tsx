"use client";

import App from "@/components/app";
import { getCookie } from "@/utils/cookie.utils";
import { useState, useCallback, useEffect } from "react";
import SocketMeCallProvider from "@/providers/socketMeCallProvider";
import { ServerRefreshContext } from "@/contexts/ServerRefreshContext.contexts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const triggerRefeshServer = useCallback(() => {
    setRefreshVersion((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const currentUserId = getCookie("userId");
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, []);

  return (
    <ServerRefreshContext.Provider value={{ refreshServers: triggerRefeshServer }}>
      <div className="relative flex h-screen">
        <div className="flex w-15 relative ">
          <App.GuildBar refreshVersion={refreshVersion} />
        </div>

        {userId && (
          <SocketMeCallProvider userId={userId}>
            <div className="flex-1">{children}</div>
          </SocketMeCallProvider>
        )}

        <div className="absolute bottom-5 left-5 w-65 h-30 z-10">
          <App.UserBar />
        </div>
      </div>
    </ServerRefreshContext.Provider>
  );
}
