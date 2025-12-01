"use client";

import { sepolia } from "wagmi/chains";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { messageAbi } from "@/abi/messageAbi";
import { Switch } from "@/components/ui/switch";
import Markdown from "@/components/common/Markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDirectMember } from "@/hooks/useDirectMember";
import PaymentCard from "@/components/messages/PaymentCard";
import AvatarComponent from "@/components/common/AvatarComponent";
import { isAddress, getAddress, parseEther, type Abi } from "viem";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import SmartContractOption from "@/components/messages/SmartContractOption";
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
  encryptMessage,
  decryptMessage,
  generateConversationKey,
  deriveFunctionSelector,
  getMyConversationKey,
  ensurePublicKeyExists,
  fetchPublicKeyFromDB,
  createEncryptedConversationKeys,
} from "@/lib/scMessage";

// Type for Ethereum provider (MetaMask)
type EthereumProvider = {
  request: (args: { method: string; params: unknown[] }) => Promise<unknown>;
};

export default function SmartContractMessagePage() {
  const { user } = useUser();
  const router = useRouter();
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
  const publicClient = usePublicClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [isRelayerMode, setIsRelayerMode] = useState(false);
  const [privateMode, setPrivateMode] = useState<boolean>(true);
  const [recipientKeyError, setRecipientKeyError] = useState<string | null>(
    null
  );
  // State for private messaging initialization
  const [conversationExists, setConversationExists] = useState<boolean | null>(
    null
  );
  const [myPublicKey, setMyPublicKey] = useState<string | null>(null);
  const [recipientPublicKey, setRecipientPublicKey] = useState<string | null>(
    null
  );
  const [isInitializing, setIsInitializing] = useState(false);

  // Get Ethereum provider (MetaMask)
  const getProvider = useCallback((): EthereumProvider | null => {
    if (
      typeof window !== "undefined" &&
      (window as { ethereum?: EthereumProvider }).ethereum
    ) {
      return (window as { ethereum?: EthereumProvider }).ethereum!;
    }
    return null;
  }, []);

  useEffect(() => {
    if (!privateMode) {
      router.push(`/app/channels/me/${channelId}`);
    }
  }, [privateMode, router, channelId]);

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
  const [conversationKey, setConversationKey] = useState<string | null>(null);
  const conversationKeyRef = useRef<string | null>(null);
  const processedTxsRef = useRef<Set<string>>(new Set());
  const sendSelectorRef = useRef<string>("0x");
  const sendViaRelayerSelectorRef = useRef<string>("0x");
  const rpcNewCountRef = useRef<number>(0);

  // Check conversation status and public keys (read-only, no on-chain writes)
  const checkConversationStatus = useCallback(async () => {
    if (!proxy) return;
    if (!address) return;
    if (!isAddress(recipientWallet)) return;
    if (!publicClient) return;

    const provider = getProvider();

    const cid = computeConversationId(address, recipientWallet);
    if (conversationId !== cid) setConversationId(cid);

    try {
      // Read conversation from blockchain
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

      const exists = Boolean(createdAt && createdAt !== BigInt(0));
      setConversationExists(exists);

      // If conversation exists, try to retrieve the key
      if (exists && provider) {
        try {
          const key = await getMyConversationKey(
            publicClient as Parameters<typeof getMyConversationKey>[0],
            provider,
            proxy,
            cid,
            address
          );
          if (key) {
            setConversationKey(key);
            conversationKeyRef.current = key;
          }
        } catch (err) {
          console.error("Error retrieving conversation key:", err);
        }
      }

      // Check public keys availability
      const myKey = await fetchPublicKeyFromDB(address);
      setMyPublicKey(myKey);

      const theirKey = await fetchPublicKeyFromDB(recipientWallet);
      setRecipientPublicKey(theirKey);

      if (!theirKey) {
        setRecipientKeyError(
          "Recipient has not registered their encryption key. They need to enable private messaging first."
        );
      } else {
        setRecipientKeyError(null);
      }
    } catch (err) {
      console.error("Error checking conversation status:", err);
    }
  }, [
    proxy,
    address,
    publicClient,
    recipientWallet,
    conversationId,
    getProvider,
  ]);

  // Register my public key if not already registered
  const registerMyPublicKey = useCallback(async () => {
    if (!address) return;

    const provider = getProvider();
    if (!provider) {
      setError("No Ethereum provider (MetaMask) found");
      return;
    }

    try {
      setLoading(true);
      const key = await ensurePublicKeyExists(provider, address);
      setMyPublicKey(key);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to register public key: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [address, getProvider]);

  // Initialize private messaging - creates conversation on-chain
  const initializePrivateMessaging = useCallback(async () => {
    if (!proxy) {
      setError("Proxy address missing");
      return;
    }
    if (!address) {
      setError("No account connected");
      return;
    }
    if (!isAddress(recipientWallet)) {
      setError("Invalid recipient");
      return;
    }
    if (!publicClient) {
      setError("No public client");
      return;
    }

    const provider = getProvider();
    if (!provider) {
      setError("No Ethereum provider (MetaMask) found");
      return;
    }

    // Ensure both parties have public keys
    if (!myPublicKey) {
      setError("You need to register your encryption key first");
      return;
    }
    if (!recipientPublicKey) {
      setError("Recipient has not registered their encryption key");
      return;
    }

    try {
      setIsInitializing(true);
      setError(null);

      // Ensure on Sepolia
      if (chainId !== sepolia.id) {
        await switchChainAsync({ chainId: sepolia.id });
      }

      const cid = computeConversationId(address, recipientWallet);

      // Generate a new symmetric conversation key
      const convKey = generateConversationKey();

      // Encrypt the conversation key for both participants
      const { encryptedForSender, encryptedForRecipient } =
        createEncryptedConversationKeys(
          convKey,
          myPublicKey,
          recipientPublicKey
        );

      // Determine the order based on address comparison
      const me = getAddress(address);
      const them = getAddress(recipientWallet);
      const iAmSmaller = me.toLowerCase() < them.toLowerCase();

      // Create conversation on blockchain
      const encKeyForSmaller = (
        iAmSmaller ? encryptedForSender : encryptedForRecipient
      ) as `0x${string}`;
      const encKeyForLarger = (
        iAmSmaller ? encryptedForRecipient : encryptedForSender
      ) as `0x${string}`;

      const txHash = await writeContractAsync({
        address: proxy,
        abi: messageAbi,
        functionName: "createConversation",
        args: [them, encKeyForSmaller, encKeyForLarger],
        chainId: sepolia.id,
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Update state
      setConversationKey(convKey);
      conversationKeyRef.current = convKey;
      setConversationExists(true);
      setConversationId(cid);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("initializePrivateMessaging error:", msg);
      setError(`Failed to initialize private messaging: ${msg}`);
    } finally {
      setIsInitializing(false);
    }
  }, [
    proxy,
    address,
    publicClient,
    recipientWallet,
    myPublicKey,
    recipientPublicKey,
    chainId,
    switchChainAsync,
    writeContractAsync,
    getProvider,
  ]);

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
            args?: unknown;
          }>) {
            const txHash = log.transactionHash as `0x${string}` | undefined;
            if (txHash && processedTxsRef.current.has(txHash)) continue;

            const args = (
              log as {
                args?: {
                  conversationId: bigint;
                  from: `0x${string}`;
                  to: `0x${string}`;
                  encryptedMessage: string;
                };
              }
            ).args;
            if (!args) continue;

            const cid = args.conversationId;
            const from = args.from;
            const to = args.to;
            const encryptedMessageContent = args.encryptedMessage;

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
            if (conversationKeyRef.current) {
              try {
                content = decryptMessage(
                  encryptedMessageContent,
                  conversationKeyRef.current
                );
              } catch {
                content = "(failed to decrypt)";
              }
            }

            const block = await publicClient.getBlock({
              blockNumber: log.blockNumber,
            });
            const createdAtDate = new Date(
              Number(block.timestamp) * 1000
            ).toISOString();
            const id =
              txHash ||
              `${String(
                log.blockNumber ?? BigInt(0)
              )}:${from}:${to}:${encryptedMessageContent}`;
            const newMsg = {
              id,
              blockNumber: String(Number(log.blockNumber ?? BigInt(0))),
              from: getAddress(from) as `0x${string}`,
              to: getAddress(to) as `0x${string}`,
              content,
              createdAt: createdAtDate,
              sender: getAddress(from) as `0x${string}`,
            };
            setMessages((prev) => {
              if (prev.some((m) => m.id === id)) return prev;
              return [...prev, newMsg].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              );
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

  const sendPayAsYouGo = async (message?: string) => {
    const msgToSend = message || newMessage;
    if (!proxy) return alert("Proxy address missing");
    if (!isConnected) return alert("Please connect recipientWallet");
    if (!address) return alert("No account");
    if (!msgToSend.trim()) return alert("Message empty");
    if (!conversationKey) return alert("No conversation key");
    try {
      setLoading(true);
      await ensureSepolia();
      const ciphertext = encryptMessage(msgToSend, conversationKey);
      const sendTxHash = await writeContractAsync({
        address: proxy,
        abi: messageAbi,
        functionName: "sendMessage",
        args: [conversationId!, getAddress(recipientWallet), ciphertext],
        chainId: sepolia.id,
        value: (payAsYouGoFee as bigint | undefined) ?? BigInt(0),
      });
      await publicClient!.waitForTransactionReceipt({ hash: sendTxHash });
      if (!message) setNewMessage("");
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
      const ciphertext = encryptMessage(newMessage, conversationKey as string);
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
          blockTimestamp: string;
        }>;
        error?: string;
        details?: unknown;
      };
      if (json.error) throw new Error(json.error);

      const events = json.messageSents ?? [];
      if (events.length > 0) {
        const batchAsc = await Promise.all(
          events.map(async (e) => {
            const eventId = `${e.blockNumber}:${e.from}:${e.to}:${e.encryptedMessage}`;
            let decText = "";
            if (conversationKey) {
              try {
                decText = decryptMessage(e.encryptedMessage, conversationKey);
              } catch {
                decText = `(failed to decrypt)`;
              }
            } else {
              decText = `(no conv key)`;
            }
            // Fetch block for timestamp
            const createdAtDate = new Date(
              Number(e.blockTimestamp) * 1000
            ).toISOString();
            return {
              id: eventId,
              blockNumber: e.blockNumber,
              from: getAddress(e.from as `0x${string}`) as `0x${string}`,
              to: getAddress(e.to as `0x${string}`) as `0x${string}`,
              content: decText,
              createdAt: createdAtDate,
              sender: getAddress(e.from as `0x${string}`) as `0x${string}`,
            };
          })
        );

        setMessages((prev) => {
          if (prev.length === 0)
            return batchAsc.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
          const existing = new Set(prev.map((m) => m.id));
          const dedupBatch = batchAsc.filter((m) => !existing.has(m.id));
          const newMessages = dedupBatch.length
            ? [...prev, ...dedupBatch]
            : prev;
          return newMessages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

        if (events.length < 20) setIsLastPage(true);
        return;
      }
      setError(null);
      setIsLastPage(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("fetchMessages error", msg);
      setError(`fetchMessages error: ${msg}`);
    } finally {
      isFetchingRef.current = false;
      setLoadingMore(false);
    }
  }, [first, proxy, conversationId, conversationKey]);

  useEffect(() => {
    setInitialFetched(false);
    setIsLastPage(false);
    setFirst(20);
    rpcNewCountRef.current = 0;
    setMessages([]);
    setConversationExists(null);
    setMyPublicKey(null);
    setRecipientPublicKey(null);
    setConversationKey(null);
    conversationKeyRef.current = null;
    void checkConversationStatus();
  }, [recipientWallet, checkConversationStatus]);

  useEffect(() => {
    if (initialFetched) return;
    if (!conversationId || !conversationKey) return;
    void fetchMessages()
      .then(() => {
        setInitialFetched(true);
      })
      .catch(console.error);
  }, [conversationId, conversationKey, initialFetched, fetchMessages]);

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
          <AvatarComponent
            avatar_ipfs_hash={userChatWith?.avatar_ipfs_hash}
            displayname={userChatWith?.displayname}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {userChatWith?.displayname || getAddress(recipientWallet)}
              </h1>
            </div>
          </div>
        </div>
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
        <span className="text-xs text-muted-foreground">
          Network {chainId ?? "?"} CoversationId{" "}
          {conversationId?.toString() ?? "N/A"}{" "}
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
          {/* Private Messaging Initialization Panel */}
          {conversationExists === false && (
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Initialize Private Messaging
                </h3>
                <p className="text-sm text-muted-foreground">
                  Private messaging uses end-to-end encryption. Messages are
                  encrypted with keys stored on the blockchain.
                </p>
              </div>

              {/* Step 1: Register your encryption key */}
              {!myPublicKey && (
                <div className="rounded-md bg-blue-500/10 border border-blue-500/50 p-4">
                  <p className="text-sm text-blue-200 mb-3">
                    Step 1: Register your encryption key
                  </p>
                  <button
                    onClick={registerMyPublicKey}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    {loading ? "Registering..." : "Register Encryption Key"}
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will prompt MetaMask to share your encryption public
                    key
                  </p>
                </div>
              )}

              {/* Step 2: Check recipient's key */}
              {myPublicKey && !recipientPublicKey && (
                <div className="rounded-md bg-yellow-500/10 border border-yellow-500/50 p-4">
                  <p className="text-sm font-medium text-yellow-200">
                    Waiting for recipient
                  </p>
                  <p className="text-xs text-yellow-200/70 mt-1">
                    {recipientKeyError ||
                      "The recipient needs to register their encryption key first."}
                  </p>
                </div>
              )}

              {/* Step 3: Initialize conversation */}
              {myPublicKey && recipientPublicKey && (
                <div className="rounded-md bg-green-500/10 border border-green-500/50 p-4">
                  <p className="text-sm text-green-200 mb-3">
                    Both parties have encryption keys. Ready to initialize!
                  </p>
                  <button
                    onClick={initializePrivateMessaging}
                    disabled={isInitializing}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    {isInitializing
                      ? "Creating on-chain..."
                      : "Initialize Private Messaging"}
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will create an on-chain conversation and store
                    encrypted keys
                  </p>
                </div>
              )}

              {/* Status indicators */}
              <div className="flex justify-center gap-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${myPublicKey ? "bg-green-500" : "bg-gray-500"}`}
                  />
                  <span className="text-muted-foreground">Your key</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${recipientPublicKey ? "bg-green-500" : "bg-gray-500"}`}
                  />
                  <span className="text-muted-foreground">Recipient key</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${conversationExists ? "bg-green-500" : "bg-gray-500"}`}
                  />
                  <span className="text-muted-foreground">On-chain</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading state while checking */}
          {conversationExists === null && (
            <div className="text-center py-8">
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Checking conversation status...
              </p>
            </div>
          )}

          {/* Show messages when conversation exists */}
          {conversationExists === true && messages.length === 0 && (
            <div className="opacity-60 text-sm">No messages yet.</div>
          )}

          {conversationExists === true &&
            messages.map((message) => {
              const isMe = message.sender === getAddress(address!);
              return (
                <div
                  key={message.id}
                  className="group relative flex flex-col w-full items-start gap-3 px-3 py-1 transition hover:bg-muted rounded-md"
                >
                  <div className="flex w-full">
                    <AvatarComponent
                      avatar_ipfs_hash={
                        isMe
                          ? user?.avatar_ipfs_hash
                          : userChatWith?.avatar_ipfs_hash
                      }
                      displayname={
                        isMe ? user?.display_name : userChatWith?.displayname
                      }
                    />

                    <div className="flex w-full flex-col items-start gap-1 ml-3 relative group">
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-foreground">
                            {isMe
                              ? user.display_name
                              : userChatWith?.displayname}
                          </h2>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full whitespace-pre-wrap break-words text-sm leading-6 text-left text-foreground hover:bg-muted/50 px-2 py-1 rounded transition-colors">
                          {message.content.startsWith("payment://") ? (
                            <PaymentCard cid={message.content.slice(10)} />
                          ) : (
                            <Markdown>{message.content}</Markdown>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-card px-6 py-4 backdrop-blur">
        <div className="flex items-end gap-3 rounded-2xl bg-secondary p-3 shadow-lg">
          <SmartContractOption
            isRelayerMode={isRelayerMode}
            setIsRelayerMode={setIsRelayerMode}
            onDeposit={depositForRelayer}
            onTransferSuccess={async (cid: string) => {
              await sendPayAsYouGo(`payment://${cid}`);
            }}
          />
          <div className="flex-1">
            <Textarea
              name="content"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={
                !conversationExists
                  ? "Initialize private messaging first..."
                  : payAsYouGoFee
                    ? `Message (fee ~ ${Number(payAsYouGoFee) / 1e18} ETH)`
                    : "Message"
              }
              disabled={loading || !conversationExists || !conversationKey}
              className="min-h-5 max-h-50 resize-none bg-input text-foreground border-border placeholder-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
