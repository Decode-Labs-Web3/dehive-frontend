"use client";

import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useFingerprint } from "@/hooks/useFingerprint";

export default function AppPage() {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const { user } = useUser();
  useEffect(() => {
    if (!user._id || !fingerprintHash) {
      router.push("/sso");
      return;
    }

    router.push("/app/channels/me");
  }, [router, fingerprintHash, user]);

  return <></>;
}
