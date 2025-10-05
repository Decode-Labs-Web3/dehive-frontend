"use client";

import ChannelBarItem from "../ChannelBarItem"

interface ChannelBarProps {
  activeId: string;
}

export default function ChannelBar({ activeId }: ChannelBarProps) {
  const isDM = activeId === "dm";

  return (
    <aside className="fixed top-0 left-16 w-60 h-screen bg-[var(--background)] border-[var(--border-color)] border-r-2">
      {isDM ? (
        <ChannelBarItem.DirectMessageBar />
      ) : (
        <ChannelBarItem.ServerBar activeId={activeId}/>
      )}
    </aside>
  );
}
