"use client";

// import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import AutoLink from "@/components/common/AutoLink";
import { getStatusSocketIO } from "@/lib/socketioStatus";
import { Card, CardContent } from "@/components/ui/card";
import { useSoundContext } from "@/contexts/SoundContext";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getDirectChatSocketIO } from "@/lib/socketioDirectChat";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  faX,
  faPen,
  faTrash,
  faCircle,
  faArrowTurnUp,
} from "@fortawesome/free-solid-svg-icons";

interface MessageProps {
  _id: string;
  conversationId: string;
  sender: {
    dehive_id: string;
    username: string;
    display_name: string;
    avatar_ipfs_hash: string;
  };
  content: string;
  attachments: [];
  isEdited: false;
  isDeleted: false;
  replyTo: null | ReplyMessage;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ReplyMessage {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface UserChatWith {
  id: string;
  displayname: string;
  username: string;
  avatar_ipfs_hash: string;
  status: string;
}

export default function DirectHistory() {
  const router = useRouter();
  const { channelId, messageId } = useParams();
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isEndUp, setIsEndUp] = useState(false);
  const [pageUp, setPageUp] = useState<number>(0);
  const [isEndDown, setIsEndDown] = useState(false);
  const [pageDown, setPageDown] = useState<number>(0);
  const [loadingUp, setLoadingUp] = useState(false);
  const [loadingDown, setLoadingDown] = useState(false);
  const [fristLoad, setfirstLoad] = useState(0);

  const [userChatWith, setUserChatWith] = useState<UserChatWith>({
    id: "",
    displayname: "",
    username: "",
    avatar_ipfs_hash: "",
    status: "offline",
  });

  const fetchUserChatWith = useCallback(async () => {
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
  }, [channelId]);

  useEffect(() => {
    fetchUserChatWith();
  }, [fetchUserChatWith]);

  const fetchMessageUp = useCallback(async () => {
    if (isEndUp) return;
    try {
      const apiResponse = await fetch("/api/search/direct-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          messageId,
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
  }, [messageId, pageUp, isEndUp]);

  useEffect(() => {
    fetchMessageUp();
  }, [fetchMessageUp]);

  const fetchMessageDown = useCallback(async () => {
    if (isEndDown) return;
    try {
      const apiResponse = await fetch("/api/search/direct-down", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          messageId,
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
  }, [messageId, pageDown, isEndDown]);

  useEffect(() => {
    fetchMessageDown();
  }, [fetchMessageDown]);

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
      prevScrollHeightRef.current = element?.scrollHeight;
      setPageUp((prev) => prev + 1);
    } else if (
      element.scrollHeight === element.scrollTop + element.clientHeight && !isEndDown
    ) {
      console.log("Trigger load down more");
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
      const newScrollHeightRef = element.scrollHeight;
      element.scrollTop = newScrollHeightRef - prevScrollHeightRef.current;
      prevScrollHeightRef.current = newScrollHeightRef;
      setLoadingUp(false);
      setLastLoadDirection("init");
    } else if (lastLoadDirection === "down") {
      element.scrollTop = element.scrollHeight - element.clientHeight;
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
          <Avatar className="w-8 h-8">
            <AvatarImage
            // src={`https://ipfs.de-id.xyz/ipfs/${userChatWith.avatar_ipfs_hash}`}
            />
            {/* <AvatarFallback>{userChatWith.displayname} Avatar</AvatarFallback> */}
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {/* {userChatWith?.displayname} */}
              </h1>
            </div>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/app/channels/me/${channelId}/call`)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80"
        >
          Start Call
        </Button>
        <span className="text-xs text-muted-foreground">
          Page up: {pageUp} {isEndUp && "yes"} --- Page down: {pageDown}{" "}
          {isEndDown && "yes"}
        </span>
      </div>

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
              .map((message) => (
                <div
                  key={message._id}
                  ref={message._id === messageId ? targetMessageRef : null}
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

                  <div className={`flex w-full ${message._id === messageId ? "bg-red-500" : null}`}>
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage
                        src={`https://ipfs.de-id.xyz/ipfs/${message.sender.avatar_ipfs_hash}`}
                      />
                      <AvatarFallback>
                        {message.sender.display_name} Avatar
                      </AvatarFallback>
                    </Avatar>
                    {message.sender.dehive_id !== userChatWith.id && (
                      <FontAwesomeIcon
                        icon={faCircle}
                        className="h-2 w-2 text-emerald-500"
                      />
                    )}
                    {message.sender.dehive_id === userChatWith.id &&
                      userChatWith.status === "online" && (
                        <FontAwesomeIcon
                          icon={faCircle}
                          className="h-2 w-2 text-emerald-500"
                        />
                      )}
                    <div className="flex w-full flex-col items-start gap-1 ml-3 relative group">
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
                      {/* {!editMessageField[message._id] ? (
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
                        {userChatWith.id !== message.sender.dehive_id && (
                          <>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className="h-8 w-8 p-0 bg-secondary hover:bg-accent text-secondary-foreground"
                                    // onClick={() => {
                                    //   setEditMessageField(
                                    //     Object.fromEntries(
                                    //       messages.map((messagelist) => [
                                    //         messagelist._id,
                                    //         messagelist._id === message._id,
                                    //       ])
                                    //     )
                                    //   );
                                    //   setEditMessage({
                                    //     id: message._id,
                                    //     messageEdit: message.content,
                                    //   });
                                    // }}
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
                                    // onClick={() => {
                                    //   setDeleteMessageModal(true);
                                    //   setMessageDelete(message);
                                    // }}
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
                    )} */}
                    </div>
                  </div>
                </div>
              ))}
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

      <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-card px-6 py-4 backdrop-blur">
        {/* {isAtBottom && (
            <div className="flex flex-row bg-red-500">
              <h1>You{"'"}re Viewing Older Messages</h1>
              <Button onClick={handleJumpToPresent}>Jump to present</Button>
            </div>
          )} */}
        <div className="flex items-end gap-3 rounded-2xl bg-secondary p-3 shadow-lg">
          <Button className="h-11 w-11 shrink-0 rounded-full bg-muted text-lg text-muted-foreground hover:bg-accent">
            +
          </Button>
          <div className="flex-1">
            <Textarea
              name="content"
              placeholder="Message"
              className="min-h-5 max-h-50 resize-none bg-input text-foreground border-border placeholder-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
