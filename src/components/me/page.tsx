"use client";

import Image from "next/image";
import { UserDataProps, UserChatWith } from "@/interfaces/index.interfaces";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useParams } from "next/navigation";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTurnUp,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

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
  const [currentUser, setCurrentUser] = useState<UserDataProps | null>();
  const [UserChatWith, setUserChatWith] = useState<UserChatWith | null>();
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

  useEffect(() => {
    const currentUserData = localStorage.getItem("userData");
    if (currentUserData) {
      setCurrentUser(JSON.parse(currentUserData));
    }
  }, []);

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

  const fetchChatUser = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/user/user-other", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ userId }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (response.statusCode === 200 && response.message === "User found") {
        setUserChatWith(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch user chatting with errror");
    }
  }, [userId]);

  useEffect(() => {
    fetchChatUser();
  }, [fetchChatUser]);

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
    <div className="flex h-screen w-full flex-col bg-[var(--surface-primary)] text-[var(--foreground)]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold uppercase text-[var(--accent-foreground)]">
            <Image
              src={
                UserChatWith
                  ? `http://35.247.142.76:8080/ipfs/${UserChatWith.avatar_ipfs_hash}`
                  : "http://35.247.142.76:8080/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
              }
              alt={"Avatar"}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[var(--foreground)]">
                {UserChatWith?.display_name}
              </h1>
            </div>
          </div>
        </div>
        <span className="text-xs text-[var(--muted-foreground)]">
          Page {currentPage + 1}
        </span>
      </div>

      <div
        ref={listRef}
        onScroll={handleListScroll}
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        <div className="flex flex-col gap-2">
          {messages
            .filter((message) => message.isDeleted === false)
            .map((message) => (
              <div
                key={message._id}
                className="group relative flex w-full items-start gap-3 rounded-md px-3 py-1 transition hover:bg-[var(--surface-hover)]"
              >
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase text-[var(--accent-foreground)]">
                  {currentUser?._id === message.senderId ? (
                    <Image
                      src={
                        currentUser
                          ? `http://35.247.142.76:8080/ipfs/${currentUser.avatar_ipfs_hash}`
                          : "http://35.247.142.76:8080/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                      }
                      alt={"Avatar"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src={
                        UserChatWith
                          ? `http://35.247.142.76:8080/ipfs/${UserChatWith.avatar_ipfs_hash}`
                          : "http://35.247.142.76:8080/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                      }
                      alt={"Avatar"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex w-full max-w-3xl flex-col items-start gap-1">
                  {!editMessageField[message._id] ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-sm font-semibold text-[var(--foreground)]">
                          {message.senderId === currentUser?._id ? (
                            <>{currentUser?.display_name}</>
                          ) : (
                            <>{UserChatWith?.display_name}</>
                          )}
                        </h2>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-6 text-left">
                        {message.content}
                        {message.isEdited && (
                          <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                            (edited)
                          </span>
                        )}
                      </div>
                      {userId === message.senderId && (
                        <div className="absolute -top-2 right-2 hidden items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-2 py-1 text-xs font-medium text-[var(--muted-foreground)] shadow-lg transition group-hover:flex">
                          <div className="relative">
                            <button className="peer rounded px-2 py-1">
                              <FontAwesomeIcon
                                icon={faArrowTurnUp}
                                rotation={270}
                              />
                            </button>
                            <div className="absolute -top-10 rounded left-1/2 -translate-x-1/2  peer-hover:opacity-100 p-2 text-white bg-black">
                              Reply
                            </div>
                          </div>
                        </div>
                      )}
                      {userId !== message.senderId && (
                        <div className="absolute -top-2 right-2 hidden items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-2 py-1 text-xs font-medium text-[var(--muted-foreground)] shadow-lg transition group-hover:flex">
                          <div className="relative">
                            <button className="peer rounded px-2 py-1">
                              <FontAwesomeIcon
                                icon={faArrowTurnUp}
                                rotation={270}
                              />
                            </button>

                            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-black p-2 text-white z-50 opacity-0 peer-hover:opacity-100">
                              Reply
                            </div>
                          </div>

                          <div className="relative">
                            <button
                              className="peer rounded px-2 py-1"
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
                              <FontAwesomeIcon icon={faPen} />
                            </button>

                            <div className="pointer-event-none absolute -top-10 left-1/2 -translate-x-1/2 rounded p-2 opacity-0 peer-hover:opacity-100 bg-black text-white z-50">
                              Edit
                            </div>
                          </div>

                          <div className="relative">
                            <button
                              className="peer rounded px-2 py-1 text-[var(--danger)]"
                              onClick={() => remove(message._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <div className="pointer-event-none absolute -top-10 left-1/2 -translate-x-1/2 text-white bg-black z-50 rounded p-2 opacity-0 peer-hover:opacity-100">
                              Delete
                            </div>
                          </div>
                        </div>
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
                      placeholder="Edit message"
                      className="min-h-[96px] w-full rounded-xl border border-[var(--accent-border)] bg-[var(--surface-secondary)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      autoFocus
                      disabled={sending}
                    />
                  )}
                </div>
              </div>
            ))}
          {sending && (
            <span className="px-3 text-xs text-[var(--muted-foreground)]">
              Sending...
            </span>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 backdrop-blur">
        <div className="flex items-end gap-3 rounded-2xl bg-[var(--surface-primary)] p-3 shadow-lg">
          <button className="h-11 w-11 shrink-0 rounded-full bg-[var(--surface-secondary)] text-lg text-[var(--foreground)] hover:bg-[var(--surface-tertiary)]">
            +
          </button>
          <div className="flex-1">
            <textarea
              name="newMessage"
              value={newMessage}
              onChange={handleNewMessageChange}
              onKeyDown={handleNewMessageKeyDown}
              placeholder="Message"
              className="h-10 w-full rounded-xl border border-transparent bg-transparent px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)]"
              disabled={sending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
