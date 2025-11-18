"use client";

import App from "@/components/app";
import { useUser } from "@/hooks/useUser";
import { getApiHeaders } from "@/utils/api.utils";
import { SoundContext } from "@/contexts/SoundContext";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useServersList } from "@/hooks/useServersList";
import SkeletonApp from "@/components/common/SkeletonApp";
import { useState, useCallback, useEffect, useMemo } from "react";
import { fingerprintService } from "@/services/fingerprint.services";
import { Web3Providers } from "@/components/message-onchain/wallet";
import SocketStatusProvider from "@/providers/socketStatusProvider";
import DirectCallProvider from "@/providers/socketDirectCallProvider";
import SocketServerEventsProvider from "@/providers/socketServerEventsProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState(true);
  const { user, setUser } = useUser();
  const { setServerList } = useServersList();
  const { fingerprintHash, updateFingerprint } = useFingerprint();

  useEffect(() => {
    (async () => {
      try {
        const { fingerprint_hashed } = await fingerprintService();
        // console.log("Fingerprint hashed:", fingerprint_hashed);
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

      // console.log("API response status:", apiResponse.status);
      if (!apiResponse.ok) {
        console.error("Failed to fetch user info");
        return;
      }
      const response = await apiResponse.json();
      // console.log("API response:", response);
      if (response.statusCode === 200 && response.message === "User found") {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }, [fingerprintHash, setUser]);

  const handleGetServer = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/servers/server/get", {
        method: "GET",
        headers: getApiHeaders(fingerprintHash),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.log(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      setServerList(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [fingerprintHash, setServerList]);

  useEffect(() => {
    if (fingerprintHash) {
      fetchUser();
      handleGetServer();
    }
  }, [fetchUser, handleGetServer, fingerprintHash]);

  return (
    <Web3Providers>
      {!user._id || !fingerprintHash ? (
        <SkeletonApp />
      ) : (
        <SocketStatusProvider
          userId={user._id}
          fingerprintHash={fingerprintHash}
        >
          <SocketServerEventsProvider userId={user._id}>
            <SoundContext.Provider value={soundValue}>
              <div className="relative flex h-screen overflow-hidden">
                <div className="flex w-15 relative ">
                  <App.GuildBar />
                </div>

                <DirectCallProvider userId={user._id}>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {children}
                  </div>
                </DirectCallProvider>

                <div className="absolute bottom-5 left-5 w-60 h-30 z-10 overflow-visible">
                  <App.UserBar />
                </div>
              </div>
            </SoundContext.Provider>
          </SocketServerEventsProvider>
        </SocketStatusProvider>
      )}
    </Web3Providers>
  );
}
