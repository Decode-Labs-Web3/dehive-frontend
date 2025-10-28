"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/utils/cookie.utils";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import AutoLink from "@/components/common/AutoLink";
import { Card, CardContent } from "@/components/ui/card";
import { useChannelMessage } from "@/hooks/useChannelMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { MessageChannel } from "@/interfaces/websocketChannelChat.interface";

interface NewMessage {
  content: string;
  uploadIds: string[];
  replyTo: string | null;
}

export default function ChannelMessagePage() {
  const { channelId } = useParams<{
    channelId: string;
  }>();
  const [userId, setUserId] = useState<string>("");
  const [messageReply, setMessageReply] = useState<MessageChannel | null>(null);
  const [newMessage, setNewMessage] = useState<NewMessage>({
    content: "",
    uploadIds: [],
    replyTo: null,
  });
  const [messageDelete, setMessageDelete] = useState<MessageChannel | null>(
    null
  );
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
  } = useChannelMessage(channelId);
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
  const listRef = useRef<HTMLDivElement | null>(null);

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

  const newMessageRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResize = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    const contentHeight = element.scrollHeight;
    const maxHeight = Math.min(contentHeight, 200);
    element.style.height = `${maxHeight}px`;
    element.style.overflow = maxHeight > 200 ? "auto" : "hidden";
  };

  const resizeNew = useCallback(() => autoResize(newMessageRef.current), []);

  useLayoutEffect(() => {
    resizeNew();
  }, [newMessage, resizeNew]);

  useEffect(() => {
    const currentUserId = getCookie("userId");
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, []);

  useLayoutEffect(() => {
    resizeNew();
  }, [newMessage, resizeNew]);

  const prevScrollHeightRef = useRef(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const element = listRef.current;
    if (element && currentPage === 0 && messages.length > 0) {
      element.scrollTop = element.scrollHeight - element.clientHeight;
    }
  }, [messages.length, currentPage]);

  const handleScroll = () => {
    const element = listRef.current;
    if (!element || isLastPage || loadingMore) return;
    // const total = element?.scrollTop + element?.clientHeight;
    // console.log(
    //   "ScrollHeight:",
    //   element?.scrollHeight,
    //   "total:",
    //   total,
    //   "ScrollTop:",
    //   element?.scrollTop,
    //   "clientHeight:",
    //   element?.clientHeight
    // );

    if (element.scrollTop === 0) {
      console.log("Trigger load more");
      prevScrollHeightRef.current = element?.scrollHeight;
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    setLoadingMore(false);
    const element = listRef.current;
    if (element) {
      const newScrollHeightRef = element.scrollHeight;
      element.scrollTop = newScrollHeightRef - prevScrollHeightRef.current;
      prevScrollHeightRef.current = newScrollHeightRef;
    }
  }, [messages]);

  // useEffect(() => {
  //   if (!loadingMore) {
  //     const element = listRef.current;
  //     if (element) {
  //       element.scrollTop = element.scrollHeight;
  //     }
  //   }
  // }, [messages.length, loadingMore]);

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold uppercase text-accent-foreground">
            <h1>Channel chat</h1>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {channelId}
              </h1>
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          Page {currentPage}
        </span>
      </div>

      <ScrollArea
        ref={listRef}
        onScrollViewport={handleScroll}
        className="flex-1 px-6 py-6 bg-background"
      >
        <div className="flex flex-col gap-4">
          {loadingMore && (
            <>
              <Skeleton className="h-20 w-full bg-muted" />
              <Skeleton className="h-20 w-full bg-muted" />
              <Skeleton className="h-20 w-full bg-muted" />
            </>
          )}
          {messages
            .filter((message) => message.isDeleted === false)
            .map((message) => (
              <div
                key={message._id}
                className="group relative flex flex-col w-full items-start gap-3 px-3 py-1 transition hover:bg-muted rounded-md"
              >
                {message.replyTo?._id && (
                  <>
                    {messages
                      .filter((m) => m._id === message.replyTo?._id)
                      .map((replied) => (
                        <div
                          key={replied._id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border-l-4 border-accent mb-2 max-w-full"
                        >
                          <span className="text-xs font-semibold text-foreground mr-2">
                            Replying to {replied.sender.display_name}
                          </span>
                          <span className="truncate text-xs text-foreground">
                            {replied.content}
                          </span>
                        </div>
                      ))}
                  </>
                )}

                <div className="flex w-full">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage
                      src={`https://ipfs.de-id.xyz/ipfs/${message.sender.avatar_ipfs_hash}`}
                    />
                    <AvatarFallback>
                      {message.sender.display_name} Avatar
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex w-full flex-col items-start gap-1 ml-3 relative group">
                    {!editMessageField[message._id] ? (
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-foreground">
                            {message.sender.display_name}
                          </h2>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full whitespace-pre-wrap break-words text-sm leading-6 text-left text-foreground hover:bg-muted/50 px-2 py-1 rounded transition-colors">
                          <AutoLink text={message.content} />
                          {message.isEdited && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (edited)
                            </span>
                          )}
                        </div>
                      </div>
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
                        className="min-h-5 max-h-50 resize-none bg-input text-foreground border-border"
                      />
                    )}

                    {!editMessageField[message._id] && (
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => handleMessageReply(message)}
                                className="h-8 w-8 p-0 bg-secondary hover:bg-accent text-secondary-foreground"
                              >
                                <FontAwesomeIcon
                                  icon={faArrowTurnUp}
                                  rotation={270}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black">
                              Reply
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {userId === message.sender.dehive_id && (
                          <>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className="h-8 w-8 p-0 bg-secondary hover:bg-accent text-secondary-foreground"
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
                                <TooltipContent className="bg-black">
                                  Edit
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className="h-8 w-8 p-0 text-destructive bg-secondary hover:bg-accent"
                                    onClick={() => {
                                      setDeleteMessageModal(true);
                                      setMessageDelete(message);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black">
                                  Delete
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          {sending && (
            <span className="px-3 text-xs text-muted-foreground">
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
        <DialogContent className="bg-popover border-border text-popover-foreground">
          {messageDelete ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-popover-foreground">
                  Delete Message
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Are you sure you want to delete this message?
                </DialogDescription>
              </DialogHeader>

              <Card className="mt-4 bg-card border-border">
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
                        <span className="text-base font-semibold text-accent">
                          {messageDelete.sender.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(messageDelete.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
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
                  className="h-12 w-full max-w-[240px] rounded-xl bg-secondary text-secondary-foreground shadow-sm transition hover:bg-accent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    remove(messageDelete._id);
                    setDeleteMessageModal(false);
                    setMessageDelete(null);
                  }}
                  className="h-12 w-full max-w-[240px] rounded-xl bg-destructive text-destructive-foreground shadow-sm transition hover:bg-destructive/80"
                >
                  Delete
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-card px-6 py-4 backdrop-blur">
        <div className="flex items-end gap-3 rounded-2xl bg-secondary p-3 shadow-lg">
          <Button className="h-11 w-11 shrink-0 rounded-full bg-muted text-lg text-muted-foreground hover:bg-accent">
            +
          </Button>
          <div className="flex-1">
            {messageReply && (
              <div className="flex justify-between items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-muted border-l-4 border-accent">
                <div>
                  <span className="text-xs font-semibold text-accent">
                    Replying to {messageReply.sender.display_name}
                  </span>
                  <span className="truncate text-xs text-foreground">
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
                  className="text-muted-foreground hover:text-foreground"
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
              className="min-h-5 max-h-50 resize-none bg-input text-foreground border-border placeholder-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
