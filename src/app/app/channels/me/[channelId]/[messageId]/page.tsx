"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useParams } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface MessageProps {
  _id: string;
  conversationId: string;
  sender: {
    dehive_id: string;
    username: string;
    display_name: string;
    avatar_ipfs_hash: string;
  };
  content: string;
  attachments: [];
  isEdited: false;
  isDeleted: false;
  replyTo: null | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function DirectSearch() {
  const [isEndUp, setIsEndUp] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const { messageId } = useParams<{ messageId: string }>();
  const [messages, setMessages] = useState<MessageProps[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [loadingMore, setLoadingMore] = useState(false);
  const prevScrollHeightRef = useRef(0);
  const lastOpRef = useRef<"prepend" | "append" | null>(null);
  const initialCenteredRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchMessageUp = useCallback(async () => {
    if (isEndUp || loadingMore) return;
    try {
      const el = containerRef.current;
      if (el) prevScrollHeightRef.current = el.scrollHeight;
      isFetchingRef.current = true;
      setLoadingMore(true);

      const apiResponse = await fetch("/api/search/direct-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          messageId,
          pageUp: currentPage,
        }),
      });

      if (!apiResponse.ok) {
        console.error("Failed to fetch messages up");
        return;
      }

      const response = await apiResponse.json();
      if (response.success === true && response.statusCode === 200) {
        setMessages((prev) => [...response.data.items, ...prev]);
        setIsEndUp(response.data.metadata.is_last_page);
        lastOpRef.current = "prepend";
      }
    } catch (error) {
      console.group();
      console.error("Error fetching messages up:", error);
      console.log("Server direct message up error");
      console.groupEnd();
    } finally {
      isFetchingRef.current = false;
      setLoadingMore(false);
    }
  }, [messageId, currentPage, isEndUp, loadingMore]);

  useEffect(() => {
    fetchMessageUp();
  }, [fetchMessageUp]);

  // handle scroll viewport events from ScrollArea
  const handleScroll = () => {
    const element = containerRef.current;
    if (!element || isEndUp || loadingMore) return;
    if (element.scrollTop === 0) {
      console.log("Trigger load more");
      prevScrollHeightRef.current = element.scrollHeight;
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  // preserve scroll position when messages are prepended or set center for initial load
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If we just prepended messages, adjust scroll to keep view stable
    if (lastOpRef.current === "prepend") {
      const newScrollHeight = el.scrollHeight;
      el.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      lastOpRef.current = null;
      prevScrollHeightRef.current = newScrollHeight;
      return;
    }

    // On initial load or when messages change, center the selected message if available
    if (!initialCenteredRef.current && messages.length > 0) {
      // try to center the selected message if available
      if (messageId) {
        const target = messageRefs.current.get(messageId);
        if (target) {
          const targetTop = target.offsetTop;
          const targetHeight = target.offsetHeight;
          const center = targetTop - el.clientHeight / 2 + targetHeight / 2;
          el.scrollTop = Math.max(
            0,
            Math.min(center, el.scrollHeight - el.clientHeight)
          );
        } else {
          // fallback to center whole container
          el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
        }
      } else {
        el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
      }
      initialCenteredRef.current = true;
      lastOpRef.current = null;
      return;
    }
  }, [messages, messageId]);

  // auto-center when route messageId changes
  useEffect(() => {
    if (!messageId) return;
    const raf = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const target = messageRefs.current.get(messageId);
      if (target) {
        const targetTop = target.offsetTop;
        const targetHeight = target.offsetHeight;
        const center = targetTop - el.clientHeight / 2 + targetHeight / 2;
        el.scrollTop = Math.max(
          0,
          Math.min(center, el.scrollHeight - el.clientHeight)
        );
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [messageId, messages]);

  return (
    <div className="h-full w-full relative">
      {/* central marker */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center">
        <div className="h-[2px] w-full max-w-3xl bg-indigo-200/60" />
      </div>

      {/* top loader */}
      {loadingMore && (
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-3 z-10">
          <div className="h-3 w-3 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
        </div>
      )}

      <ScrollArea
        ref={containerRef}
        onScrollViewport={handleScroll}
        className="h-full"
      >
        <div className="flex flex-col">
          {loadingMore && (
            <>
              <div className="h-20 w-full bg-muted animate-pulse rounded" />
              <div className="h-20 w-full bg-muted animate-pulse rounded" />
              <div className="h-20 w-full bg-muted animate-pulse rounded" />
            </>
          )}
          {messages.map((m) => (
            <div
              key={m._id}
              ref={(el) => {
                if (el) messageRefs.current.set(m._id, el);
                else messageRefs.current.delete(m._id);
              }}
              className={`px-2 py-2 transition-colors duration-150 ${
                m._id === messageId
                  ? "ring-2 ring-indigo-400 bg-indigo-50"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm text-slate-900">
                      {m.sender?.display_name || m.sender?.username}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
