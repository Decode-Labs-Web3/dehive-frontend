"use client";

import App from "@/components/app";
import { useUser } from "@/hooks/useUser";
import { getApiHeaders } from "@/utils/api.utils";
import { SoundContext } from "@/contexts/SoundContext";
import { useFingerprint } from "@/hooks/useFingerprint";
import SkeletonApp from "@/components/common/SkeletonApp";
import { useState, useCallback, useEffect, useMemo } from "react";
import { fingerprintService } from "@/services/fingerprint.services";
import { Web3Providers } from "@/components/message-onchain/wallet";
import SocketStatusProvider from "@/providers/socketStatusProvider";
import DirectCallProvider from "@/providers/socketDirectCallProvider";
import { ServerRefreshContext } from "@/contexts/ServerRefreshContext.contexts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState(true);
  const { user, updateUser } = useUser();
  const [refreshVersion, setRefreshVersion] = useState(0);
  const triggerRefeshServer = useCallback(() => {
    setRefreshVersion((prev) => prev + 1);
  }, []);
  const { fingerprintHash, updateFingerprint } = useFingerprint();

  useEffect(() => {
    (async () => {
      try {
        const { fingerprint_hashed } = await fingerprintService();
        console.log("Fingerprint hashed:", fingerprint_hashed);
        updateFingerprint(fingerprint_hashed);
      } catch (error) {
        console.error("Error getting fingerprint:", error);
      }
    })();
  }, [updateFingerprint]);

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

  const soundValue = useMemo(() => ({ sound, setSound }), [sound]);

  const fetchUser = useCallback(async () => {
    if (!fingerprintHash) return;
    try {
      const apiResponse = await fetch("/api/user/user-info", {
        method: "GET",
        headers: getApiHeaders(fingerprintHash),
        credentials: "include",
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      console.log("API response status:", apiResponse.status);
      if (!apiResponse.ok) {
        console.error("Failed to fetch user info");
        return;
      }
      const response = await apiResponse.json();
      console.log("API response:", response);
      if (response.statusCode === 200 && response.message === "User found") {
        updateUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }, [fingerprintHash]);

  useEffect(() => {
    if (fingerprintHash) {
      fetchUser();
    }
  }, [fetchUser, fingerprintHash]);

  if (!user._id || !fingerprintHash) {
    return <SkeletonApp />;
  }

  return (
    <Web3Providers>
      <SocketStatusProvider userId={user._id} fingerprintHash={fingerprintHash}>
        <SoundContext.Provider value={soundValue}>
          <ServerRefreshContext.Provider value={{ triggerRefeshServer }}>
            <div className="relative flex h-screen overflow-hidden">
              <div className="flex w-15 relative ">
                <App.GuildBar refreshVersion={refreshVersion} />
              </div>

              <DirectCallProvider userId={user._id}>
                <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
              </DirectCallProvider>

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
