"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SkeletonApp from "@/components/common/SkeletonApp";
import { getCookie } from "@/utils/cookie.utils";
import { useFingerprint } from "@/hooks/useFingerprint";

export default function AppPage() {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();

  useEffect(() => {
    const userId = getCookie("userId");

    if (!userId || !fingerprintHash) {
      router.push("/sso");
      return;
    }

    router.push("/app/channels/me");
  }, [router, fingerprintHash]);

  return <SkeletonApp />;
}
