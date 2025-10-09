"use client";

import App from "@/components/app";

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex h-screen">
        <div className="w-60">
          <App.ServerBar />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}
