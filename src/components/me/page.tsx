"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useParams } from "next/navigation";
import { useDirectMessage } from "@/hooks/useDirectMessage";

interface Conversation {
  userA: string;
  userB: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function MessagePage({
  conversation,
}: {
  conversation: Conversation;
}) {
  const { userId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [editMessageField, setEditMessageField] = useState<
    Record<string, boolean>
  >({});
  const [currentPage, setCurrentPage] = useState(0);
  const [editMessage, setEditMessage] = useState({
    id: "",
    messageEdit: "",
  });
  const {
    messages,
    send,
    edit,
    remove,
    loadHistory,
    isLastPage,
    setPage,
    sending,
    err,
  } = useDirectMessage(conversation?._id);
  console.log("This is error", err);
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage, setPage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleNewMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewMessage(e.target.value);
  };

  const handleEditMessageKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const content = editMessage.messageEdit.trim();
      const messageId = editMessage.id;
      if (content && !sending) {
        edit(messageId, content);
        setEditMessage({
          id: "",
          messageEdit: "",
        });
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setEditMessageField(
        Object.fromEntries(messages.map((message) => [message._id, false]))
      );
      setEditMessage({ id: "", messageEdit: "" });
    }
  };

  const handleNewMessageKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const message = newMessage.trim();
      if (message && !sending) {
        send(message);
        setNewMessage("");
        return;
      }
    }
  };

  const handleEditMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditMessage((prev) => ({ ...prev, messageEdit: event.target.value }));
  };

  const editMessageModal = useCallback(() => {
    setEditMessageField(
      Object.fromEntries(messages.map((message) => [message._id, false]))
    );
  }, [messages]);

  useEffect(() => {
    editMessageModal();
  }, [editMessageModal]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleListScroll = () => {
    const element = listRef.current;
    if (!element || loadingMore || isLastPage || sending) return;

    const THRESHOLD = 24;
    if (element.scrollTop <= THRESHOLD) {
      prevScrollHeightRef.current = element.scrollHeight;
      prevScrollTopRef.current = element.scrollTop;
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  useLayoutEffect(() => {
    if (!loadingMore) return;
    const element = listRef.current;
    if (!element) return;

    const added = element.scrollHeight - prevScrollHeightRef.current;
    element.scrollTop = added;

    setLoadingMore(false);
  }, [messages, loadingMore]);

  useEffect(() => {
    if (currentPage === 0 && messages.length > 0) {
      const element = listRef.current;
      if (element) element.scrollTop = element.scrollHeight;
    }
  }, [messages.length, currentPage]);

  useEffect(() => {
    if (!loadingMore && !sending) {
      const element = listRef.current;
      if (element) element.scrollTop = element.scrollHeight;
    }
  }, [sending, loadingMore]);

  return (
    <div className="h-screen w-full bg-blue-500 flex flex-col">
      <div className="sticky top-0 left-0 right-0 bg-white/90 backdrop-blur border-t px-4 py-3">
        <h1>User A: {conversation?.userA}</h1>
        <h1>Current Page: {currentPage}</h1>
      </div>

      <div
        ref={listRef}
        onScroll={handleListScroll}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2"
      >
        {messages
          .filter((message) => message.isDeleted === false)
          .map((message) => (
            <div key={message._id} className="bg-red-400">
              {!editMessageField[message._id] ? (
                <>
                  <h1>{message.senderId}</h1>
                  <div className="flex flex-row gap-2">
                    <p>{message.content}</p>
                    {message.isEdited && (
                      <p className="text-blue-300">{"(edited)"}</p>
                    )}
                  </div>
                  <p>{String(message.createdAt)}</p>
                  {userId !== message.senderId && (
                    <>
                      <button
                        className="bg-yellow-400 "
                        onClick={() => remove(message._id)}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setEditMessageField(
                            Object.fromEntries(
                              messages.map((messagelist) => [
                                messagelist._id,
                                messagelist._id === message._id,
                              ])
                            )
                          );
                          setEditMessage({
                            id: message._id,
                            messageEdit: message.content,
                          });
                        }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </>
              ) : (
                <textarea
                  tabIndex={-1}
                  ref={(element: HTMLTextAreaElement) => {
                    element?.focus();
                  }}
                  name="editMessage"
                  value={editMessage.messageEdit}
                  onChange={handleEditMessageChange}
                  onKeyDown={handleEditMessageKeyDown}
                  placeholder="Type your message"
                  className="flex-1 rounded-md border px-3 outline-none"
                  autoFocus
                  disabled={sending}
                />
              )}
            </div>
          ))}
        {sending && <span>Sending...</span>}
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white/90 border-t px-4 py-3">
        <div className="flex gap-2">
          <textarea
            name="newMessage"
            value={newMessage}
            onChange={handleNewMessageChange}
            onKeyDown={handleNewMessageKeyDown}
            placeholder="Type your message"
            className="flex-1 rounded-md border px-3 outline-none"
            disabled={sending}
          />
        </div>
      </div>
    </div>
  );
}
