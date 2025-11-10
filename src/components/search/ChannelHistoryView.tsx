"use client";

import { useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import MessageSkeleton from "./MessageSkeleton";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import AutoLink from "@/components/common/AutoLink";
import { useFingerprint } from "@/hooks/useFingerprint";
import { Card, CardContent } from "@/components/ui/card";
import FilePreview from "@/components/common/FilePreview";
import { useChannelMember } from "@/hooks/useChannelMember";
import { useChannelMessage } from "@/hooks/useChannelMessage";
import AttachmentList from "@/components/common/AttachmentList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AirdropDropdown from "@/components/airdrop/AirdropDropdown";
import { ServerMemberListProps } from "@/interfaces/user.interface";
import ChannelSearchBar from "@/components/search/ChannelSearchBar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ServerMemberList from "@/components/messages/ServerMemberList";
import { MessageChannel } from "@/interfaces/websocketChannelChat.interface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChannelMessageOption from "@/components/messages/ChannelMessageOption";
import {
  FileUploadProps,
  NewMessageProps,
} from "@/interfaces/message.interface";
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
  faX,
  faPen,
  faTrash,
  faCircle,
  faHashtag,
  faArrowTurnUp,
} from "@fortawesome/free-solid-svg-icons";

interface ChannelHistoryViewProps {
  serverId: string;
  channelId: string;
  messageSearchId: string;
  serverMembers: ServerMemberListProps[];
  setMessageSearchId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function ChannelHistoryView({
  serverId,
  channelId,
  serverMembers,
  messageSearchId,
  setMessageSearchId,
}: ChannelHistoryViewProps) {
  const { user } = useUser();
  const { channelMembers } = useChannelMember();
  const channelInfo = useMemo(() => {
    return channelMembers.find((channel) => channel._id === channelId);
  }, [channelId]);
  const { fingerprintHash } = useFingerprint();
  const [fristLoad, setfirstLoad] = useState(0);
  const [isEndUp, setIsEndUp] = useState(false);
  const [pageUp, setPageUp] = useState<number>(0);
  const [loadingUp, setLoadingUp] = useState(false);
  const [isEndDown, setIsEndDown] = useState(false);
  const [pageDown, setPageDown] = useState<number>(0);
  const [loadingDown, setLoadingDown] = useState(false);
  const [messages, setMessages] = useState<MessageChannel[]>([]);
  const [deleteMessageModal, setDeleteMessageModal] = useState(false);
  const [messageDelete, setMessageDelete] = useState<MessageChannel | null>(
    null
  );
  const [editMessage, setEditMessage] = useState({
    id: "",
    messageEdit: "",
  });

  const newMessageRef = useRef<HTMLTextAreaElement | null>(null);

  const { send, edit, remove, sending } = useChannelMessage(channelId);
  const [messageReply, setMessageReply] = useState<MessageChannel | null>(null);
  const [newMessage, setNewMessage] = useState<NewMessageProps>({
    content: "",
    uploadIds: [],
    replyTo: null,
  });

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

  const [editMessageField, setEditMessageField] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setMessages([]);
    setPageUp(0);
    setPageDown(0);
    setIsEndUp(false);
    setIsEndDown(false);
    setfirstLoad(0);
    setLoadingUp(false);
    setLoadingDown(false);
    setLastLoadDirection("init");
    firstPinRef.current = false;
    prevScrollHeightRef.current = 0;
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [messageSearchId]);

  const fetchMessageUp = useCallback(async () => {
    if (isEndUp) return;
    try {
      const apiResponse = await fetch("/api/search/channel-up", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          channelId,
          messageId: messageSearchId,
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
        setIsEndUp(response.data.metadata.is_last_page);
        setfirstLoad((prev) => prev + 1);
      }
    } catch (error) {
      console.group();
      console.error("Error fetching messages up:", error);
      console.log("Server direct message up error");
      console.groupEnd();
    }
  }, [channelId, messageSearchId, pageUp, isEndUp]);

  useEffect(() => {
    fetchMessageUp();
  }, [fetchMessageUp]);

  const fetchMessageDown = useCallback(async () => {
    if (isEndDown) return;
    try {
      const apiResponse = await fetch("/api/search/channel-down", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          channelId,
          messageId: messageSearchId,
          pageDown,
        }),
      });

      if (!apiResponse.ok) {
        console.error("Failed to fetch messages up");
        return;
      }

