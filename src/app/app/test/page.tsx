"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Sender = {
  dehive_id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash?: string;
};

type Message = {
  _id: string;
  conversationId: string;
  sender: Sender;
  content: string;
  attachments: any[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  score: number;
};

type Metadata = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean; // còn page+1 ?
  hasPrevPage: boolean; // còn page-1 ?
};

type ApiResponse = {
  items: Message[];
  metadata: Metadata;
};

// ====== CONFIG ======
const LIMIT = 20;
const SEARCH_QUERY = "i";
const CONVERSATION_ID = "68e8b59f806fb5c06c6551a3";
const START_PAGE = 3; // trang giữa lúc mở

export default function ChatPage() {
  // danh sách message nối từ nhiều page
  const [messages, setMessages] = useState<Message[]>([]);

  // page nhỏ nhất đã load (gần 0 nhất, newer side)
  const [minPageLoaded, setMinPageLoaded] = useState<number | null>(null);
  // page lớn nhất đã load (xa 0 nhất, older side)
  const [maxPageLoaded, setMaxPageLoaded] = useState<number | null>(null);

  // cờ còn để load tiếp
  const [hasNewer, setHasNewer] = useState<boolean>(true); // còn page nhỏ hơn? (kéo xuống)
  const [hasOlder, setHasOlder] = useState<boolean>(true); // còn page lớn hơn? (kéo lên)

  // trạng thái loading hai phía
  const [loadingNewer, setLoadingNewer] = useState<boolean>(false);
  const [loadingOlder, setLoadingOlder] = useState<boolean>(false);

  // refs DOM
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // dùng để fix nhảy scroll khi prepend
  const prevScrollHeightRef = useRef<number>(0);

  // ===== API CALL =====
  const fetchPage = useCallback(async (page: number): Promise<ApiResponse> => {
    const url = `http://localhost:4004/api/dm/conversations/${CONVERSATION_ID}/search?search=${encodeURIComponent(
      SEARCH_QUERY
    )}&page=${page}&limit=${LIMIT}`;

    const res = await fetch(url, {
      headers: {
        "x-session-id": "b1edbaa9-e853-4db7-b056-6da981c0ebcd",
        "x-fingerprint-hashed":
          "pasonpctest_pasonpctest_pasonpctesttest_company",
      },
    });

    if (!res.ok) {
      throw new Error("Fetch failed " + res.status);
    }

    const json = await res.json();
    return json.data as ApiResponse;
  }, []);

  // ===== MERGE DATA =====

  // Thêm "older" (page lớn hơn: 4,5,6...) lên TRÊN list
  const prependPageData = useCallback((page: number, data: ApiResponse) => {
    setMessages((prev) => {
      const known = new Set(prev.map((m) => m._id));
      const fresh = data.items.filter((m) => !known.has(m._id));
      return [...fresh, ...prev];
    });

    setMaxPageLoaded((old) => (old === null ? page : Math.max(old, page)));

    // older side = page++ = backend báo bằng hasNextPage
    setHasOlder(data.metadata.hasNextPage);
  }, []);

  // Thêm "newer" (page nhỏ hơn: 2,1,0...) xuống DƯỚI list
  const appendPageData = useCallback((page: number, data: ApiResponse) => {
    setMessages((prev) => {
      const known = new Set(prev.map((m) => m._id));
      const fresh = data.items.filter((m) => !known.has(m._id));
      return [...prev, ...fresh];
    });

    setMinPageLoaded((old) => (old === null ? page : Math.min(old, page)));

    // newer side = page-- = backend báo bằng hasPrevPage
    setHasNewer(data.metadata.hasPrevPage);
  }, []);

  // ===== FIRST LOAD (START_PAGE) =====
  useEffect(() => {
    if (minPageLoaded !== null || maxPageLoaded !== null) return;

    (async () => {
      try {
        const data = await fetchPage(START_PAGE);
        setMessages(data.items);
        setMinPageLoaded(START_PAGE);
        setMaxPageLoaded(START_PAGE);

        setHasOlder(data.metadata.hasNextPage); // còn page+1 ?
        setHasNewer(data.metadata.hasPrevPage); // còn page-1 ?

        // Sau render lần đầu, kéo scroll tới giữa để user có thể kéo lên/xuống
        requestAnimationFrame(() => {
          const el = scrollContainerRef.current;
          if (el) {
            el.scrollTop = el.scrollHeight / 2;
          }
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [fetchPage, minPageLoaded, maxPageLoaded]);

  // ===== LOAD OLDER (cuộn LÊN, page++) =====
  const loadOlder = useCallback(async () => {
    if (loadingOlder) return;
    if (!hasOlder) return;
    if (maxPageLoaded === null) return;

    const targetPage = maxPageLoaded + 1;

    // lưu chiều cao trước prepend
    const el = scrollContainerRef.current;
    if (el) {
      prevScrollHeightRef.current = el.scrollHeight;
    }

    setLoadingOlder(true);
    try {
      const data = await fetchPage(targetPage);
      prependPageData(targetPage, data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasOlder, maxPageLoaded, fetchPage, prependPageData]);

  // giữ ổn định viewport sau prepend
  useLayoutEffect(() => {
    if (!loadingOlder) {
      const el = scrollContainerRef.current;
      if (el && prevScrollHeightRef.current > 0) {
        const diff = el.scrollHeight - prevScrollHeightRef.current;
        if (diff > 0) {
          el.scrollTop = el.scrollTop + diff;
        }
      }
    }
  }, [messages, loadingOlder]);

  // ===== LOAD NEWER (cuộn XUỐNG, page--) =====
  const loadNewer = useCallback(async () => {
    if (loadingNewer) return;
    if (!hasNewer) return;
    if (minPageLoaded === null) return;

    const targetPage = minPageLoaded - 1;
    if (targetPage < 0) {
      // page âm là không tồn tại => hết "mới hơn"
      return;
    }

    setLoadingNewer(true);
    try {
      const data = await fetchPage(targetPage);
      appendPageData(targetPage, data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNewer(false);
    }
  }, [loadingNewer, hasNewer, minPageLoaded, fetchPage, appendPageData]);

  // ===== OBSERVER: top = older, bottom = newer =====
  useEffect(() => {
    const container = scrollContainerRef.current;
    const topEl = topSentinelRef.current;
    const bottomEl = bottomSentinelRef.current;
    if (!container || !topEl || !bottomEl) return;

    const options: IntersectionObserverInit = {
      root: container,
      rootMargin: "200px",
      threshold: 0,
    };

    const topObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // user gần đầu -> loadOlder()
          loadOlder();
        }
      });
    }, options);

    const botObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // user gần đáy -> loadNewer()
          loadNewer();
        }
      });
    }, options);

    topObs.observe(topEl);
    botObs.observe(bottomEl);

    return () => {
      topObs.disconnect();
      botObs.disconnect();
    };
  }, [loadOlder, loadNewer]);

  // ===== UI COMPONENTS =====

  function MessageCard({ msg }: { msg: Message }) {
    return (
      <Card className="bg-neutral-900 border-neutral-800 text-white rounded-xl shadow-sm">
        <CardHeader className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <CardTitle className="text-[13px] font-semibold text-sky-300 leading-none">
                {msg.sender?.display_name ??
                  msg.sender?.username ??
                  "Unknown Sender"}
              </CardTitle>
              <CardDescription className="text-[11px] text-neutral-500 mt-1 flex flex-wrap gap-2">
                <span>
                  {new Date(msg.createdAt).toLocaleString(undefined, {
                    hour12: false,
                  })}
                </span>
                <span>score: {msg.score}</span>
                {msg.isEdited && <span>(edited)</span>}
              </CardDescription>
            </div>

            {msg.isDeleted && (
              <Badge
                variant="outline"
                className="border-red-500 text-red-400 text-[10px] leading-none h-auto py-0.5 px-1.5"
              >
                deleted
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 text-sm text-neutral-100 whitespace-pre-wrap">
          {msg.isDeleted ? "[deleted]" : msg.content}
        </CardContent>
      </Card>
    );
  }

  function StatusLine({
    text,
    tone = "muted",
  }: {
    text: string;
    tone?: "muted" | "end";
  }) {
    const base =
      "text-center text-[12px] leading-none px-4 py-2";
    const color =
      tone === "end"
        ? "text-neutral-600"
        : "text-neutral-400";
    return <p className={`${base} ${color}`}>{text}</p>;
  }

  return (
    <main className="flex h-screen flex-col bg-black text-white">
      {/* Header dùng Card */}
      <Card className="rounded-none border-b border-neutral-800 bg-neutral-900 text-white">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold text-white">
            Conversation {CONVERSATION_ID} | query="{SEARCH_QUERY}" | limit=
            {LIMIT}
          </CardTitle>

          <CardDescription className="text-[11px] text-neutral-500">
            pages loaded:{" "}
            {minPageLoaded !== null && maxPageLoaded !== null
              ? `${minPageLoaded} → ${maxPageLoaded}`
              : "…"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* khung scroll */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto bg-black"
      >
        {/* sentinel trên */}
        <div ref={topSentinelRef} className="h-px w-full" />

        {loadingOlder && <StatusLine text="Loading older..." />}

        {/* danh sách message */}
        <div className="flex flex-col gap-2 px-4 py-2">
          {messages.map((m) => (
            <MessageCard key={m._id} msg={m} />
          ))}
        </div>

        {loadingNewer && <StatusLine text="Loading newer..." />}

        {/* sentinel dưới */}
        <div ref={bottomSentinelRef} className="h-px w-full" />

        {/* hết phía trên */}
        {!hasOlder && (
          <StatusLine text="No more older messages" tone="end" />
        )}

        {/* hết phía dưới */}
        {!hasNewer && (
          <StatusLine text="No newer messages" tone="end" />
        )}
      </div>
    </main>
  );
}
