"use client";

import App from "@/components/app";

export default function AppLayout({ children }: { children: React.ReactNode }) {


  return (
    <div className="relative flex h-screen">
      <div className="flex w-15 relative z-0">
        <App.GuildBar />
      </div>
      <div className="flex-1">{children}</div>

      <div className="absolute bottom-5 left-5 z-10 w-65 h-30">
        <App.UserBar />
      </div>
    </div>
  );
}
