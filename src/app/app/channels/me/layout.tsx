"use client";

import App from "@/components/app";
import { useEffect, useState } from "react";
import { getCookie } from "@/utils/cookie.utils";
import SocketMeProvider from "@/providers/socketMeProvider";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const [currentId, setCurrentId] = useState("");
  useEffect(() => {
    const userId = getCookie("userId");
    if (userId) {
      setCurrentId(userId);
    }
  }, []);
  return (
    <SocketMeProvider userId={currentId}>
      <div className="flex h-screen">
        <div className="w-60">
          <App.MeBar />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </SocketMeProvider>
  );
}
