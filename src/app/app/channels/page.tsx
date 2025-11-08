"use client";

import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useFingerprint } from "@/hooks/useFingerprint";
import SkeletonApp from "@/components/common/SkeletonApp";

export default function ChannelsPage() {
  const router = useRouter();
  const { fingerprintHash } = useFingerprint();
  const { user } = useUser();
  useEffect(() => {
    if (!user._id || !fingerprintHash) {
      router.push("/sso");
      return;
    }

    router.push("/app/channels/me");
  }, [router, fingerprintHash]);

  return <SkeletonApp />;
}
