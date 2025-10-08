"use client";

import App from "@/components/app";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex h-screen">
        <div className="w-60">
          <App.MeBar />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}
