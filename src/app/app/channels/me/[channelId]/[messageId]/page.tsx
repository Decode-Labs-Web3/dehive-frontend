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

export default function DirectSearchBar() {
  const [isEndUp, setIsEndUp] = useState(false);
  const [isEndDown, setIsEndDown] = useState(false);
  const [pageUp, setPageUp] = useState<number>(0);
  const [pageDown, setPageDown] = useState<number>(0);
  const { messageId } = useParams<{ messageId: string }>();
  const [messages, setMessages] = useState<MessageProps[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);
  const lastOpRef = useRef<"prepend" | "append" | null>(null);
  const initialCenteredRef = useRef(false);
  const isFetchingUpRef = useRef(false);
  const isFetchingDownRef = useRef(false);

  const fetchMessageUp = useCallback(async () => {
    if (isEndUp || isFetchingUpRef.current) return;
    try {
      const el = containerRef.current;
      if (el) prevScrollHeightRef.current = el.scrollHeight;
      isFetchingUpRef.current = true;

      const apiResponse = await fetch("/api/search/direct-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          messageId,
          pageUp,
        }),
      });

      if (!apiResponse.ok) {
        console.error("Failed to fetch messages up");
        return;
      }

      const response = await apiResponse.json();
      if (response.success === true && response.statusCode === 200) {
        setMessages((prev) => [...response.data.items, ...prev]);
        setPageUp((prev) => prev + 1);
        setIsEndUp(response.data.metadata.is_last_page);
        lastOpRef.current = "prepend";
      }
    } catch (error) {
      console.group();
      console.error("Error fetching messages up:", error);
      console.log("Server direct message up error");
      console.groupEnd();
    } finally {
      isFetchingUpRef.current = false;
    }
  }, [messageId, pageUp, isEndUp]);

  const fetchMessageDown = useCallback(async () => {
    if (isEndDown || isFetchingDownRef.current) return;
    try {
      isFetchingDownRef.current = true;
      const apiResponse = await fetch("/api/search/direct-down", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          messageId,
          pageDown,
        }),
      });

      if (!apiResponse.ok) {
        console.error("Failed to fetch messages down");
        return;
      }

      const response = await apiResponse.json();
      if (response.success === true && response.statusCode === 200) {
        setMessages((prev) => [...prev, ...response.data.items]);
        setPageDown((prev) => prev + 1);
        setIsEndDown(response.data.metadata.is_last_page);
        lastOpRef.current = "append";
      }
    } catch (error) {
      console.group();
      console.error("Error fetching messages down:", error);
      console.log("Server direct message down error");
      console.groupEnd();
    } finally {
      isFetchingDownRef.current = false;
    }
  }, [messageId, pageDown, isEndDown]);

  useEffect(() => {
    fetchMessageUp();
  }, [fetchMessageUp]);

  useEffect(() => {
    fetchMessageDown();
  }, [fetchMessageDown]);

  // handle scroll viewport events from ScrollArea
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 48; // pixels from top/bottom to trigger
    if (el.scrollTop <= threshold) {
      // reached top -> load previous messages
      if (!isEndUp && !isFetchingUpRef.current) {
        // set prev scroll height already done inside fetchMessageUp
        fetchMessageUp();
      }
    } else if (el.scrollHeight - el.scrollTop - el.clientHeight <= threshold) {
      // reached bottom -> load next messages
      if (!isEndDown && !isFetchingDownRef.current) {
        fetchMessageDown();
      }
    }
  };

  // preserve scroll position when messages are prepended or set center for initial load
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If first time we have messages, center the view
    if (!initialCenteredRef.current && messageId.length > 0) {
      // center vertically
      el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
      initialCenteredRef.current = true;
      lastOpRef.current = null;
      return;
    }

    // If we just prepended messages, adjust scroll to keep view stable
    if (lastOpRef.current === "prepend") {
      const prev = prevScrollHeightRef.current || 0;
      const newScroll = el.scrollHeight - prev + el.scrollTop;
      // clamp
      el.scrollTop = Math.max(
        0,
        Math.min(newScroll, el.scrollHeight - el.clientHeight)
      );
      lastOpRef.current = null;
      prevScrollHeightRef.current = 0;
    }
  }, [messageId]);

  return (
    <div className="h-full w-full">
      <ScrollArea
        ref={containerRef}
        onScrollViewport={handleScroll}
        className="h-full"
      >
        <div className="flex flex-col">
          {messages.map((m) => (
            <div key={m._id} className="px-2 py-1">
              {/* Minimal rendering; replace with real message UI */}
              <div className="rounded bg-secondary/10 p-2">{m._id}</div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
