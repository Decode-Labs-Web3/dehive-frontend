"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SkeletonApp from "@/components/common/SkeletonApp";
import { getCookie } from "@/utils/cookie.utils";

export default function ChannelsPage() {
  const router = useRouter();

  useEffect(() => {
    const userId = getCookie("userId");
    const fingerprint = getCookie("fingerprint");

    if (!userId || !fingerprint) {
      router.push("/sso");
      return;
    }

    router.push("/app/channels/me");
  }, [router]);

  return <SkeletonApp />;
}
