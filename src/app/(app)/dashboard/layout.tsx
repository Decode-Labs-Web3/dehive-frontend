"use client";

import { useState } from "react";
import Dashboard from "@/components/(dashboard)";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<string>("dm");

  return (
    <>
      <Dashboard.GuildBar activeId={activeId} setActiveId={setActiveId} />
      <Dashboard.ChannelBar activeId={activeId} />
      <Dashboard.UserBar />
      <div className="fixed top-0 left-[calc(4rem+15rem)]">
        {children}
      </div>
    </>
  );
}
