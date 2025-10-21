"use client";

import App from "@/components/app";
import { getCookie } from "@/utils/cookie.utils";
import { useCallback, useEffect, useState } from "react";
import SocketMeChatProvider from "@/providers/socketMeChatProvider";
import { ConversationRefreshContext } from "@/contexts/ConversationRefreshContext";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const [currentId, setCurrentId] = useState("");
  const [ refreshVersion, setRefreshVersion ] = useState(0);
  const triggerRefreshConversation = useCallback(() => {
    setRefreshVersion((prev) => prev + 1);
  }, []);
  useEffect(() => {
    const userId = getCookie("userId");
    if (userId) {
      setCurrentId(userId);
    }
  }, []);
  return (
    <>
      {currentId ? (
        <SocketMeChatProvider userId={currentId}>
          <ConversationRefreshContext.Provider value={{ triggerRefreshConversation }}>
          <div className="flex h-screen">
            <div className="w-60">
              <App.MeBar refreshVersion={refreshVersion}/>
            </div>
            <div className="flex-1">{children}</div>
          </div>
          </ConversationRefreshContext.Provider>
        </SocketMeChatProvider>
      ) : (
        <h1>Loading ...</h1>
      )}
    </>
  );
}
