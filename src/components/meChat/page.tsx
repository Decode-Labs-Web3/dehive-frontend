"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import AutoLink from "@/components/common/AutoLink";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Message } from "@/interfaces/websocketMeChat.interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import {
  faArrowTurnUp,
  faPen,
  faTrash,
  faX,
} from "@fortawesome/free-solid-svg-icons";

interface NewMessage {
  content: string;
  uploadIds: string[];
  replyTo: string | null;
}

interface MessageMePageProps {
  channelId: string;
}

interface UserChatWith {
  id: string;
  displayname: string;
  username: string;
  avatar_ipfs_hash: string;
}

export default function MessageMePage({ channelId }: MessageMePageProps) {
  // console.log("edwedwedwed", conversation);
  const router = useRouter();
  const [messageReply, setMessageReply] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState<NewMessage>({
    content: "",
    uploadIds: [],
    replyTo: null,
  });
  const [userChatWith, setUserChatWith] = useState<UserChatWith>({
    id: "",
    displayname: "",
    username: "",
    avatar_ipfs_hash: "",
  });
  const [messageDelete, setMessageDelete] = useState<Message | null>(null);
  const [deleteMessageModal, setDeleteMessageModal] = useState(false);
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
  } = useDirectMessage(channelId);
  console.log("This is error", err);
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage, setPage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleNewMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewMessage((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
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
      const message = newMessage.content.trim();
      if (message && !sending) {
        send(message, newMessage.uploadIds, newMessage.replyTo);
        setNewMessage({
          content: "",
          uploadIds: [],
          replyTo: null,
        });
        setMessageReply(null);
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

  const handleMessageReply = (messageReply: Message) => {
    setMessageReply(messageReply);
    setNewMessage((prev) => ({
      ...prev,
      replyTo: messageReply._id,
    }));
    setEditMessageField(
      Object.fromEntries(messages.map((message) => [message._id, false]))
    );

    newMessageRef.current?.focus();
  };

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

  const newMessageRef = useRef<HTMLTextAreaElement | null>(null);
  const editMessageRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResize = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  const resizeNew = useCallback(() => autoResize(newMessageRef.current), []);
  const resizeEdit = useCallback(() => autoResize(editMessageRef.current), []);

  useLayoutEffect(() => {
    resizeNew();
  }, [newMessage, resizeNew]);

  useLayoutEffect(() => {
    resizeEdit();
  }, [editMessageRef, resizeEdit]);

  const fetchUserChatWith = async () => {
    try {
      const apiResponse = await fetch("/api/user/chat-with", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ conversationId: channelId }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      if (!apiResponse.ok) {
        console.error(apiResponse);
        return;
      }
      const response = await apiResponse.json();
      if (response.statusCode === 200 && response.message === "OK") {
        setUserChatWith(response.data);
      }
    } catch (error) {
      console.error(error);
      console.log("Server get user chat with error");
    }
  };

  useEffect(() => {
    fetchUserChatWith();
  }, []);

  return (
    <div className="flex h-screen w-full flex-col bg-[var(--surface-primary)] text-[var(--foreground)]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={`https://ipfs.de-id.xyz/ipfs/${userChatWith.avatar_ipfs_hash}`}
            />
            <AvatarFallback>{userChatWith.displayname} Avartar</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[var(--foreground)]">
                {userChatWith?.displayname}
              </h1>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push(`/app/channels/me/${channelId}/call`)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Start Call
        </button>
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
                className="group relative flex flex-col w-full items-start gap-3 rounded-md px-3 py-1 transition hover:bg-[var(--surface-hover)]"
              >
                {message.replyTo?._id && (
                  <>
                    {messages
                      .filter((m) => m._id === message.replyTo?._id)
                      .map((replied) => (
                        <div
                          key={replied._id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-tertiary)] border-l-4 border-[var(--accent)] mb-1 max-w-full"
                        >
                          <span className="text-xs font-semibold text-[var(--accent)] mr-2">
                            Replying to {replied.sender.display_name}
                          </span>
                          <span className="truncate text-xs text-[var(--muted-foreground)]">
                            {replied.content}
                          </span>
                        </div>
                      ))}
                  </>
                )}

                <div className="flex">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={`https://ipfs.de-id.xyz/ipfs/${message.sender.avatar_ipfs_hash}`}
                    />
                    <AvatarFallback>
                      {userChatWith.displayname} Avartar
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex w-full max-w-3xl flex-col items-start gap-1">
                    {!editMessageField[message._id] ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-sm font-semibold text-[var(--foreground)]">
                            {message.sender.display_name}
                          </h2>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-6 text-left">
                          <AutoLink text={message.content} />
                          {message.isEdited && (
                            <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                              (edited)
                            </span>
                          )}
                        </div>
                        {userChatWith.id === message.sender.dehive_id && (
                          <div className="absolute -top-2 right-2 hidden items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-2 py-1 text-xs font-medium text-[var(--muted-foreground)] shadow-lg transition group-hover:flex">
                            <div className="relative">
                              <button
                                onClick={() => handleMessageReply(message)}
                                className="peer rounded px-2 py-1"
                              >
                                <FontAwesomeIcon
                                  icon={faArrowTurnUp}
                                  rotation={270}
                                />
                              </button>
                              <div className="absolute -top-10 rounded left-1/2 -translate-x-1/2 opacity-0  peer-hover:opacity-100 p-2 text-white bg-black">
                                Reply
                              </div>
                            </div>
                          </div>
                        )}
                        {userChatWith.id !== message.sender.dehive_id && (
                          <div className="absolute -top-2 right-2 hidden items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-2 py-1 text-xs font-medium text-[var(--muted-foreground)] shadow-lg transition group-hover:flex">
                            <div className="relative">
                              <button
                                onClick={() => handleMessageReply(message)}
                                className="peer rounded px-2 py-1"
                              >
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
                                onClick={() => {
                                  setDeleteMessageModal(true);
                                  setMessageDelete(message);
                                }}
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
                        // ref={(element: HTMLTextAreaElement) => {
                        //   element?.focus();
                        // }}
                        name="editMessage"
                        ref={editMessageRef}
                        value={editMessage.messageEdit}
                        onChange={handleEditMessageChange}
                        onKeyDown={handleEditMessageKeyDown}
                        placeholder="Edit message"
                        className="min-h-5 max-h-50 resize-none w-full rounded-xl border border-[var(--accent-border)] bg-[var(--surface-secondary)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                        autoFocus
                        disabled={sending}
                      />
                    )}
                  </div>
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

      {deleteMessageModal && messageDelete && (
        <div
          role="dialog"
          className="fixed inset-0 flex items-center justify-center z-30"
        >
          <div
            tabIndex={-1}
            ref={(element: HTMLDivElement) => {
              element?.focus();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setDeleteMessageModal(false);
                setMessageDelete(null);
              }
            }}
            onClick={() => {
              setDeleteMessageModal(false);
              setMessageDelete(null);
            }}
            className="fixed inset-0 bg-black/80 z-40"
          />
          <div
            className="z-50 relative w-full max-w-xl rounded-2xl border border-[#1e1f22] bg-[#313338] p-6 text-white shadow-2xl"
            aria-modal="true"
            aria-labelledby="delete-message-title"
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 text-neutral-400 transition hover:text-neutral-200"
              onClick={() => {
                setDeleteMessageModal(false);
                setMessageDelete(null);
              }}
            >
              <FontAwesomeIcon icon={faX} />
            </button>

            <h1
              id="delete-message-title"
              className="text-2xl font-bold text-white"
            >
              Delete Message
            </h1>
            <p className="mt-1 text-sm text-neutral-300">
              Are you sure you want to delete this message?
            </p>

            <div className="mt-4 rounded-xl bg-[#2b2d31] px-4 py-3 shadow-inner">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={`https://ipfs.de-id.xyz/ipfs/${messageDelete.sender.avatar_ipfs_hash}`}
                  />
                  <AvatarFallback>
                    {userChatWith.displayname} Avartar
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-base font-semibold text-yellow-400">
                      {messageDelete.sender.username}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(messageDelete.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-200">
                    {messageDelete.content}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  setDeleteMessageModal(false);
                  setMessageDelete(null);
                }}
                className="h-12 w-full max-w-[240px] rounded-xl bg-[#2b2d31] text-base font-semibold text-neutral-200 shadow-sm transition hover:bg-[#3a3d42]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  remove(messageDelete._id);
                  setDeleteMessageModal(false);
                  setMessageDelete(null);
                }}
                className="h-12 w-full max-w-[240px] rounded-xl bg-[#da373d] text-base font-semibold text-white shadow-sm transition hover:bg-[#b53035]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 left-0 right-0 border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 backdrop-blur">
        <div className="flex items-end gap-3 rounded-2xl bg-[var(--surface-primary)] p-3 shadow-lg">
          <button className="h-11 w-11 shrink-0 rounded-full bg-[var(--surface-secondary)] text-lg text-[var(--foreground)] hover:bg-[var(--surface-tertiary)]">
            +
          </button>
          <div className="flex-1">
            {messageReply && (
              <div className="flex justify-between items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-[var(--surface-tertiary)] border-l-4 border-[var(--accent)]">
                <div>
                  <span className="text-xs font-semibold text-[var(--accent)]">
                    Replying to {messageReply.sender.display_name}
                  </span>
                  <span className="truncate text-xs text-[var(--muted-foreground)]">
                    {messageReply.content}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNewMessage((prev) => ({
                      ...prev,
                      replyTo: null,
                    }));
                    setMessageReply(null);
                  }}
                >
                  <FontAwesomeIcon icon={faX} />
                </button>
              </div>
            )}
            <textarea
              ref={newMessageRef}
              name="content"
              value={newMessage.content}
              onChange={handleNewMessageChange}
              onKeyDown={handleNewMessageKeyDown}
              onClick={() =>
                setEditMessageField(
                  Object.fromEntries(
                    messages.map((message) => [message._id, false])
                  )
                )
              }
              placeholder="Message"
              className="min-h-5 max-h-50 resize-none w-full rounded-xl border border-transparent bg-transparent px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)]"
              disabled={sending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
