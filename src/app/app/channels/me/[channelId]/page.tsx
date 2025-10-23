"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AutoLink from "@/components/common/AutoLink";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Message } from "@/interfaces/websocketDirectChat.interfaces";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface UserChatWith {
  id: string;
  displayname: string;
  username: string;
  avatar_ipfs_hash: string;
}

export default function DirectMessagePage() {
  // console.log("edwedwedwed", conversation);
  const router = useRouter();
  const { channelId } = useParams<{
    channelId: string;
  }>();
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
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    originMessage: string
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const content = editMessage.messageEdit.trim();
      if (originMessage === content) return;
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

  const handleScroll = () => {
    const el = listRef.current;
    console.log(
      "ScrollTop:",
      el?.scrollTop,
      "ScrollHeight:",
      el?.scrollHeight,
      "loadingMore:",
      loadingMore,
      "isLastPage:",
      isLastPage,
      "sending:",
      sending
    );
    if (!el || loadingMore || isLastPage || sending) return;

    const THRESHOLD = 100; // Tăng lên
    if (el.scrollTop <= THRESHOLD) {
      console.log("Trigger load more");
      prevScrollHeightRef.current = el.scrollHeight;
      prevScrollTopRef.current = el.scrollTop;
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

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

  const autoResize = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    const contentHeight = element.scrollHeight;
    const maxHeight = Math.min(contentHeight, 200);
    element.style.height = `${maxHeight}px`;
    element.style.overflowY = contentHeight > 200 ? "auto" : "hidden";
  };

  const resizeNew = useCallback(() => autoResize(newMessageRef.current), []);

  useLayoutEffect(() => {
    resizeNew();
  }, [newMessage, resizeNew]);

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

  useEffect(() => {
    if (loadingMore) {
      setLoadingMore(false);
    }
  }, [messages, currentPage]);

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
        <Button
          onClick={() => router.push(`/app/channels/me/${channelId}/call`)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Start Call
        </Button>
        <span className="text-xs text-[var(--muted-foreground)]">
          Page {currentPage + 1}
        </span>
      </div>

      <ScrollArea
        ref={listRef}
        onScrollViewport={handleScroll}
        className="flex-1 px-6 py-6"
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

                <div className="flex w-full">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={`https://ipfs.de-id.xyz/ipfs/${message.sender.avatar_ipfs_hash}`}
                    />
                    <AvatarFallback>
                      {userChatWith.displayname} Avartar
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex w-full flex-col items-start gap-1">
                    {!editMessageField[message._id] ? (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="group w-full">
                            <div className="flex items-center gap-2">
                              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                                {message.sender.display_name}
                              </h2>
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {new Date(message.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm leading-6 text-left">
                              <AutoLink text={message.content} />
                              {message.isEdited && (
                                <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                                  (edited)
                                </span>
                              )}
                            </div>
                          </div>
                        </HoverCardTrigger>

                        <HoverCardContent side="top" align="end">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleMessageReply(message)}
                                  className="peer rounded px-2 py-1"
                                >
                                  <FontAwesomeIcon
                                    icon={faArrowTurnUp}
                                    rotation={270}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reply</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {userChatWith.id !== message.sender.dehive_id && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
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
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="peer rounded px-2 py-1 text-[var(--danger)]"
                                      onClick={() => {
                                        setDeleteMessageModal(true);
                                        setMessageDelete(message);
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent> Delete</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      <Textarea
                        name="editMessage"
                        value={editMessage.messageEdit}
                        onChange={handleEditMessageChange}
                        onKeyDown={(event) =>
                          handleEditMessageKeyDown(event, message.content)
                        }
                        placeholder="Edit message"
                        autoFocus
                        disabled={sending}
                        className="min-h-5 max-h-50 resize-none"
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
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <Dialog
        open={deleteMessageModal}
        onOpenChange={(open) => {
          setDeleteMessageModal(open);
          if (!open) setMessageDelete(null);
        }}
      >
        <DialogContent>
          {messageDelete ? (
            <>
              <DialogHeader>
                <DialogTitle>Delete Message</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this message?
                </DialogDescription>
              </DialogHeader>

              <Card className="mt-4">
                <CardContent className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage
                        src={`https://ipfs.de-id.xyz/ipfs/${messageDelete.sender.avatar_ipfs_hash}`}
                      />
                      <AvatarFallback>
                        {messageDelete.sender.display_name} Avatar
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
                </CardContent>
              </Card>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setDeleteMessageModal(false);
                    setMessageDelete(null);
                  }}
                  className="h-12 w-full max-w-[240px] rounded-xl bg-[#2b2d31] text-base font-semibold text-neutral-200 shadow-sm transition hover:bg-[#3a3d42]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    remove(messageDelete._id);
                    setDeleteMessageModal(false);
                    setMessageDelete(null);
                  }}
                  className="h-12 w-full max-w-[240px] rounded-xl bg-[#da373d] text-base font-semibold text-white shadow-sm transition hover:bg-[#b53035]"
                >
                  Delete
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="sticky bottom-0 left-0 right-0 border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-6 py-4 backdrop-blur">
        <div className="flex items-end gap-3 rounded-2xl bg-[var(--surface-primary)] p-3 shadow-lg">
          <Button className="h-11 w-11 shrink-0 rounded-full bg-[var(--surface-secondary)] text-lg text-[var(--foreground)] hover:bg-[var(--surface-tertiary)]">
            +
          </Button>
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
                <Button
                  onClick={() => {
                    setNewMessage((prev) => ({
                      ...prev,
                      replyTo: null,
                    }));
                    setMessageReply(null);
                  }}
                >
                  <FontAwesomeIcon icon={faX} />
                </Button>
              </div>
            )}
            <Textarea
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
              disabled={sending}
              className="min-h-5 max-h-50 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
