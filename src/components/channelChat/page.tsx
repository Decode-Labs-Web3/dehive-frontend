"use client";

import Image from "next/image";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useParams } from "next/navigation";
import { useChannelMessage } from "@/hooks/useChannelMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTurnUp,
  faPen,
  faTrash,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { MessageChannel } from "@/interfaces/websocketChannelChat.interfaces";

interface NewMessage {
  content: string;
  uploadIds: string[];
  replyTo: string | null;
}

export default function MessageChannelPage({
  conversationId,
}: {
  conversationId: string;
}) {
  // console.log("edwedwedwed", conversation);
  const { userId } = useParams();
  const [messageReply, setMessageReply] = useState<MessageChannel | null>(null);
  const [newMessage, setNewMessage] = useState<NewMessage>({
    content: "",
    uploadIds: [],
    replyTo: null,
  });

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
  } = useChannelMessage(conversationId);
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

  const handleMessageReply = (messageReply: MessageChannel) => {
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

  return (
    <div className="flex h-screen w-full flex-col bg-[var(--surface-primary)] text-[var(--foreground)]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold uppercase text-[var(--accent-foreground)]">
            <h1>Channel chat</h1>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[var(--foreground)]">
                {conversationId}
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
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase text-[var(--accent-foreground)]">
                    <Image
                      src={
                        message.sender
                          ? `https://ipfs.de-id.xyz/ipfs/${message.sender.avatar_ipfs_hash}`
                          : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                      }
                      alt={"Avatar"}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
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
                          {message.content}
                          {message.isEdited && (
                            <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                              (edited)
                            </span>
                          )}
                        </div>
                        {userId === message.sender.dehive_id && (
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
                        {userId !== message.sender.dehive_id && (
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
