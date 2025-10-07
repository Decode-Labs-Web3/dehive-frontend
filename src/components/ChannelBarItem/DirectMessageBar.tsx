"use client";

import { useState, useEffect } from "react";

interface DirectMessage {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
}

export default function DirectMessageBar() {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading direct messages
    const timer = setTimeout(() => {
      setMessages([
        {
          id: "1",
          name: "John Doe",
          lastMessage: "Hey, how are you doing?",
          timestamp: "2m ago",
          unread: 2,
        },
        {
          id: "2",
          name: "Jane Smith",
          lastMessage: "Thanks for the help!",
          timestamp: "1h ago",
        },
        {
          id: "3",
          name: "Mike Johnson",
          lastMessage: "See you tomorrow",
          timestamp: "3h ago",
        },
      ]);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-[var(--foreground)]/70 text-sm">
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-[var(--foreground)]/70 uppercase tracking-wide mb-2">
          Direct Messages
        </h3>
      </div>

      <div className="space-y-1">
        {messages.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-[var(--foreground)]/50 text-sm">
              No direct messages yet
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <button
              key={message.id}
              className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-[var(--background)]/50 transition-colors group"
            >
              <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[var(--accent-foreground)] font-medium text-sm">
                  {message.name.slice(0, 1).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">
                    {message.name}
                  </span>
                  {message.timestamp && (
                    <span className="text-xs text-[var(--foreground)]/50 flex-shrink-0 ml-2">
                      {message.timestamp}
                    </span>
                  )}
                </div>

                {message.lastMessage && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[var(--foreground)]/70 truncate">
                      {message.lastMessage}
                    </span>
                    {message.unread && message.unread > 0 && (
                      <span className="bg-[var(--accent)] text-[var(--accent-foreground)] text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center flex-shrink-0">
                        {message.unread}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
