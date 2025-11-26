"use client";

import { useUser } from "@/hooks/useUser";
import MessageSkeleton from "./MessageSkeleton";
import { Button } from "@/components/ui/button";
import { getApiHeaders } from "@/utils/api.utils";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import Markdown from "@/components/common/Markdown";
import { useFingerprint } from "@/hooks/useFingerprint";
import LinkPreview from "@/components/common/LinkPreview";
import { ChannelProps } from "@/interfaces/server.interface";
import MessageInput from "@/components/messages/MessageInput";
import { useChannelMessage } from "@/hooks/useChannelMessage";
import AttachmentList from "@/components/common/AttachmentList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AvatarComponent from "@/components/common/AvatarComponent";
import { ServerMemberListProps } from "@/interfaces/user.interface";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import DeleteMessageDialog from "@/components/messages/DeleteMessageDialog";
import { MessageChannel } from "@/interfaces/websocketChannelChat.interface";
import ChannelMessageHeader from "@/components/messages/ChannelMessageHeader";
import ChannelMessageOption from "@/components/messages/ChannelMessageOption";
import {
  FileUploadProps,
  NewMessageProps,
} from "@/interfaces/message.interface";
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
  faPen,
  faTrash,
  faArrowTurnUp,
} from "@fortawesome/free-solid-svg-icons";

interface ChannelHistoryViewProps {
  channel: ChannelProps | null;
  serverId: string;
  channelId: string;
  messageSearchId: string;
  serverMembers: ServerMemberListProps[];
  setMessageSearchId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function ChannelHistoryView({
  channel,
  serverId,
  channelId,
  serverMembers,
  messageSearchId,
  setMessageSearchId,
}: ChannelHistoryViewProps) {
  const { user } = useUser();
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
  }, [channelId, messageSearchId, pageUp, isEndUp, fingerprintHash]);

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
  }, [channelId, messageSearchId, pageDown, isEndDown, fingerprintHash]);

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
      <ChannelMessageHeader
        channel={channel}
        serverId={serverId}
        channelId={channelId}
        setMessageSearchId={setMessageSearchId}
        debugInfo={undefined}
      />

      {fristLoad >= 2 ? (
        <ScrollArea
          ref={listRef}
          onScrollViewport={handleScroll}
          className="flex-1 px-6 py-6 bg-background"
        >
          <div className="flex flex-col gap-4">
            {loadingUp && (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="group relative flex flex-col w-full items-start gap-3 px-3 py-1 transition hover:bg-muted rounded-md"
                  >
                    <div className="flex w-full">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0 bg-muted" />
                      <div className="flex w-full flex-col items-start gap-1 ml-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20 bg-muted" />
                          <Skeleton className="h-3 w-16 bg-muted" />
                        </div>
                        <div className="w-full px-2 py-1 rounded">
                          <Skeleton className="h-4 w-full bg-muted mb-1" />
                          <Skeleton className="h-4 w-3/4 bg-muted" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                        <AvatarComponent
                          avatar_ipfs_hash={message.sender.avatar_ipfs_hash!}
                          displayname={message.sender.display_name}
                          status={
                            serverMembers?.find(
                              (user) =>
                                user.user_id === message.sender.dehive_id
                            )?.status
                          }
                        />
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
                                <Markdown>{message.content}</Markdown>
                                <LinkPreview
                                  content={message.content}
                                  className="mt-2 w-full max-w-xl"
                                />
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
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="group relative flex flex-col w-full items-start gap-3 px-3 py-1 transition hover:bg-muted rounded-md"
                  >
                    <div className="flex w-full">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0 bg-muted" />
                      <div className="flex w-full flex-col items-start gap-1 ml-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20 bg-muted" />
                          <Skeleton className="h-3 w-16 bg-muted" />
                        </div>
                        <div className="w-full px-2 py-1 rounded">
                          <Skeleton className="h-4 w-full bg-muted mb-1" />
                          <Skeleton className="h-4 w-3/4 bg-muted" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      ) : (
        <MessageSkeleton />
      )}

      <DeleteMessageDialog
        open={deleteMessageModal}
        onOpenChange={(open) => {
          setDeleteMessageModal(open);
          if (!open) setMessageDelete(null);
        }}
        message={messageDelete}
        onDelete={(messageId) => {
          remove(messageId);
          setMessages((prev) =>
            prev.filter((message) => message._id !== messageId)
          );
          setDeleteMessageModal(false);
          setMessageDelete(null);
        }}
        getStatus={(message) =>
          serverMembers?.find(
            (user) => user.user_id === message.sender.dehive_id
          )?.status
        }
      />

      <MessageInput
        optionComponent={
          <ChannelMessageOption
            serverId={serverId}
            setListUploadFile={setListUploadFile}
          />
        }
        messageReply={messageReply}
        onReplyCancel={() => {
          setNewMessage((prev) => ({
            ...prev,
            replyTo: null,
          }));
          setMessageReply(null);
        }}
        newMessage={newMessage}
        onMessageChange={handleNewMessageChange}
        onMessageKeyDown={handleNewMessageKeyDown}
        onTextareaClick={() =>
          setEditMessageField(
            Object.fromEntries(messages.map((message) => [message._id, false]))
          )
        }
        listUploadFile={listUploadFile}
        setListUploadFile={setListUploadFile}
        sending={sending}
        newMessageRef={newMessageRef}
      />
    </div>
  );
}
