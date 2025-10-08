"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

type Message = {
  id: string;
  author: string;
  text: string;
  ts: string;
};

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  avatar?: string;
  messages: Message[];
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "u1",
    name: "Alice Nguyen",
    lastMessage: "See you in 10!",
    unread: 2,
    avatar: "",
    messages: [
      {
        id: "m1",
        author: "Alice",
        text: "Hey, you free?",
        ts: "2025-10-08T09:00:00Z",
      },
      {
        id: "m2",
        author: "You",
        text: "Yes, on my way",
        ts: "2025-10-08T09:01:00Z",
      },
    ],
  },
  {
    id: "u2",
    name: "Bob Tran",
    lastMessage: "Nice!",
    unread: 0,
    avatar: "",
    messages: [
      {
        id: "m1",
        author: "Bob",
        text: "Nice work on that PR",
        ts: "2025-10-07T18:20:00Z",
      },
    ],
  },
  {
    id: "u3",
    name: "Charlie",
    lastMessage: "Let's test it",
    unread: 5,
    avatar: "",
    messages: [
      {
        id: "m1",
        author: "Charlie",
        text: "Can you check staging?",
        ts: "2025-10-06T14:12:00Z",
      },
    ],
  },
];

export default function MeLayout() {
  const pathname = usePathname();
  const selected = pathname?.split("/").pop() ?? "";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--foreground)]">
          Loading Direct Messages...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left column inside @me: conversations list */}
      <aside className="w-80 border-r border-[var(--border-color)] bg-[var(--background)]">
        <div className="h-14 px-4 flex items-center border-b border-[var(--border-color)]/60">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Direct Messages
          </h2>
        </div>

        <div className="overflow-auto h-[calc(100vh-3.5rem)]">
          <ul className="p-2 space-y-2">
            {MOCK_CONVERSATIONS.map((c) => {
              const isActive = selected === c.id;
              return (
                <li key={c.id}>
                  <Link
                    href={`/app/@me/${c.id}`}
                    className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-[var(--background-secondary)]"
                        : "hover:bg-[var(--background-secondary)]/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--foreground)] font-semibold">
                      {c.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--foreground)] truncate">
                          {c.name}
                        </span>
                        {c.unread > 0 && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] truncate">
                        {c.lastMessage}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}

export function ChannelsMePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Channels</h1>
      <div className="text-gray-400">Welcome to your personal channels</div>
    </div>
  );
}