      const response = await apiResponse.json();
      if (response.success === true && response.statusCode === 200) {
        setMessages((prev) => [...prev, ...response.data.items]);
        setIsEndDown(response.data.metadata.is_last_page);
        setfirstLoad((prev) => prev + 1);
      }
    } catch (error) {
      console.group();
      console.error("Error fetching messages up:", error);
      console.log("Server direct message up error");
      console.groupEnd();
    }
  }, [channelId, messageSearchId, pageDown, isEndDown]);

  useEffect(() => {
    fetchMessageDown();
  }, [fetchMessageDown]);

  useEffect(() => {
    if (isEndDown) {
      setMessageSearchId(null);
    }
  }, [isEndDown, setMessageSearchId]);

  const editMessageModal = useCallback(() => {
    setEditMessageField(
      Object.fromEntries(messages.map((message) => [message._id, false]))
    );
  }, [messages]);

  useEffect(() => {
    editMessageModal();
  }, [editMessageModal]);

  const handleEditMessageKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    originMessage: string
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const content = editMessage.messageEdit.trim();
      if (originMessage === content) return;
      const messageId = editMessage.id;
      if (content) {
        edit(messageId, content);
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId
              ? { ...message, content: content, isEdited: true }
              : message
          )
        );
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

  const handleEditMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditMessage((prev) => ({ ...prev, messageEdit: event.target.value }));
  };

  const handleNewMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewMessage((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const [listUploadFile, setListUploadFile] = useState<FileUploadProps[]>([]);

  const handleNewMessageKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const message = newMessage.content.trim();
      console.log("New message content Quang Minh:", message);
      if (message && !sending) {
        // console.log("Send message  Quang Minh:", message);
        send(message, newMessage.uploadIds, newMessage.replyTo);
        setNewMessage({
          content: "",
          uploadIds: [],
          replyTo: null,
        });
        setListUploadFile([]);
        setMessageReply(null);
        // console.log("Push to channel after send message");
        setMessageSearchId(null);
        return;
      }
    }
  };

  useEffect(() => {
    const uploadIds = listUploadFile.map((file) => file.uploadId);
    setNewMessage((prev) => ({ ...prev, uploadIds: uploadIds }));
  }, [listUploadFile]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);

  const [lastLoadDirection, setLastLoadDirection] = useState<
    "up" | "down" | "init"
  >("init");

  const handleScroll = () => {
    const element = listRef.current;
    if (!element || loadingDown || loadingUp || lastLoadDirection !== "init")
      return;
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

    if (element.scrollTop === 0 && !isEndUp) {
      console.log("Trigger load up more");
      setLastLoadDirection("up");
      setLoadingUp(true);

      prevScrollHeightRef.current = element.scrollHeight;
      console.log(element.scrollHeight);
      console.log("Previous scroll height:", prevScrollHeightRef.current);
      setPageUp((prev) => prev + 1);
    } else if (
      element.scrollHeight === element.scrollTop + element.clientHeight &&
      !isEndDown
    ) {
      // console.log("Trigger load down more");
      setLastLoadDirection("down");
      prevScrollHeightRef.current = element?.scrollHeight;
      setLoadingDown(true);
      setPageDown((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (lastLoadDirection === "init") return;
    const element = listRef.current;
    if (!element) return;
    if (lastLoadDirection === "up") {
      // console.log("chaỵ vào day ne");
      const newScrollHeightRef = element.scrollHeight;
      // console.log("New scroll height:", newScrollHeightRef);
      // console.log("Previous scroll height:", prevScrollHeightRef.current);
      element.scrollTop =
        newScrollHeightRef - prevScrollHeightRef.current + element.clientHeight;
      console.log(element.scrollTop);
      prevScrollHeightRef.current = newScrollHeightRef;
      setLoadingUp(false);
      setLastLoadDirection("init");
    } else if (lastLoadDirection === "down") {
      element.scrollTop = prevScrollHeightRef.current - element.clientHeight;
      prevScrollHeightRef.current = element.scrollHeight;
      setLoadingDown(false);
      setLastLoadDirection("init");
    }
  }, [messages, lastLoadDirection]);

  const targetMessageRef = useRef<HTMLDivElement | null>(null);
  const firstPinRef = useRef(false);

  useLayoutEffect(() => {
    if (firstPinRef.current) return;
    if (fristLoad < 2) return;

    const listEl = listRef.current;
    const targetEl = targetMessageRef.current;
    if (!listEl || !targetEl) return;

    const targetOffset = targetEl.offsetTop;
    const targetHeight = targetEl.offsetHeight;
    const containerHeight = listEl.clientHeight;

    const desiredScrollTop =
      targetOffset - (containerHeight / 2 - targetHeight / 2);

    listEl.scrollTop = desiredScrollTop < 0 ? 0 : desiredScrollTop;

    firstPinRef.current = true;
  }, [fristLoad, messages]);

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground">
            <FontAwesomeIcon icon={faHashtag} className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {channelInfo?.name}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ChannelSearchBar
            channelId={channelId}
            setMessageSearchId={setMessageSearchId}
          />
          <AirdropDropdown serverId={serverId} />
          <ServerMemberList />
          {/* <span className="text-xs text-muted-foreground">
            Page up: {pageUp} {isEndUp && "yes"} --- Page down: {pageDown}{" "}
            {isEndDown && "yes"}
          </span> */}
        </div>
      </div>

      {fristLoad >= 2 ? (
        <ScrollArea
          ref={listRef}
          onScrollViewport={handleScroll}
          className="flex-1 px-6 py-6 bg-background"
        >
          <div className="flex flex-col gap-4">
            {loadingUp && (
              <>
                <Skeleton className="h-20 w-full bg-muted" />
                <Skeleton className="h-20 w-full bg-muted" />
                <Skeleton className="h-20 w-full bg-muted" />
                <h1>Loading page up...</h1>
              </>
            )}
            {fristLoad > 1 &&
              messages
                .filter((message) => !message.isDeleted)
                .map((message) => {
                  const referencedMessage = message.replyTo
                    ? messages.find((m) => m._id === message.replyTo?._id)
                    : null;
                  const replyInfo = message.replyTo
                    ? {
                        displayName:
                          referencedMessage?.sender.display_name ??
                          serverMembers.find(
                            (user) => user.user_id === message.replyTo?.senderId
                          )?.displayname ??
                          "Unknown user",
                        content:
                          referencedMessage?.content ??
                          message.replyTo?.content ??
                          "Message unavailable",
                      }
                    : null;

                  return (
                    <div
                      key={message._id}
                      ref={
                        message._id === messageSearchId
                          ? targetMessageRef
                          : null
                      }
                      className="group relative flex flex-col w-full items-start gap-3 px-3 py-1 transition hover:bg-muted rounded-md"
                    >
                      {replyInfo && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border-l-4 border-accent mb-2 max-w-full">
                          <span className="text-xs font-semibold text-foreground mr-2">
                            Replying to {replyInfo.displayName}
                          </span>
                          <span className="truncate text-xs text-foreground">
                            {replyInfo.content}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex w-full ${
                          message._id === messageSearchId ? "bg-red-500" : null
                        }`}
                      >
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage
                            src={`https://ipfs.de-id.xyz/ipfs/${message.sender.avatar_ipfs_hash}`}
                          />
                          <AvatarFallback>
                            {message.sender.display_name} Avatar
                          </AvatarFallback>
                        </Avatar>
                        {serverMembers.find(
                          (user) => user.user_id === message.sender.dehive_id
                        )?.status === "online" && (
                          <FontAwesomeIcon
                            icon={faCircle}
                            className="h-2 w-2 text-emerald-500"
                          />
                        )}
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
                              <AttachmentList
                                attachments={message.attachments}
                              />
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
                              className="min-h-5 max-h-50 resize-none bg-input text-foreground border-border"
                            />
                          )}

                          {!editMessageField[message._id] && (
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() =>
                                        handleMessageReply(message)
                                      }
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
                              {user._id === message.sender.dehive_id && (
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
                                                  messagelist._id ===
                                                    message._id,
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
                                            console.log(
                                              "Delete message",
                                              message
                                            );
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
                  );
                })}
            {loadingDown && (
              <>
                <h1>Loading page down...</h1>
                <Skeleton className="h-20 w-full bg-muted" />
                <Skeleton className="h-20 w-full bg-muted" />
                <Skeleton className="h-20 w-full bg-muted" />
              </>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      ) : (
        <MessageSkeleton />
      )}

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
                    setMessages((prev) =>
                      prev.filter(
                        (message) => message._id !== messageDelete._id
                      )
                    );
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
          <ChannelMessageOption
            serverId={serverId}
            setListUploadFile={setListUploadFile}
          />
          <div className="flex-1">
            <FilePreview
              listUploadFile={listUploadFile}
              setListUploadFile={setListUploadFile}
            />
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
