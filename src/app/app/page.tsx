"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SkeletonApp from "@/components/common/SkeletonApp";

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/app/channels/me");
  }, [router]);

  return (
    <SkeletonApp />
  );
}
