"use client";

import { useState, useEffect } from "react";

export default function DirectMessagesPage() {
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-14 px-6 flex items-center border-b border-[var(--border-color)]/60">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Direct Messages
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[var(--foreground)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2">
              Welcome to Direct Messages
            </h2>
            <p className="text-[var(--foreground)]/70 mb-6">
              Start a conversation with your friends or colleagues.
            </p>
            <button className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors">
              Start New Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
