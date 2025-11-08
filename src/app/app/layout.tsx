"use client";

import App from "@/components/app";
import { getCookie } from "@/utils/cookie.utils";
import { SoundContext } from "@/contexts/SoundContext";
import { useFingerprint } from "@/hooks/useFingerprint";
import SkeletonApp from "@/components/common/SkeletonApp";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Web3Providers } from "@/components/message-onchain/wallet";
import SocketStatusProvider from "@/providers/socketStatusProvider";
import DirectCallProvider from "@/providers/socketDirectCallProvider";
import { ServerRefreshContext } from "@/contexts/ServerRefreshContext.contexts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const { fingerprintHash } = useFingerprint();
  const triggerRefeshServer = useCallback(() => {
    setRefreshVersion((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const saveSound = localStorage.getItem("sound");
    if (!saveSound) {
      setSound(true);
      localStorage.setItem("sound", "true");
      return;
    }
    setSound(saveSound === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sound", sound ? "true" : "false");
  }, [sound]);

  useEffect(() => {
    const currentUserId = getCookie("userId");
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, []);

  const soundValue = useMemo(() => ({ sound, setSound }), [sound]);

  if (!userId || !fingerprintHash) {
    return <SkeletonApp />;
  }

  return (
    <Web3Providers>
      <SocketStatusProvider userId={userId} fingerprintHash={fingerprintHash}>
        <SoundContext.Provider value={soundValue}>
          <ServerRefreshContext.Provider value={{ triggerRefeshServer }}>
            <div className="relative flex h-screen overflow-hidden">
              <div className="flex w-15 relative ">
                <App.GuildBar refreshVersion={refreshVersion} />
              </div>

              {userId && (
                <DirectCallProvider userId={userId}>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {children}
                  </div>
                </DirectCallProvider>
              )}

              <div className="absolute bottom-5 left-5 w-60 h-30 z-10 overflow-visible">
                <App.UserBar />
              </div>
            </div>
          </ServerRefreshContext.Provider>
        </SoundContext.Provider>
      </SocketStatusProvider>
    </Web3Providers>
  );
}
