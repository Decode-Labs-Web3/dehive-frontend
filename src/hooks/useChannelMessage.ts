"use client";

import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getChannelChatSocketIO } from "@/lib/socketioChannelChatSingleton";
import { MessageChannel } from "@/interfaces/websocketChannelChat.interface";

export function useChannelMessage(channelId: string) {
  const { fingerprintHash } = useFingerprint();
  const [page, setPage] = useState<number>(0);
  const [sending, setSending] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const socket = useRef(getChannelChatSocketIO()).current;
  const [messages, setMessages] = useState<MessageChannel[]>([]);

  const latestConversationId = useRef<string | undefined>(channelId);
  useEffect(() => {
    latestConversationId.current = channelId;
    setMessages([]);
  }, [channelId]);

  useEffect(() => {
    latestConversationId.current = channelId;
    setMessages([]);
    setPage(0);
    setIsLastPage(false);
    setErr(null);
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;

    const onNewMessage = (newMessage: MessageChannel) => {
      // console.log(newMessage)
      if (String(newMessage.channelId) !== String(latestConversationId.current))
        return;
      setMessages((prev) =>
        prev.some((oldMessage) => oldMessage._id === newMessage._id)
          ? prev
          : [...prev, newMessage]
      );
    };

    const onMessageEdited = (
      editMessage: MessageChannel & { isEdited?: boolean }
    ) => {
      if (
        String(editMessage.channelId) !== String(latestConversationId.current)
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
              } as MessageChannel)
            : oldMessage
        )
      );
    };

    const onMessageDeleted = (
      deleteMessage: MessageChannel & { isDeleted?: boolean }
    ) => {
      if (
        String(deleteMessage.channelId) !== String(latestConversationId.current)
      )
        return;
      setMessages((prev) =>
        prev.filter((oldMessage) => oldMessage._id !== deleteMessage._id)
      );
      // setMessages((prev) =>
      //   prev.map((oldMessage) =>
      //     oldMessage._id === deleteMessage._id
      //       ? ({ ...oldMessage, isDeleted: oldMessage.isDeleted } as Message)
      //       : oldMessage
      //   )
      // );
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
  }, [socket, channelId]);

  const loadHistory = useCallback(async () => {
    if (!latestConversationId.current) return;

    try {
      setErr(null);
      const apiResponse = await fetch(
        "/api/servers/conversation/conversation-list",
        {
          method: "POST",
          headers: getApiHeaders(fingerprintHash, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ channelId, page }),
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
        setIsLastPage(response.data.metadata.is_last_page);
      }
    } catch (error) {
      console.error(error);
      setErr("Failed to load history");
    }
  }, [channelId, page, fingerprintHash]);

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
          channelId: String(latestConversationId.current),
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
