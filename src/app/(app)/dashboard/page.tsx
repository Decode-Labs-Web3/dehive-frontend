"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/dm");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-[var(--foreground)]">Redirecting...</div>
    </div>
  );
}
