"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import Wallet from "@/components/common/Wallet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import Markdown from "@/components/common/Markdown";
import LinkPreview from "@/components/common/LinkPreview";
import { useDirectMember } from "@/hooks/useDirectMember";
import { useSoundContext } from "@/contexts/SoundContext";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import MessageInput from "@/components/messages/MessageInput";
import AttachmentList from "@/components/common/AttachmentList";
import AvatarComponent from "@/components/common/AvatarComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DirectFileList from "@/components/messages/DirectFileList";
import DirectSearchBar from "@/components/search/DirectSearchBar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Message } from "@/interfaces/websocketDirectChat.interface";
import DirectHistoryView from "@/components/search/DirectHistoryView";
import { getDirectChatSocketIO } from "@/lib/socketioDirectChatSingleton";
import DeleteMessageDialog from "@/components/messages/DeleteMessageDialog";
import DirectMessageOption from "@/components/messages/DirectMessageOption";
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
  faPhone,
  faTrash,
  faArrowTurnUp,
} from "@fortawesome/free-solid-svg-icons";

export default function DirectMessagePage() {
  const router = useRouter();
  const { sound } = useSoundContext();
  const { isConnected } = useAccount();
  const { channelId } = useParams<{ channelId: string }>();
  const [messageSearchId, setMessageSearchId] = useState<string | null>(null);
  const { directMembers } = useDirectMember();
  const userChatWith = useMemo(() => {
    return directMembers.find((member) => member.conversationid === channelId);
  }, [directMembers, channelId]);
  const [messageReply, setMessageReply] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState<NewMessageProps>({
    content: "",
    uploadIds: [],
    replyTo: null,
  });
  const [listUploadFile, setListUploadFile] = useState<FileUploadProps[]>([]);
  const [messageDelete, setMessageDelete] = useState<Message | null>(null);
  const [deleteMessageModal, setDeleteMessageModal] = useState(false);
  const [editMessageField, setEditMessageField] = useState<
    Record<string, boolean>
  >({});
  const [privateMode, setPrivateMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [editMessage, setEditMessage] = useState({ id: "", messageEdit: "" });

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
        setEditMessage({ id: "", messageEdit: "" });
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

  const newMessageRenderRef = useRef(false);

  const handleNewMessageKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const message = newMessage.content.trim();
      if (message && !sending) {
        newMessageRenderRef.current = true;
        send(message, newMessage.uploadIds, newMessage.replyTo);
        setNewMessage({ content: "", uploadIds: [], replyTo: null });
        setListUploadFile([]);
        setMessageReply(null);
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

  const newMessageRef = useRef<HTMLTextAreaElement | null>(null);

  const handleMessageReply = (messageReply: Message) => {
    setMessageReply(messageReply);
    setNewMessage((prev) => ({ ...prev, replyTo: messageReply._id }));
    setEditMessageField(
      Object.fromEntries(messages.map((message) => [message._id, false]))
    );
    newMessageRef.current?.focus();
  };

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

  const prevScrollHeightRef = useRef(0);
  const listRef = useRef<HTMLDivElement | null>(null);
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
    if (element.scrollTop === 0) {
      prevScrollHeightRef.current = element.scrollHeight;
      setLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    setLoadingMore(false);
    const element = listRef.current;
    if (!element) return;
    if (newMessageRenderRef.current) {
      element.scrollTop = element.scrollHeight;
      newMessageRenderRef.current = false;
      return;
    }
    const newScrollHeightRef = element.scrollHeight;
    element.scrollTop = newScrollHeightRef - prevScrollHeightRef.current;
    prevScrollHeightRef.current = newScrollHeightRef;
  }, [messages]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const socket = getDirectChatSocketIO();
    const onNewMessage = (message: Message) => {
      if (message.sender.dehive_id === userChatWith?.user_id) {
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
  }, [userChatWith?.user_id, sound]);

  useEffect(() => {
    if (privateMode) {
      const index = userChatWith?.wallets.findIndex(
        (wallet) => wallet.is_primary === true
      );
      console.log(
        "Private mode on, switching wallet",
        userChatWith?.wallets[index!]?.address
      );
      if (index !== undefined && index !== -1) {
        router.push(
          `/app/channels/me/${channelId}/${userChatWith?.wallets[index].address}`
        );
      }
    }
  }, [privateMode, channelId, router, userChatWith?.wallets]);

  const [isAllowPrivate, setIsAllowPrivate] = useState(false);

  useEffect(() => {
    const isAllow = userChatWith?.wallets.find(
      (wallet) => wallet.is_primary === true
    );
    if (isAllow !== undefined) {
      setIsAllowPrivate(true);
    }
  }, [userChatWith?.wallets]);

  if (messageSearchId) {
    return (
      <DirectHistoryView
        channelId={channelId}
        userChatWith={userChatWith!}
        messageSearchId={messageSearchId}
        setMessageSearchId={setMessageSearchId}
      />
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-3 backdrop-blur">
        <audio ref={audioRef} src="/sounds/ting.wav" preload="auto" />
        <div className="flex items-center gap-3">
          <AvatarComponent
            avatar_ipfs_hash={userChatWith?.avatar_ipfs_hash!}
            displayname={userChatWith?.displayname}
            status={userChatWith?.status}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {userChatWith?.displayname}
              </h1>
            </div>
          </div>
        </div>
        {isAllowPrivate && (
          <>
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={privateMode}
                  onCheckedChange={setPrivateMode}
                />
                <Label htmlFor="private">
                  {privateMode ? "Private ON" : "Private OFF"}
                </Label>
              </div>
            ) : (
              <Wallet />
            )}
          </>
        )}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push(`/app/channels/me/${channelId}/call`)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
          </Button>
          <DirectSearchBar setMessageSearchId={setMessageSearchId} />
          <DirectFileList channelId={channelId} />
          {/* <span className="text-xs text-muted-foreground">
            Page {currentPage}
          </span> */}
        </div>
      </div>

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
              const replyInfo = message.replyTo
                ? {
                    displayName:
                      referencedMessage?.sender.display_name ??
                      (message.replyTo?.senderId === userChatWith?.user_id
                        ? userChatWith.displayname
                        : "You"),
                    content:
                      referencedMessage?.content ??
                      message.replyTo?.content ??
                      "Message unavailable",
                  }
                : null;

              return (
                <div
                  key={message._id}
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

                  <div className="flex w-full">
                    <AvatarComponent
                      avatar_ipfs_hash={message.sender.avatar_ipfs_hash!}
                      displayname={message.sender.display_name}
                      status={
                        message.sender.dehive_id === userChatWith?.user_id
                          ? userChatWith.status
                          : "online"
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
                          {userChatWith?.user_id !==
                            message.sender.dehive_id && (
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
          message.sender.dehive_id === userChatWith?.user_id
            ? userChatWith?.status
            : "online"
        }
      />

      <MessageInput
        optionComponent={
          <DirectMessageOption
            channelId={channelId}
            setListUploadFile={setListUploadFile}
          />
        }
        messageReply={messageReply}
        onReplyCancel={() => {
          setNewMessage((prev) => ({ ...prev, replyTo: null }));
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
