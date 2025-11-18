"use client";

import { useMemo } from "react";
import { sepolia } from "wagmi/chains";
import { useUser } from "@/hooks/useUser";
import { useParams } from "next/navigation";
import { messageAbi } from "@/abi/messageAbi";
import { getApiHeaders } from "@/utils/api.utils";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "@/components/common/Markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useDirectMember } from "@/hooks/useDirectMember";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  isAddress,
  getAddress,
  parseEther,
  type Abi,
  createPublicClient,
  http,
  fallback as viemFallback,
} from "viem";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SmartContractOption from "@/components/messages/SmartContractOption";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";

const PROXY_ADDRESS = process.env.NEXT_PUBLIC_PROXY_ADDRESS! as `0x${string}`;

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
  const proxy = PROXY_ADDRESS;
  const [first, setFirst] = useState(20);
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const fallbackPublicClientRef = useRef<ReturnType<
    typeof createPublicClient
  > | null>(null);
  useEffect(() => {
    if (!fallbackPublicClientRef.current) {
      try {
        const urls = (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URLS || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const defaults = [
          "https://ethereum-sepolia-rpc.publicnode.com",
          "https://rpc.ankr.com/eth_sepolia",
          "https://1rpc.io/sepolia",
        ];
        fallbackPublicClientRef.current = createPublicClient({
          chain: sepolia,
          transport: viemFallback(
            (urls.length ? urls : defaults).map((u) => http(u))
          ),
          batch: { multicall: false },
        });
      } catch {}
    }
  }, []);
  const resolvedClient = publicClient ?? fallbackPublicClientRef.current;
  console.log("resolvedClient", resolvedClient);
  const { fingerprintHash } = useFingerprint();
  const { directMembers } = useDirectMember();
  const [loading, setLoading] = useState(false);
  const { switchChainAsync } = useSwitchChain();
  const [isLastPage, setIsLastPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { address, chainId, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isRelayerMode, setIsRelayerMode] = useState(false);
  const [conversationId, setConversationId] = useState<bigint | null>(null);
  console.log("wedkwedjwedhwedjbweduwejdb conversationId", conversationId);
  const { channelId, recipientWallet } = useParams<{
    channelId: string;
    recipientWallet: string;
  }>();
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

  const { data: payAsYouGoFee } = useReadContract({
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

  const relayerRef = useRef<`0x${string}` | null>(null);
  useEffect(() => {
    const fetchRelayer = async () => {
      const pc = resolvedClient;
      if (!pc || !proxy) return;
      try {
        const addr = (await pc.readContract({
          address: proxy,
          abi: messageAbi as unknown as Abi,
          functionName: "relayer" as never,
          args: [] as const,
        })) as unknown as `0x${string}`;
        relayerRef.current = getAddress(addr);
      } catch {}
    };
    void fetchRelayer();
  }, [resolvedClient, proxy]);

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
  const conversationKeyRef = useRef<string | null>(null);
  const processedTxsRef = useRef<Set<string>>(new Set());
  const sendSelectorRef = useRef<string>("0x");
  const sendViaRelayerSelectorRef = useRef<string>("0x");
  const rpcNewCountRef = useRef<number>(0);
  const blockTsCacheRef = useRef<Map<string, number>>(new Map());

  // Create conversation proactively if missing (and capture key immediately)
  const ensureConversationExists = useCallback(
    async (
      cid: bigint | null | undefined,
      me: `0x${string}` | undefined,
      other: string | undefined
    ): Promise<boolean> => {
      const pc = resolvedClient;
      if (!pc || !proxy || !cid || !me || !other || !isAddress(other))
        return false;
      try {
        type ConversationTuple = readonly [
          `0x${string}`,
          `0x${string}`,
          `0x${string}`,
          `0x${string}`,
          bigint
        ];
        const conv = (await pc.readContract({
          address: proxy,
          abi: messageAbi,
          functionName: "conversations",
          args: [cid],
        })) as ConversationTuple;
        const createdAt = conv[4];
        if (createdAt && createdAt !== BigInt(0)) return true; // already exists
        // Need to create
        const convKey = generateConversationKey();
        const encForMe = await encryptConversationKeyForAddress(convKey, me);
        const encForOther = await encryptConversationKeyForAddress(
          convKey,
          other
        );
        const txHash = await writeContractAsync({
          address: proxy,
          abi: messageAbi,
          functionName: "createConversation",
          args: [getAddress(other), `0x${encForMe}`, `0x${encForOther}`],
          chainId: sepolia.id,
        });
        await pc.waitForTransactionReceipt({ hash: txHash });
        // Store key locally so first message decrypt works immediately
        conversationKeyRef.current = convKey;
        return true;
      } catch (e) {
        console.warn("ensureConversationExists error", e);
        return false;
      }
    },
    [resolvedClient, proxy, writeContractAsync]
  );

  // Helpers
  const ensureConversationIdLocal = useCallback((): bigint | null => {
    if (conversationId) return conversationId;
    if (!(address && isAddress(recipientWallet))) return null;
    const cid = computeConversationId(address, recipientWallet);
    setConversationId(cid);
    return cid;
  }, [conversationId, address, recipientWallet]);

  const ensureConversationKey = useCallback(
    async (
      cid: bigint | null | undefined,
      who: `0x${string}` | undefined
    ): Promise<boolean> => {
      const pc = resolvedClient;
      console.group("ensureConversationKey");
      console.log("clientReady", !!pc);
      console.log("proxy", proxy);
      console.log("cid", cid);
      console.log("who", who);
      console.groupEnd();
      if (!pc || !proxy || !cid || !who) return false;
      // Ensure conversation exists first (may set key immediately)
      await ensureConversationExists(cid, who, recipientWallet);
      if (conversationKeyRef.current) return true;
      try {
        const k = await getMyConversationKey(pc, proxy, cid, who);
        if (k) {
          conversationKeyRef.current = k;
          return true;
        }
      } catch {}
      return false;
    },
    [resolvedClient, proxy, ensureConversationExists, recipientWallet]
  );

  // Try to decrypt any messages that were rendered without a key once key is present
  const reDecryptExisting = useCallback(() => {
    if (!conversationKeyRef.current) return;
    setMessages((prev) =>
      prev.map((m) => {
        if (
          m.content &&
          m.content !== "(no conv key)" &&
          m.content !== "(failed to decrypt)"
        )
          return m;
        const meta = messageMapRef.current.get(m.id);
        if (!meta) return m;
        try {
          const dec = mockDecryptMessage(
            meta.encryptedMessage,
            conversationKeyRef.current as string
          );
          meta.dec = dec;
          return { ...m, content: dec };
        } catch {
          return m;
        }
      })
    );
  }, []);

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

  // Realtime: simple, receipt-based watcher so relayer txs are never missed
  useEffect(() => {
    const pc = resolvedClient;
    if (!pc || !proxy) return;
    const unwatch = pc.watchBlocks({
      includeTransactions: true,
      onBlock: async (block) => {
        try {
          let appended = 0;
          const txs = Array.isArray(block.transactions)
            ? (block.transactions as readonly (
                | string
                | {
                    hash?: `0x${string}`;
                  }
              )[])
            : [];
          for (const t of txs) {
            const hash: `0x${string}` | undefined =
              (typeof t === "string"
                ? (t as `0x${string}`)
                : (t?.hash as `0x${string}` | undefined)) ?? undefined;
            if (!hash) continue;
            if (processedTxsRef.current.has(hash)) continue;
            try {
              // Try to classify the method name for logging (Send Message vs Send Message Via Relayer)
              let methodName:
                | "Send Message"
                | "Send Message Via Relayer"
                | "Unknown" = "Unknown";
              try {
                type MaybeInputTx = {
                  input?: `0x${string}`;
                  data?: `0x${string}`;
                };
                const txObj = await pc.getTransaction({ hash });
                const txObjInput =
                  (txObj as unknown as MaybeInputTx)?.input ??
                  (txObj as unknown as MaybeInputTx)?.data;
                let blockTxInput: `0x${string}` | undefined = undefined;
                if (typeof t !== "string") {
                  const tt = t as {
                    input?: `0x${string}`;
                    data?: `0x${string}`;
                  };
                  blockTxInput = tt.input ?? tt.data;
                }
                const inp = txObjInput ?? blockTxInput;
                if (typeof inp === "string" && inp.length >= 10) {
                  const sel = inp.slice(0, 10).toLowerCase();
                  const s1 = (sendSelectorRef.current || "0x").toLowerCase();
                  const s2 = (
                    sendViaRelayerSelectorRef.current || "0x"
                  ).toLowerCase();
                  if (sel === s1) methodName = "Send Message";
                  else if (sel === s2) methodName = "Send Message Via Relayer";
                }
              } catch {}

              const receipt = await pc.getTransactionReceipt({
                hash,
              });
              let relevant = false;
              for (const log of receipt.logs) {
                if ((log.address ?? "").toLowerCase() !== proxy.toLowerCase())
                  continue;
                try {
                  const decoded = (await import("viem")).decodeEventLog({
                    abi: messageAbi,
                    data: log.data as `0x${string}`,
                    topics: log.topics as unknown as [
                      `0x${string}`,
                      ...`0x${string}`[]
                    ],
                  });
                  if (
                    (decoded.eventName as string) === "MessageSent" ||
                    /MessageSent/i.test(decoded.eventName as string)
                  ) {
                    const {
                      conversationId: cid,
                      from,
                      to,
                      encryptedMessage,
                    } = decoded.args as unknown as {
                      conversationId: bigint;
                      from: `0x${string}`;
                      to: `0x${string}`;
                      encryptedMessage: string;
                    };
                    const cidMatch = conversationId
                      ? cid === conversationId
                      : false;
                    const me = address ? getAddress(address) : undefined;
                    const counterpart = isAddress(recipientWallet)
                      ? getAddress(recipientWallet)
                      : undefined;
                    const participantsMatch =
                      !!me &&
                      !!counterpart &&
                      ((getAddress(from) === me &&
                        getAddress(to) === counterpart) ||
                        (getAddress(from) === counterpart &&
                          getAddress(to) === me));
                    if (participantsMatch || cidMatch) {
                      relevant = true;
                      if (!conversationKeyRef.current) {
                        try {
                          await ensureConversationKey(
                            conversationId ?? cid,
                            address as `0x${string}` | undefined
                          );
                        } catch {}
                      }
                      let content = "(no conv key)";
                      if (conversationKeyRef.current) {
                        try {
                          content = mockDecryptMessage(
                            encryptedMessage,
                            conversationKeyRef.current
                          );
                        } catch {
                          content = "(failed to decrypt)";
                        }
                      }
                      // cache encrypted payload for potential later re-decrypt
                      try {
                        messageMapRef.current.set(hash, {
                          blockNumber: String(Number(block.number)),
                          from: getAddress(from),
                          to: getAddress(to),
                          encryptedMessage,
                          dec: content,
                        });
                      } catch {}
                      console.log(
                        "wedwedwedwedwedewdwedewdwedwedwedwed",
                        conversationId,
                        cid
                      );
                      const newMsg = {
                        id: hash,
                        blockNumber: String(Number(block.number)),
                        from: getAddress(from) as `0x${string}`,
                        to: getAddress(to) as `0x${string}`,
                        content,
                        createdAt: (() => {
                          const ts = (
                            block as unknown as { timestamp?: unknown }
                          ).timestamp as bigint | number | undefined;
                          const ms =
                            typeof ts === "bigint"
                              ? Number(ts) * 1000
                              : typeof ts === "number"
                              ? ts * 1000
                              : Date.now();
                          return new Date(ms).toISOString();
                        })(),
                        sender: getAddress(from) as `0x${string}`,
                      };
                      setMessages((prev) => {
                        if (prev.some((m) => m.id === hash)) return prev;
                        return [...prev, newMsg];
                      });
                      rpcNewCountRef.current += 1;
                      // Explicit logging of method classification for real-time visibility
                      console.log(
                        `[Realtime] ${methodName}: tx ${hash} block ${Number(
                          block.number
                        )} cid=${cid.toString()}`
                      );
                    }
                  }
                } catch {}
              }
              if (relevant) {
                processedTxsRef.current.add(hash);
                appended += 1;
              }
            } catch {}
          }
          console.log(
            `[Realtime] Block ${Number(
              block.number
            )}: appended=${appended} to ${proxy}`
          );
        } catch (e) {
          console.info("watchBlocks handler error", e);
        }
      },
    });
    return () => {
      try {
        unwatch?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedClient, proxy]);

  const ensureSepolia = async () => {
    if (chainId === sepolia.id) return;
    await switchChainAsync({ chainId: sepolia.id });
  };

  useEffect(() => {
    if (address && isAddress(recipientWallet)) {
      try {
        const computedConversationId = computeConversationId(
          address,
          recipientWallet
        );
        setConversationId(computedConversationId);
      } catch {
        setConversationId(null);
      }
    } else {
      setConversationId(null);
    }
  }, [address, recipientWallet]);

  useEffect(() => {
    void (async () => {
      const ok = await ensureConversationKey(
        conversationId,
        address as `0x${string}` | undefined
      );
      if (ok) reDecryptExisting();
    })();
  }, [ensureConversationKey, conversationId, address, reDecryptExisting]);

  const userChatWith = useMemo(() => {
    return directMembers.find((member) => member.conversationid === channelId);
  }, [directMembers, channelId]);

  const sendPayAsYouGo = async () => {
    if (!proxy) return alert("Proxy address missing");
    if (!isConnected) return alert("Please connect recipientWallet");
    if (!address) return alert("No account");
    if (!newMessage.trim()) return alert("Message empty");
    try {
      setLoading(true);
      await ensureSepolia();

      // Ensure conversationId
      const conversationIdLocal = ensureConversationIdLocal();
      if (!conversationIdLocal) throw new Error("Invalid recipient");

      // Try to obtain existing conversation key (if conversation already exists)
      await ensureConversationKey(conversationIdLocal, address);

      // Check if conversation exists on-chain; if not, create it
      type ConversationTuple = readonly [
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        bigint
      ];
      const pc = resolvedClient;
      if (!pc) throw new Error("No public client");
      const convData = (await pc.readContract({
        address: proxy,
        abi: messageAbi,
        functionName: "conversations",
        args: [conversationIdLocal!],
      })) as ConversationTuple;
      const [, , , , createdAt] = convData;

      let localConvKey: string | null = null;
      if (!createdAt || createdAt === BigInt(0)) {
        // Create a new conversation with encrypted keys for both participants
        const convKey = generateConversationKey(); // 64 hex chars
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
        await pc.waitForTransactionReceipt({ hash: txHash });
        // Use the generated key immediately for the first message
        localConvKey = convKey;
      }

      // Retrieve my conversation key (post-creation or existing)
      if (!conversationKeyRef.current) {
        const key = await getMyConversationKey(
          pc,
          proxy,
          conversationIdLocal!,
          address
        );
        if (key) conversationKeyRef.current = key;
      }

      if (!conversationKeyRef.current && localConvKey) {
        conversationKeyRef.current = localConvKey;
      }
      if (!conversationKeyRef.current) {
        throw new Error("No conversation key available for this account");
      }

      // Encrypt and send message (pay-as-you-go)
      const ciphertext = mockEncryptMessage(
        newMessage,
        conversationKeyRef.current
      );
      const sendTxHash = await writeContractAsync({
        address: proxy,
        abi: messageAbi,
        functionName: "sendMessage",
        args: [conversationIdLocal, getAddress(recipientWallet), ciphertext],
        chainId: sepolia.id,
        value: (payAsYouGoFee as bigint | undefined) ?? BigInt(0),
      });
      await pc.waitForTransactionReceipt({ hash: sendTxHash });
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
      const pc = resolvedClient;
      if (!pc) throw new Error("No public client");
      const txHash = await writeContractAsync({
        address: proxy,
        abi: messageAbi,
        functionName: "depositFunds",
        args: [],
        value,
        chainId: sepolia.id,
      });
      await pc.waitForTransactionReceipt({ hash: txHash });
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
    try {
      setLoading(true);
      await ensureSepolia();

      // Ensure conversationId
      const conversationIdLocal = ensureConversationIdLocal();
      if (!conversationIdLocal) throw new Error("Invalid recipient");

      // Ensure conversation exists; create if needed
      type ConversationTuple = readonly [
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        bigint
      ];
      const pc = resolvedClient;
      if (!pc) throw new Error("No public client");
      const convData = (await pc.readContract({
        address: proxy,
        abi: messageAbi,
        functionName: "conversations",
        args: [conversationIdLocal!],
      })) as ConversationTuple;
      const [, , , , createdAt] = convData;

      let localConvKey: string | null = null;
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
        await pc.waitForTransactionReceipt({ hash: txHash });
        localConvKey = convKey;
      }

      // Ensure conversation key available
      await ensureConversationKey(conversationIdLocal, address);
      if (!conversationKeyRef.current && localConvKey) {
        conversationKeyRef.current = localConvKey;
      }
      if (!conversationKeyRef.current) {
        throw new Error("No conversation key available for this account");
      }

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
        conversationKeyRef.current
      );
      const res = await fetch("/api/sc-message/relayer", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          conversationId: conversationIdLocal.toString(),
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
    isFetchingRef.current = true;
    try {
      const conversationIdLocal = ensureConversationIdLocal();
      if (!conversationIdLocal) return alert("No conversationId");

      // Try to obtain conversation key early so decrypt works right after refresh
      await ensureConversationKey(conversationIdLocal, address);

      // Adjust paging to account for new messages appended via RPC so server-side offsets stay aligned
      const rpcNew = rpcNewCountRef.current;
      const firstForQuery = first + rpcNew;
      const skipForQuery = firstForQuery - 20;

      const res = await fetch("/api/sc-message/message", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          conversationId: conversationIdLocal.toString(),
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
        // Preload block timestamps for this page (deduped) using cache
        const uniqueBlockNumbers = Array.from(
          new Set(events.map((e) => e.blockNumber))
        );
        await Promise.all(
          uniqueBlockNumbers.map(async (bn) => {
            if (blockTsCacheRef.current.has(bn)) return;
            try {
              const pc = resolvedClient;
              const blk = await pc!.getBlock({
                blockNumber: BigInt(bn),
              });
              const tsMs = Number(blk.timestamp) * 1000;
              blockTsCacheRef.current.set(bn, tsMs);
            } catch {
              // ignore; we'll fall back to now()
            }
          })
        );
        // Ensure decrypted conversation key available for current user
        await ensureConversationKey(conversationIdLocal, address);
        // Build only the current fetched page as a batch and prepend to existing messages
        // API is orderDirection: desc (newest -> oldest). For ascending UI, reverse to (oldest -> newest)
        const batchAsc = events
          .map((e) => {
            const eventId = `${e.blockNumber}:${e.from}:${e.to}:${e.encryptedMessage}`;
            // decrypt per item using current key if available
            let decText = "";
            if (conversationKeyRef.current) {
              try {
                decText = mockDecryptMessage(
                  e.encryptedMessage,
                  conversationKeyRef.current
                );
              } catch {
                decText = `(failed to decrypt)`;
              }
            } else {
              decText = `(no conv key)`;
            }
            // cache for possible later re-decrypt
            try {
              messageMapRef.current.set(eventId, {
                blockNumber: e.blockNumber,
                from: e.from,
                to: e.to,
                encryptedMessage: e.encryptedMessage,
                dec: decText,
              });
            } catch {}
            return {
              id: eventId,
              blockNumber: e.blockNumber,
              from: getAddress(e.from as `0x${string}`) as `0x${string}`,
              to: getAddress(e.to as `0x${string}`) as `0x${string}`,
              content: decText,
              createdAt: new Date(
                blockTsCacheRef.current.get(e.blockNumber) ?? Date.now()
              ).toISOString(),
              sender: getAddress(e.from as `0x${string}`) as `0x${string}`,
            };
          })
          .reverse();

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
  }, [
    first,
    proxy,
    address,
    resolvedClient,
    fingerprintHash,
    ensureConversationIdLocal,
    ensureConversationKey,
  ]);

  // Fetch once when entering a conversation (per recipientWallet). Do not refetch afterward.
  const initialFetchForRecipientRef = useRef<string | null>(null);
  useEffect(() => {
    if (initialFetchForRecipientRef.current !== recipientWallet) {
      initialFetchForRecipientRef.current = recipientWallet;
      // Reset paging & caches when switching conversation
      setIsLastPage(false);
      setFirst(20);
      rpcNewCountRef.current = 0;
      messageOrderRef.current = [];
      messageMapRef.current.clear();
      setMessages([]);
      void fetchMessages();
    }
    // We intentionally only depend on recipientWallet so this runs once per route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientWallet]);

  // When user scrolls to top and `first` increases, fetch the next (older) page
  useEffect(() => {
    if (first > 20 && !isLastPage) {
      void fetchMessages();
    }
  }, [first, isLastPage, fetchMessages]);

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
    // Only auto-scroll on initial page load
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

  console.log("Rendering SmartContractMessagePage", messages);

  // Manual repair: try to fetch key and re-decrypt existing messages
  const onRepairKeys = useCallback(async () => {
    try {
      const cid = ensureConversationIdLocal();
      if (!cid) {
        alert("No conversationId. Check recipient address.");
        return;
      }
      const ok = await ensureConversationKey(cid, address);
      if (ok) {
        reDecryptExisting();
        alert("Keys loaded. Re-decrypted visible messages.");
      } else {
        alert(
          "Could not load your conversation key. Ensure you're connected with a participant wallet and on Sepolia."
        );
      }
    } catch (e) {
      console.error("Repair keys error", e);
    }
  }, [
    ensureConversationIdLocal,
    ensureConversationKey,
    reDecryptExisting,
    address,
  ]);

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
                {userChatWith?.displayname ||
                  (isAddress(recipientWallet)
                    ? getAddress(recipientWallet)
                    : recipientWallet)}
              </h1>
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground flex flex-col items-end">
          <span>
            Network {chainId ?? "?"}{" "}
            {chainId !== sepolia.id && "(switch to Sepolia)"}
          </span>
          <span>Proxy {proxy ? proxy : "N/A"}</span>
          <span>
            Client: {resolvedClient ? "ready" : "missing"} · Key:{" "}
            {conversationKeyRef.current ? "ready" : "missing"}
          </span>
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
            messages.map((message) => (
              <div
                key={message.id}
                className="group relative flex flex-col w-full items-start gap-3 px-3 py-1 transition hover:bg-muted rounded-md"
              >
                <div className="flex w-full">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage
                      src={
                        user.primary_wallet?.address ===
                        message.sender.toLocaleLowerCase()
                          ? `https://ipfs.de-id.xyz/ipfs/${user?.avatar_ipfs_hash}`
                          : `https://ipfs.de-id.xyz/ipfs/${userChatWith?.avatar_ipfs_hash}`
                      }
                    />
                    <AvatarFallback>
                      {user.primary_wallet?.address ===
                      message.sender.toLocaleLowerCase()
                        ? `${user?.display_name}'s Avatar`
                        : `${userChatWith?.displayname}'s Avatar`}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex w-full flex-col items-start gap-1 ml-3 relative group">
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground">
                          {user.primary_wallet?.address ===
                          message.sender.toLocaleLowerCase()
                            ? `${user.display_name}`
                            : `${userChatWith?.displayname}`}
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
            ))
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
          <Button variant="outline" size="sm" onClick={onRepairKeys}>
            Repair keys
          </Button>
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
