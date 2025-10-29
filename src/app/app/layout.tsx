"use client";

import App from "@/components/app";
import { getCookie } from "@/utils/cookie.utils";
import { SoundContext } from "@/contexts/SoundContext";
import SocketStatusProvider from "@/providers/socketStatusProvider";
import DirectCallProvider from "@/providers/socketDirectCallProvider";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { ServerRefreshContext } from "@/contexts/ServerRefreshContext.contexts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isFocus, setIsFocus] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [sound, setSound] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [fingerprintHash, setFingerprintHash] = useState<string>("");
  console.log("fingerprintHash nha", fingerprintHash);
  console.log("isFocus nha", isFocus);
  const [refreshVersion, setRefreshVersion] = useState(0);
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
    const fingerprint = getCookie("fingerprint");
    if (fingerprint) {
      setFingerprintHash(fingerprint);
    }
  }, []);

  const greenAreaRef = useRef<HTMLDivElement>(null);

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

  const soundValue = useMemo(() => ({ sound, setSound }), [sound]);

  if (!userId || !fingerprintHash) {
    return <h1>Loading...</h1>;
  }

  return (
    <SocketStatusProvider userId={userId} fingerprintHash={fingerprintHash}>
      <SoundContext.Provider value={soundValue}>
        <ServerRefreshContext.Provider value={{ triggerRefeshServer }}>
          <div className="relative flex h-screen overflow-hidden">
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
              <DirectCallProvider userId={userId}>
                <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
              </DirectCallProvider>
            )}

            <div className="absolute bottom-5 left-5 w-60 h-30 z-10 overflow-visible">
              <App.UserBar />
            </div>
          </div>
        </ServerRefreshContext.Provider>
      </SoundContext.Provider>
    </SocketStatusProvider>
  );
}
