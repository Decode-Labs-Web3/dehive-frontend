"use client";

import ChannelBarItem from "../ChannelBarItem";

interface ChannelBarProps {
  activeId: string;
}

export default function ChannelBar({ activeId }: ChannelBarProps) {
  const isDM = activeId === "dm";

  return (
    <aside className="fixed top-0 left-16 z-10 w-60 h-screen bg-[var(--background-secondary)] border-r-2 border-[var(--border-color)] flex flex-col">
      <div className="h-14 px-3 flex items-center border-b border-[var(--border-color)]/60">
        <h2 className="text-sm font-semibold text-[var(--foreground)] truncate">
          {isDM ? "Direct Messages" : "Server"}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isDM ? (
          <ChannelBarItem.DirectMessageBar />
        ) : (
          <ChannelBarItem.ServerBar activeId={activeId} />
        )}
      </div>
      <div className="h-14" />
    </aside>
  );
}
