"use client";

import { useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import Markdown from "@/components/common/Markdown";
import { useServerRoot } from "@/hooks/useServerRoot";
import { useServerMember } from "@/hooks/useServerMember";
import LinkPreview from "@/components/common/LinkPreview";
import { useSoundContext } from "@/contexts/SoundContext";
import { useChannelMessage } from "@/hooks/useChannelMessage";
import MessageInput from "@/components/messages/MessageInput";
import AttachmentList from "@/components/common/AttachmentList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AvatarComponent from "@/components/common/AvatarComponent";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ChannelHistoryView from "@/components/search/ChannelHistoryView";
import DeleteMessageDialog from "@/components/messages/DeleteMessageDialog";
import { getChannelChatSocketIO } from "@/lib/socketioChannelChatSingleton";
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

export default function ChannelMessagePage() {
  const { user } = useUser();
  const { sound } = useSoundContext();
  const { serverRoot } = useServerRoot();
  const { serverMembers } = useServerMember();
  const [messageSearchId, setMessageSearchId] = useState<string | null>(null);
  const { serverId, channelId } = useParams<{
    serverId: string;
    channelId: string;
  }>();
  const channel = useMemo(() => {
    return serverRoot
      .flatMap((category) => category.channels)
      .find((channel) => channel._id === channelId);
  }, [serverRoot, channelId]);
  const [messageReply, setMessageReply] = useState<MessageChannel | null>(null);
  const [newMessage, setNewMessage] = useState<NewMessageProps>({
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

  const [listUploadFile, setListUploadFile] = useState<FileUploadProps[]>([]);

  const newMessageRenderRef = useRef(false);

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
        setListUploadFile([]);
        setMessageReply(null);
        newMessageRenderRef.current = true;
        return;
      }
    }
  };

  useEffect(() => {
    const uploadIds = listUploadFile.map((file) => file.uploadId);
    setNewMessage((prev) => ({ ...prev, uploadIds: uploadIds }));
  }, [listUploadFile]);

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

  const prevScrollHeightRef = useRef(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const isScrollRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const element = listRef.current;
    if (element && currentPage === 0 && messages.length > 0) {
      element.scrollTop = element.scrollHeight - element.clientHeight;
      prevScrollHeightRef.current = element.scrollHeight;
    }
  }, [messages.length, currentPage]);

  const handleScroll = () => {
    const element = listRef.current;
    if (!element || isLastPage || loadingMore) return;
    if (element.scrollTop === 0) {
      // console.log("Trigger load more");
      isScrollRef.current = true;
      prevScrollHeightRef.current = element?.scrollHeight;
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const element = listRef.current;
    if (!element) return;
    const currentScrollHeight = element.scrollHeight;
    if (newMessageRenderRef.current) {
      element.scrollTop = element.scrollHeight - element.clientHeight;
      newMessageRenderRef.current = false;
      prevScrollHeightRef.current = currentScrollHeight;
      return;
    }
    if (isScrollRef.current) {
    setLoadingMore(false);
    element.scrollTop = currentScrollHeight - prevScrollHeightRef.current;
    isScrollRef.current = false;
    } else if (currentScrollHeight < prevScrollHeightRef.current) {
      element.scrollTop -= prevScrollHeightRef.current - currentScrollHeight;
    }
    prevScrollHeightRef.current = currentScrollHeight;
  }, [messages]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const socket = getChannelChatSocketIO();
    const onNewMessage = (message: MessageChannel) => {
      console.log("play sound on new message");
      if (message.sender.dehive_id !== user._id) {
        const audio = audioRef.current;
        if (!audio) return;
        if (!sound) return;
        audio.play().catch(() => {});
      }
    };
    socket.on("newMessage", onNewMessage);
    return () => {
      socket.off("newMessage", onNewMessage);
    };
  }, [user, sound]);

  if (messageSearchId) {
    return (
      <ChannelHistoryView
        channel={channel || null}
        serverId={serverId}
        channelId={channelId}
        serverMembers={serverMembers}
        messageSearchId={messageSearchId}
        setMessageSearchId={setMessageSearchId}
      />
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <ChannelMessageHeader
        channel={channel || null}
        serverId={serverId}
        channelId={channelId}
        setMessageSearchId={setMessageSearchId}
        audioElement={<audio ref={audioRef} src="/sounds/ting.wav" preload="auto" />}
        debugInfo={undefined}
      />

      <ScrollArea
        ref={listRef}
        onScrollViewport={handleScroll}
        className="flex-1 bg-background"
      >
        <div className="flex flex-col gap-4 px-6 py-6">
          {loadingMore && (
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
            </>
          )}
          {messages
            .filter((message) => message.isDeleted === false)
            .map((message) => {
              const referencedMessage = message.replyTo
                ? messages.find((m) => m._id === message.replyTo?._id)
                : null;
              const replyDisplayName = message.replyTo
                ? referencedMessage?.sender.display_name ??
                  serverMembers.find(
                    (user) => user.user_id === message.replyTo?.senderId
                  )?.displayname ??
                  "Unknown user"
                : null;
              const replyContent = message.replyTo
                ? referencedMessage?.content ??
                  message.replyTo?.content ??
                  "Message unavailable"
                : null;

              return (
                <div
                  key={message._id}
                  className="group relative flex flex-col w-full items-start gap-3 px-3 py-1 transition hover:bg-muted rounded-md"
                >
                  {message.replyTo && replyDisplayName && replyContent && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border-l-4 border-accent mb-2 max-w-full">
                      <span className="text-xs font-semibold text-foreground mr-2">
                        Replying to {replyDisplayName}
                      </span>
                      <span className="truncate text-xs text-foreground">
                        {replyContent}
                      </span>
                    </div>
                  )}

                  <div className="flex w-full">
                    <AvatarComponent
                      avatar_ipfs_hash={message.sender.avatar_ipfs_hash!}
                      displayname={message.sender.display_name}
                      status={
                        serverMembers?.find(
                          (user) => user.user_id === message.sender.dehive_id
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
                          <AttachmentList attachments={message.attachments} />
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
              );
            })}
          {sending && (
            <span className="px-3 text-xs text-muted-foreground">
              Sending...
            </span>
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <DeleteMessageDialog
        open={deleteMessageModal}
        onOpenChange={(open) => {
          setDeleteMessageModal(open);
          if (!open) setMessageDelete(null);
        }}
        message={messageDelete}
        onDelete={(messageId) => {
          remove(messageId);
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
