"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/channels/@me");
  }, [router]);

  return (
    <div className="h-full w-full flex items-center justify-center">
      Loading...
    </div>
  );
}
