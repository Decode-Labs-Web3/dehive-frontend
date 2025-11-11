"use client";

import { useEffect } from "react";
import { useFingerprint } from "@/hooks/useFingerprint";
import { fingerprintService } from "@/services/fingerprint.services";

export default function SSOLayout({ children }: { children: React.ReactNode }) {
  const { updateFingerprint } = useFingerprint();
  useEffect(() => {
    (async () => {
      const { fingerprint_hashed } = await fingerprintService();
      updateFingerprint(fingerprint_hashed);
    })();
  }, [updateFingerprint]);
  return <>{children}</>;
}
