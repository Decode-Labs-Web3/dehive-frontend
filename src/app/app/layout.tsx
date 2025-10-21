"use client";

import App from "@/components/app";
import { getCookie } from "@/utils/cookie.utils";
import { useState, useCallback, useEffect, useRef } from "react";
import SocketMeCallProvider from "@/providers/socketMeCallProvider";
import { ServerRefreshContext } from "@/contexts/ServerRefreshContext.contexts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  console.log("isFocus nha", isFocus);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const triggerRefeshServer = useCallback(() => {
    setRefreshVersion((prev) => prev + 1);
  }, []);
  const greenAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const currentUserId = getCookie("userId");
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const greenArea = greenAreaRef.current;
      if (greenArea && !greenArea.contains(target)) {
        setIsFocus(false);
      }
    };

    if (isCalling) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalling]);

  return (
    <ServerRefreshContext.Provider value={{ triggerRefeshServer }}>
      <div className="relative flex h-screen">
        <div className="flex w-15 relative ">
          <App.GuildBar refreshVersion={refreshVersion} />
        </div>

        {isCalling && (
          <div
            ref={greenAreaRef}
            className={`bg-green-500 fixed top-0 bottom-0 md:left-75 left-15 right-0 ${
              isFocus ? "z-[500]" : "z-[-1]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsFocus(true);
            }}
          ></div>
        )}

        {userId && (
          <SocketMeCallProvider userId={userId}>
            <div className="flex-1">{children}</div>
          </SocketMeCallProvider>
        )}

        <div className="absolute bottom-5 left-5 w-75 h-30 z-10 overflow-visible">
          <App.UserBar />
        </div>
      </div>
    </ServerRefreshContext.Provider>
  );
}
