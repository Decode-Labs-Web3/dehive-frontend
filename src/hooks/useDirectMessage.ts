"use client";

import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint";
import { Message } from "@/interfaces/websocketDirectChat.interface";
import { getDirectChatSocketIO } from "@/lib/socketioDirectChatSingleton";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

// function mergeMessages(prev: Message[], incoming: Message[]): Message[] {
//   const map = new Map<string, Message>();
//   prev.forEach(message => map.set(message._id, message));
//   // console.log("edwedhjbwehdjewbdhjwedjhwedwed", map)
//   incoming.forEach(message => {
//     const existing = map.get(message._id);
//     map.set(message._id, existing ? { ...existing, ...message } : message);
//   });
//   return Array.from(map.values());
// }

export function useDirectMessage(conversationId: string) {
  const { fingerprintHash } = useFingerprint();
  const [page, setPage] = useState<number>(0);
  const [sending, setSending] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const socket = useRef(getDirectChatSocketIO()).current;
  const [messages, setMessages] = useState<Message[]>([]);

  const latestConversationId = useRef<string | undefined>(conversationId);
  useEffect(() => {
    latestConversationId.current = conversationId;
    setMessages([]);
  }, [conversationId]);

  useEffect(() => {
    latestConversationId.current = conversationId;
    setMessages([]);
    setPage(0);
    setIsLastPage(false);
    setErr(null);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const onNewMessage = (newMessage: Message) => {
      // console.log(newMessage)
      if (
        String(newMessage.conversationId) !==
        String(latestConversationId.current)
      )
        return;
      setMessages((prev) => {
        const existing = prev.find((message) => message._id === newMessage._id);
        if (existing) {
          return prev.map((message) =>
            message._id === newMessage._id
              ? { ...message, ...newMessage }
              : message
          );
        }
        return [...prev, newMessage];
      });
    };

    const onMessageEdited = (editMessage: Message & { isEdited?: boolean }) => {
      if (
        String(editMessage.conversationId) !==
        String(latestConversationId.current)
      )
        return;
      setMessages((prev) =>
        prev.map((oldMessage) =>
          oldMessage._id === editMessage._id
            ? ({
                ...oldMessage,
                content: editMessage.content,
                isEdited: editMessage.isEdited,
                updatedAt: editMessage.updatedAt,
              } as Message)
            : oldMessage
        )
      );
    };

    const onMessageDeleted = (
      deleteMessage: Message & { isDeleted?: boolean }
    ) => {
      if (
        String(deleteMessage.conversationId) !==
        String(latestConversationId.current)
      )
        return;
      setMessages((prev) =>
        prev.filter((oldMessage) => oldMessage._id !== deleteMessage._id)
      );
    };

    const onWebsocketError = (error: { message: string }) =>
      setErr(error?.message ?? "WS error");

    socket.on("newMessage", onNewMessage);
    socket.on("messageEdited", onMessageEdited);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("error", onWebsocketError);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageEdited", onMessageEdited);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("error", onWebsocketError);
    };
  }, [socket, conversationId]);

  const loadHistory = useCallback(async () => {
    if (!latestConversationId.current) return;

    try {
      setErr(null);
      const apiResponse = await fetch(
        "/api/me/conversation/conversation-list",
        {
          method: "POST",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ conversationId, page }),
          cache: "no-cache",
          signal: AbortSignal.timeout(10000),
        }
      );
      if (!apiResponse.ok) {
        console.error("API RESPONSE FROM useDirectMessage", apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (response.statusCode === 200 && response.message === "OK") {
        setMessages((prev) =>
          page === 0 ? response.data.items : [...response.data.items, ...prev]
        );
        // setMessages((prev) => {
        //   const incoming: Message[] = response.data.items || [];
        //   if (page === 0) {
        //     const map = new Map<string, Message>();
        //     incoming.forEach((message) => map.set(message._id, message));
        //     prev.forEach((message) => {
        //       if (map.has(message._id)) {
        //         map.set(message._id, { ...message, ...map.get(message._id)! });
        //       } else {
        //         map.set(message._id, message);
        //       }
        //     });
        //     return Array.from(map.values());
        //   }
        //   const existingIds = new Set(prev.map((m) => m._id));
        //   const older = incoming.filter((m) => !existingIds.has(m._id));
        //   return [...older, ...prev];
        // });
        setIsLastPage(response.data.metadata.is_last_page);
      }
    } catch (error) {
      console.error(error);
      setErr("Failed to load history");
    }
  }, [conversationId, page, fingerprintHash]);

  const send = useCallback(
    async (
      content: string,
      uploadIds: string[] = [],
      replyTo: string | null = null
    ) => {
      if (!latestConversationId.current) return;
      if (!content.trim() || content.length > 2000) return;
      try {
        setSending(true);
        setErr(null);
        socket.emit("sendMessage", {
          conversationId: String(latestConversationId.current),
          content,
          uploadIds,
          replyTo,
        });
      } finally {
        setSending(false);
      }
    },
    [socket]
  );

  const edit = useCallback(
    (messageId: string, content: string) => {
      if (!latestConversationId.current) return;
      if (!messageId || !content.trim()) return;
      socket.emit("editMessage", { messageId, content });
    },
    [socket]
  );

  const remove = useCallback(
    (messageId: string) => {
      if (!latestConversationId.current) return;
      if (!messageId) return;
      socket.emit("deleteMessage", { messageId });
    },
    [socket]
  );

  const messagesSorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
      ),
    [messages]
  );

  return {
    messages: messagesSorted,
    send,
    edit,
    remove,
    loadHistory,
    sending,
    isLastPage,
    setPage,
    err,
  };
}
