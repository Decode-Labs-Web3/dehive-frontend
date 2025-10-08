"use client";

import { useParams } from "next/navigation";

interface ServerIdLayoutProps {
  children: React.ReactNode;
}

export default function ServerIdLayout({ children }: ServerIdLayoutProps) {
  const params = useParams<{ serverId: string }>();

  return (
    <div className="bg-blue-500"/>
    // <div className="flex flex-col h-full">
    //   <div className="px-3 py-2 border-b border-[var(--border-color)]">
    //     <h2 className="text-lg font-semibold">Server: {params.serverId}</h2>
    //   </div>

    //   <div className="flex-1 overflow-y-auto">{children}</div>
    // </div>
  );
}
