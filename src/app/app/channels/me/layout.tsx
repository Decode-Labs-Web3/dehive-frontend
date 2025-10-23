"use client";

import App from "@/components/app";
import { getCookie } from "@/utils/cookie.utils";
import { useCallback, useEffect, useState } from "react";
import SocketMeChatProvider from "@/providers/socketDirectChatProvider";
import { ConversationRefreshContext } from "@/contexts/ConversationRefreshContext";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const [currentId, setCurrentId] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
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
          <ConversationRefreshContext.Provider
            value={{ triggerRefreshConversation }}
          >
            <div className="h-full grid grid-cols-[240px_1fr] overflow-hidden">
              <aside className="h-full overflow-y-auto border-r border-black/20">
                <App.MeBar refreshVersion={refreshVersion} />
              </aside>

              <section className="min-w-0 min-h-0 overflow-hidden">
                <div className="h-full min-h-0">{children}</div>
              </section>
            </div>
          </ConversationRefreshContext.Provider>
        </SocketMeChatProvider>
      ) : (
        <h1>Loading ...</h1>
      )}
    </>
  );
}
