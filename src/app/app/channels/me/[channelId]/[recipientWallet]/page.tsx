"use client";

import { sepolia } from "wagmi/chains";
import { useUser } from "@/hooks/useUser";
import { useParams } from "next/navigation";
import { messageAbi } from "@/abi/messageAbi";
import Markdown from "@/components/common/Markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDirectMember } from "@/hooks/useDirectMember";
import { isAddress, getAddress, parseEther, type Abi } from "viem";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import SmartContractOption from "@/components/messages/SmartContractOption";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";

const PROXY_ADDRESS = process.env.NEXT_PUBLIC_PROXY_ADDRESS as
  | `0x${string}`
  | undefined;

import {
  computeConversationId,
  mockEncryptMessage,
  mockDecryptMessage,
  generateConversationKey,
  encryptConversationKeyForAddress,
  deriveFunctionSelector,
  getMyConversationKey,
} from "@/lib/scMessage";

export default function SmartContractMessagePage() {
  const { user } = useUser();
  const { directMembers } = useDirectMember();
  const { channelId, recipientWallet } = useParams<{
    channelId: string;
    recipientWallet: string;
  }>();
  const [newMessage, setNewMessage] = useState<string>("");
  const [initialFetched, setInitialFetched] = useState(false);
  const [conversationId, setConversationId] = useState<bigint | null>(null);
  const [first, setFirst] = useState(20);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      blockNumber: string;
      from: `0x${string}`;
      to: `0x${string}`;
      content: string;
      createdAt: string;
      sender: `0x${string}`;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();
  const [isRelayerMode, setIsRelayerMode] = useState(false);

  const proxy = PROXY_ADDRESS;

  const { data: payAsYouGoFee } = useReadContract({
    address: proxy,
    abi: messageAbi,
    functionName: "payAsYouGoFee",
    chainId: sepolia.id,
    query: { enabled: Boolean(proxy) },
  });

  const { data: relayerFee } = useReadContract({
    address: proxy,
    abi: messageAbi,
    functionName: "relayerFee",
    chainId: sepolia.id,
    query: { enabled: Boolean(proxy) },
  });

  const { data: myFunds } = useReadContract({
    address: proxy,
    abi: messageAbi,
    functionName: "funds",
    args: address ? [getAddress(address)] : undefined,
    chainId: sepolia.id,
    query: { enabled: Boolean(proxy && address) },
  });

  // On-chain relayer address cache (fetched once)
  const relayerRef = useRef<`0x${string}` | null>(null);
  useEffect(() => {
    const fetchRelayer = async () => {
      if (!publicClient || !proxy) return;
      try {
        const addr = (await publicClient.readContract({
          address: proxy,
          abi: messageAbi as unknown as Abi,
          functionName: "relayer" as never,
          args: [] as const,
        })) as unknown as `0x${string}`;
        relayerRef.current = getAddress(addr);
      } catch {}
    };
    void fetchRelayer();
  }, [publicClient, proxy]);

  const { writeContractAsync } = useWriteContract();

  const isFetchingRef = useRef(false);
  const messageOrderRef = useRef<string[]>([]);
  const messageMapRef = useRef<
    Map<
      string,
      {
        blockNumber: string;
        from: string;
        to: string;
        encryptedMessage: string;
        dec: string;
      }
    >
  >(new Map());
  const [conversationKey, setConversationKey] = useState<string | null>(null);
  const processedTxsRef = useRef<Set<string>>(new Set());
  const sendSelectorRef = useRef<string>("0x");
  const sendViaRelayerSelectorRef = useRef<string>("0x");
  const rpcNewCountRef = useRef<number>(0);

    const ensureConversationAndKey = useCallback(async (): Promise<{
    cid: bigint;
    key: string;
  }> => {
    if (!proxy) throw new Error("Proxy address missing");
    if (!address) throw new Error("No account");
    if (!isAddress(recipientWallet)) throw new Error("Invalid recipient");
    if (!publicClient) throw new Error("No public client");

    // 1) always have cid local
    const cid = computeConversationId(address, recipientWallet);
    if (conversationId !== cid) setConversationId(cid);

    // 2) read conversation
    const [, , , , createdAt] = (await publicClient.readContract({
      address: proxy,
      abi: messageAbi,
      functionName: "conversations",
      args: [cid],
    })) as readonly [
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      bigint
    ];

    let keyToUse = conversationKey;

    if (!createdAt || createdAt === BigInt(0)) {
      const convKey = generateConversationKey();
      const encForSender = await encryptConversationKeyForAddress(
        convKey,
        address
      );
      const encForReceiver = await encryptConversationKeyForAddress(
        convKey,
        recipientWallet
      );

      const txHash = await writeContractAsync({
        address: proxy,
        abi: messageAbi,
        functionName: "createConversation",
        args: [
          getAddress(recipientWallet),
          `0x${encForSender}`,
          `0x${encForReceiver}`,
        ],
        chainId: sepolia.id,
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      keyToUse = convKey;
    }

    if (!keyToUse) {
      keyToUse = await getMyConversationKey(publicClient, proxy, cid, address);
    }

    if (!keyToUse) throw new Error("No conversation key available");

    if (keyToUse !== conversationKey) setConversationKey(keyToUse);

    return { cid, key: keyToUse };
  }, [
    proxy,
    address,
    publicClient,
    conversationId,
    conversationKey,
    recipientWallet,
    writeContractAsync,
  ]);

  useEffect(() => {
    ensureConversationAndKey();
  }, [ensureConversationAndKey]);

  // Derive function selectors for sendMessage and sendMessageViaRelayer from ABI (robust to type changes)
  useEffect(() => {
    try {
      sendSelectorRef.current = deriveFunctionSelector(
        messageAbi as ReadonlyArray<{
          type: string;
          name?: string;
          inputs?: ReadonlyArray<{ type: string }>;
        }>,
        "sendMessage"
      );
      sendViaRelayerSelectorRef.current = deriveFunctionSelector(
        messageAbi as ReadonlyArray<{
          type: string;
          name?: string;
          inputs?: ReadonlyArray<{ type: string }>;
        }>,
        "sendMessageViaRelayer"
      );
    } catch {}
  }, []);

  // Realtime: subscribe directly to MessageSent logs to avoid heavy block polling
  const contractUnwatchRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!publicClient || !proxy) return;
    if (contractUnwatchRef.current) return;

    const unwatch = publicClient.watchContractEvent({
      address: proxy,
      abi: messageAbi as unknown as Abi,
      eventName: "MessageSent" as never,
      poll: true,
      pollingInterval: 10_000,
      onLogs: async (logs) => {
        try {
          for (const log of logs as Array<{
            transactionHash?: `0x${string}`;
            blockNumber?: bigint;
            args?: any;
          }>) {
            const txHash = log.transactionHash as `0x${string}` | undefined;
            if (txHash && processedTxsRef.current.has(txHash)) continue;

            const args = (log as any).args as {
              conversationId: bigint;
              from: `0x${string}`;
              to: `0x${string}`;
              encryptedMessage: string;
            };
            if (!args) continue;

            const cid = args.conversationId;
            const from = args.from;
            const to = args.to;
            const encryptedMessage = args.encryptedMessage;

            const cidMatch = conversationId ? cid === conversationId : false;
            const me = address ? getAddress(address) : undefined;
            const counterpart = isAddress(recipientWallet)
              ? getAddress(recipientWallet)
              : undefined;
            const participantsMatch =
              !!me &&
              !!counterpart &&
              ((getAddress(from) === me && getAddress(to) === counterpart) ||
                (getAddress(from) === counterpart && getAddress(to) === me));

            if (!(participantsMatch || cidMatch)) continue;

            let content = "(no conv key)";
            if (conversationKey) {
              try {
                content = mockDecryptMessage(encryptedMessage, conversationKey);
              } catch {
                content = "(failed to decrypt)";
              }
            }

            const block = await publicClient.getBlock({
              blockNumber: log.blockNumber,
            });
            const createdAt = new Date(
              Number(block.timestamp) * 1000
            ).toISOString();

            const isCounterpart =
              !!counterpart && getAddress(from) === counterpart;
            const id =
              txHash ||
              `${String(
                log.blockNumber ?? BigInt(0)
              )}:${from}:${to}:${encryptedMessage}`;
            const newMsg = {
              id,
              blockNumber: String(Number(log.blockNumber ?? BigInt(0))),
              from: getAddress(from) as `0x${string}`,
              to: getAddress(to) as `0x${string}`,
              content,
              createdAt,
              sender: getAddress(from) as `0x${string}`,
            };
            setMessages((prev) => {
              if (prev.some((m) => m.id === id)) return prev;
              return [...prev, newMsg];
            });
            rpcNewCountRef.current += 1;
            if (txHash) processedTxsRef.current.add(txHash);
          }
        } catch (e) {
          console.info("watchContractEvent handler error", e);
        }
      },
    });
    contractUnwatchRef.current = unwatch;
    return () => {
      try {
        contractUnwatchRef.current?.();
      } catch {}
      contractUnwatchRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, proxy]);

  const ensureSepolia = async () => {
    if (chainId === sepolia.id) return;
    await switchChainAsync({ chainId: sepolia.id });
  };

  const sendPayAsYouGo = async () => {
    if (!proxy) return alert("Proxy address missing");
    if (!isConnected) return alert("Please connect recipientWallet");
    if (!address) return alert("No account");
    if (!newMessage.trim()) return alert("Message empty");
    if (!conversationKey) return alert("No conversation key");
    try {
      setLoading(true);
      await ensureSepolia();

      // Encrypt and send message (pay-as-you-go)
      const ciphertext = mockEncryptMessage(newMessage, conversationKey);
      const sendTxHash = await writeContractAsync({
        address: proxy,
        abi: messageAbi,
        functionName: "sendMessage",
        args: [conversationId!, getAddress(recipientWallet), ciphertext],
        chainId: sepolia.id,
        value: (payAsYouGoFee as bigint | undefined) ?? BigInt(0),
      });
      await publicClient!.waitForTransactionReceipt({ hash: sendTxHash });
      // Do not optimistically append; RPC watcher will detect the tx and append exactly once.
      setNewMessage("");
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("sendPayAsYouGo error", msg);
      setError(`sendMessage error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const depositForRelayer = async () => {
    if (!proxy) return alert("Proxy address missing");
    if (!isConnected) return alert("Please connect wallet");
    try {
      const input = prompt(
        "Enter deposit amount in ETH (recommend 0.01):",
        "0.01"
      );
      if (!input) return;
      const value = parseEther(input as `${number}`);
      setLoading(true);
      await ensureSepolia();
      const txHash = await writeContractAsync({
        address: proxy,
        abi: messageAbi,
        functionName: "depositFunds",
        args: [],
        value,
        chainId: sepolia.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash: txHash });
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("depositForRelayer error", msg);
      setError(`deposit error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const sendViaRelayer = async () => {
    if (!proxy) return alert("Proxy address missing");
    if (!isConnected) return alert("Please connect wallet");
    if (!address) return alert("No account");
    if (!newMessage.trim()) return alert("Message empty");
    if (!conversationKey) return alert("No conversation key");
    try {
      setLoading(true);
      await ensureSepolia();
      // Check deposited funds >= relayer fee
      const fee = (relayerFee as bigint | undefined) ?? BigInt(0);
      const fundsBal = (myFunds as bigint | undefined) ?? BigInt(0);
      if (fundsBal < fee) {
        alert(
          `Insufficient deposited funds. Required ${
            Number(fee) / 1e18
          } ETH. Click Deposit to add funds.`
        );
        return;
      }

      // Encrypt and send via backend relayer
      const ciphertext = mockEncryptMessage(
        newMessage,
        conversationKey as string
      );
      const res = await fetch("/api/sc-message/relayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          conversationId: conversationId!.toString(),
          from: getAddress(address),
          to: getAddress(recipientWallet),
          encryptedMessage: ciphertext,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Relayer HTTP ${res.status} ${res.statusText} ${txt}`);
      }
      setNewMessage("");
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("sendViaRelayer error", msg);
      setError(`sendViaRelayer error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!proxy) return alert("Proxy address missing");
    if (isFetchingRef.current) return;
    if (!conversationId) return;
    isFetchingRef.current = true;
    try {
      // let conversationIdLocal = conversationId;
      // if (!conversationIdLocal) {
      //   if (!(address && isAddress(recipientWallet)))
      //     return alert("No conversationId");
      //   conversationIdLocal = computeConversationId(address, recipientWallet);
      //   setConversationId(conversationIdLocal);
      // }

      // Adjust paging to account for new messages appended via RPC so server-side offsets stay aligned
      const rpcNew = rpcNewCountRef.current;
      const firstForQuery = first + rpcNew;
      const skipForQuery = firstForQuery - 20;

      const res = await fetch("/api/sc-message/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          conversationId: conversationId.toString(),
          first: firstForQuery,
          skip: skipForQuery,
          newCount: rpcNew,
        }),
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API HTTP ${res.status} ${res.statusText}\n${text}`);
      }
      const json = (await res.json()) as {
        messageSents?: Array<{
          blockNumber: string;
          from: `0x${string}`;
          to: `0x${string}`;
          encryptedMessage: string;
        }>;
        error?: string;
        details?: unknown;
      };
      if (json.error) throw new Error(json.error);

      const events = json.messageSents ?? [];
      if (events.length > 0) {
        // Build only the current fetched page as a batch and prepend to existing messages
        // API is orderDirection: desc (newest -> oldest). For ascending UI, reverse to (oldest -> newest)
        const batchAsc = await Promise.all(
          events
            .map(async (e) => {
              const eventId = `${e.blockNumber}:${e.from}:${e.to}:${e.encryptedMessage}`;
              // decrypt per item using current key if available
              let decText = "";
              if (conversationKey) {
                try {
                  decText = mockDecryptMessage(
                    e.encryptedMessage,
                    conversationKey
                  );
                } catch {
                  decText = `(failed to decrypt)`;
                }
              } else {
                decText = `(no conv key)`;
              }
              // Fetch block for timestamp
              const block = await publicClient!.getBlock({
                blockNumber: BigInt(e.blockNumber),
              });
              const createdAt = new Date(
                Number(block.timestamp) * 1000
              ).toISOString();
              return {
                id: eventId,
                blockNumber: e.blockNumber,
                from: getAddress(e.from as `0x${string}`) as `0x${string}`,
                to: getAddress(e.to as `0x${string}`) as `0x${string}`,
                content: decText,
                createdAt,
                sender: getAddress(e.from as `0x${string}`) as `0x${string}`,
              };
            })
            .reverse()
        );

        // Prepend batch to current list while avoiding duplicates
        setMessages((prev) => {
          if (prev.length === 0) return batchAsc;
          const existing = new Set(prev.map((m) => m.id));
          const dedupBatch = batchAsc.filter((m) => !existing.has(m.id));
          return dedupBatch.length ? [...dedupBatch, ...prev] : prev;
        });

        // If page returned fewer than a full batch, we've reached the beginning
        if (events.length < 20) setIsLastPage(true);
        return;
      }

      // No events found for this conversation: do not treat as an error.
      // Keep messages array empty so UI can render the "No messages yet" state.
      setError(null);
      setIsLastPage(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("fetchMessages error", msg);
      setError(`fetchMessages error: ${msg}`);
    } finally {
      isFetchingRef.current = false;
      // Ensure loading-more UI is cleared even if no new messages were added
      setLoadingMore(false);
    }
  }, [first, proxy, publicClient, conversationId, conversationKey]);


  useEffect(() => {
      setInitialFetched(false);
      setIsLastPage(false);
      setFirst(20);
      rpcNewCountRef.current = 0;
      messageOrderRef.current = [];
      messageMapRef.current.clear();
      setMessages([]);
      void ensureConversationAndKey().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientWallet]);

  useEffect(() => {
  if (initialFetched) return;
  if (!conversationId || !conversationKey) return;
  void fetchMessages().then(() => {
    setInitialFetched(true);
  }).catch(console.error);
}, [conversationId, conversationKey, initialFetched, fetchMessages]);

  // When user scrolls to top and `first` increases, fetch the next (older) page
  useEffect(() => {
    if (conversationId === null) return;
    if (conversationKey === null) return;
    if (first > 20 && !isLastPage) {
      void fetchMessages();
    }
  }, [first, isLastPage, fetchMessages, conversationId, conversationKey]);

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const msg = newMessage.trim();
      if (msg && !loading) {
        if (isRelayerMode) {
          void sendViaRelayer();
        } else {
          void sendPayAsYouGo();
        }
      }
    }
  };

  const listRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    const element = listRef.current;
    if (element && first === 20 && !loadingMore && messages.length > 0) {
      element.scrollTop = element.scrollHeight - element.clientHeight;
    }
  }, [messages.length, first, loadingMore]);

  const handleScroll = () => {
    const element = listRef.current;
    if (
      !element ||
      loading ||
      loadingMore ||
      isFetchingRef.current ||
      isLastPage
    )
      return;
    if (element.scrollTop === 0) {
      prevScrollHeightRef.current = element.scrollHeight;
      setLoadingMore(true);
      setFirst((prev) => prev + 20);
      console.log("Loading more messages...");
    }
  };

  useEffect(() => {
    setLoadingMore(false);
    const element = listRef.current;
    if (element) {
      const newScrollHeight = element.scrollHeight;
      element.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = newScrollHeight;
      console.log("end loading more messages");
    }
  }, [messages]);

  const userChatWith = useMemo(() => {
    return directMembers.find((member) => member.conversationid === channelId);
  }, [directMembers, channelId]);

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={`https://ipfs.de-id.xyz/ipfs/${userChatWith?.avatar_ipfs_hash}`}
            />
            <AvatarFallback>{userChatWith?.displayname} Avatar</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {userChatWith?.displayname || getAddress(recipientWallet)}
              </h1>
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          Network {chainId ?? "?"}{" "}
          {chainId !== sepolia.id && "(switch to Sepolia)"}
          Proxy {proxy ? proxy : "N/A"}
        </span>
      </div>

      <ScrollArea
        ref={listRef}
        onScrollViewport={handleScroll}
        className="flex-1 bg-background"
      >
        <div className="flex flex-col gap-4 px-6 py-6">
          {loadingMore && (
            <>
              <Skeleton className="h-20 w-full bg-muted" />
              <Skeleton className="h-20 w-full bg-muted" />
              <Skeleton className="h-20 w-full bg-muted" />
            </>
          )}
          {error ? (
            <span className="px-3 text-xs text-red-400">{error}</span>
          ) : null}

          {messages.length === 0 ? (
            <div className="opacity-60 text-sm">No messages yet.</div>
          ) : (
            messages.map((message) => {
              const isMe = message.sender === getAddress(address!);
              return (
                <div
                  key={message.id}
                  className="group relative flex flex-col w-full items-start gap-3 px-3 py-1 transition hover:bg-muted rounded-md"
                >
                  <div className="flex w-full">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback>
                        {isMe
                          ? "You"
                          : `${message.sender.slice(
                              0,
                              6
                            )}...${message.sender.slice(-4)}`}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex w-full flex-col items-start gap-1 ml-3 relative group">
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-foreground">
                            {isMe
                              ? "You"
                              : `${message.sender.slice(
                                  0,
                                  6
                                )}...${message.sender.slice(-4)}`}
                          </h2>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full whitespace-pre-wrap break-words text-sm leading-6 text-left text-foreground hover:bg-muted/50 px-2 py-1 rounded transition-colors">
                          <Markdown>{message.content}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-card px-6 py-4 backdrop-blur">
        <div className="flex items-end gap-3 rounded-2xl bg-secondary p-3 shadow-lg">
          <SmartContractOption
            isRelayerMode={isRelayerMode}
            setIsRelayerMode={setIsRelayerMode}
            onDeposit={depositForRelayer}
          />
          <div className="flex-1">
            <Textarea
              name="content"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={
                payAsYouGoFee
                  ? `Message (fee ~ ${Number(payAsYouGoFee) / 1e18} ETH)`
                  : "Message"
              }
              disabled={loading}
              className="min-h-5 max-h-50 resize-none bg-input text-foreground border-border placeholder-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
