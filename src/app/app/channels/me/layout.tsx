"use client";

import App from "@/components/app";
import { useEffect, useState } from "react";
import { getCookie } from "@/utils/cookie.utils";
import SocketMeChatProvider from "@/providers/socketMeChatProvider";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const [currentId, setCurrentId] = useState("");
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
          <div className="flex h-screen">
            <div className="w-60">
              <App.MeBar />
            </div>
            <div className="flex-1">{children}</div>
          </div>
        </SocketMeChatProvider>
      ) : (
        <h1>Loading ...</h1>
      )}
    </>
  );
}
