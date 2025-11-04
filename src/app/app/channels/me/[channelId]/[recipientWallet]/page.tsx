"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  isAddress,
  encodePacked,
  getAddress,
  keccak256,
  decodeFunctionData,
} from "viem";
import { messageAbi } from "@/abi/messageAbi";

// UI components to mirror DirectMessagePage
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import AutoLink from "@/components/common/AutoLink";

const PROXY_ADDRESS = process.env.NEXT_PUBLIC_PROXY_ADDRESS as
  | `0x${string}`
  | undefined;

function computeConversationId(a: string, b: string): bigint {
  const A = getAddress(a);
  const B = getAddress(b);
  const [smaller, larger] = A.toLowerCase() < B.toLowerCase() ? [A, B] : [B, A];
  const packed = encodePacked(["address", "address"], [smaller, larger]);
  const hash = keccak256(packed);
  return BigInt(hash);
}

// (randomBytesHex removed; not needed with contract-based key flow)

// ===== Mock encryption (matches dehive-sc/test/helpers/mockEncryption.ts semantics) =====
// NOTE: This is for POC/demo only. Not production-grade crypto.
function base64EncodeUnicode(str: string): string {
  // Encode Unicode safely for base64 (btoa expects Latin1)
  return btoa(unescape(encodeURIComponent(str)));
}
function base64DecodeUnicode(b64: string): string {
  return decodeURIComponent(escape(atob(b64)));
}

// Equivalent to mock encryptMessage: prefix + base64(message)
function mockEncryptMessage(message: string, key: string): string {
  const keyPrefix = base64EncodeUnicode(key.substring(0, 8)).substring(0, 8);
  const encoded = base64EncodeUnicode(message);
  return `${keyPrefix}${encoded}`;
}

function mockDecryptMessage(encryptedMessage: string, key: string): string {
  const keyPrefix = base64EncodeUnicode(key.substring(0, 8)).substring(0, 8);
  if (!encryptedMessage.startsWith(keyPrefix)) {
    throw new Error("Invalid encryption key or corrupted message");
  }
  const encoded = encryptedMessage.substring(keyPrefix.length);
  return base64DecodeUnicode(encoded);
}

// Simple conversation key generation (no persistent storage)
function hexFromBytes(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateConversationKey(seed?: string): string {
  if (seed) {
    // Deterministic: use Web Crypto SHA-256 of seed
    // But SubtleCrypto is async — for simplicity in this POC, use a quick hash fallback
    // Warning: This is NOT cryptographically strong; for demo only.
    let hash = 0;
    for (let i = 0; i < seed.length; i++)
      hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    // Expand to 32 bytes pseudo-hex
    const out: string[] = [];
    for (let i = 0; i < 32; i++) {
      hash = (hash * 1664525 + 1013904223) | 0;
      out.push(((hash >>> 0) & 0xff).toString(16).padStart(2, "0"));
    }
    return out.join("");
  }
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return hexFromBytes(bytes);
}

// Address-key encryption helpers (mock XOR with sha256(address) like test helpers)
async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function encryptConversationKeyForAddress(
  conversationKey: string,
  address: string
): Promise<string> {
  const hashHex = await sha256Hex(address.toLowerCase());
  let out = "";
  for (let i = 0; i < conversationKey.length; i++) {
    const a = parseInt(conversationKey[i], 16);
    const b = parseInt(hashHex[i % hashHex.length], 16);
    out += ((a ^ b) & 0xf).toString(16);
  }
  return out;
}

async function decryptConversationKeyForAddress(
  encryptedKeyHex: string,
  address: string
): Promise<string> {
  const hashHex = await sha256Hex(address.toLowerCase());
  let out = "";
  for (let i = 0; i < encryptedKeyHex.length; i++) {
    const a = parseInt(encryptedKeyHex[i], 16);
    const b = parseInt(hashHex[i % hashHex.length], 16);
    out += ((a ^ b) & 0xf).toString(16);
  }
  return out;
}

export default function SmartContractMessagePage() {
  const { channelId, recipientWallet } = useParams<{
    channelId: string;
    recipientWallet: string;
  }>();
  const [newMessage, setNewMessage] = useState<string>("");
  const [conversationId, setConversationId] = useState<bigint | null>(null);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      blockNumber: string;
      from: `0x${string}`;
      to: `0x${string}`;
      content: string;
      createdAt: string; // display time only
      sender: {
        dehive_id: string;
        display_name: string;
        avatar_ipfs_hash: string;
      };
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();

  const proxy = PROXY_ADDRESS;

  const { data: payAsYouGoFee } = useReadContract({
    address: proxy,
    abi: messageAbi,
    functionName: "payAsYouGoFee",
    chainId: sepolia.id,
    query: { enabled: Boolean(proxy) },
  });

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

  // Derive function selector for sendMessage from ABI (robust to type changes)
  useEffect(() => {
    try {
      // Find ABI item for sendMessage and build canonical signature
      const fn = (
        messageAbi as ReadonlyArray<{
          type: string;
          name?: string;
          inputs?: ReadonlyArray<{ type: string }>;
        }>
      ).find((i) => i?.type === "function" && i?.name === "sendMessage");
      if (fn && Array.isArray(fn.inputs)) {
        const sig = `sendMessage(${Array.from(fn.inputs)
          .map((x) => x.type)
          .join(",")})`;
        const bytes = new TextEncoder().encode(sig);
        const hash = keccak256(bytes);
        sendSelectorRef.current = `0x${hash.slice(2, 10)}`; // 4-byte selector
      }
    } catch {}
  }, []);

  // Realtime: watch new blocks via RPC and count sendMessage txs to proxy
  useEffect(() => {
    if (!publicClient || !proxy) return;
    const unwatch = publicClient.watchBlocks({
      includeTransactions: true,
      onBlock: async (block) => {
        try {
          const selector = sendSelectorRef.current;
          let count = 0;
          type SimpleTx = {
            to?: string | null;
            input?: string;
            data?: string;
            hash?: string;
            from?: string;
          };
          const txs: SimpleTx[] = Array.isArray(block.transactions)
            ? (block.transactions as unknown as SimpleTx[])
            : [];
          for (const tx of txs) {
            const to = (tx?.to ?? "").toLowerCase();
            const input: string = (tx?.input ?? tx?.data ?? "0x").toString();
            if (!to || to !== proxy!.toLowerCase()) continue;
            if (!input || input === "0x") continue;
            // match function selector
            if (selector && input.startsWith(selector)) {
              count += 1;
              const hash: string = tx?.hash ?? "";
              if (hash && !processedTxsRef.current.has(hash)) {
                processedTxsRef.current.add(hash);
                try {
                  const decoded = decodeFunctionData({
                    abi: messageAbi,
                    data: input as `0x${string}`,
                  });
                  if (decoded.functionName === "sendMessage") {
                    const [cid, toAddr, ciphertext] = decoded.args as [
                      bigint,
                      `0x${string}`,
                      string
                    ];

                    // Check if this tx belongs to current chat by conversationId or participants
                    const me = address ? getAddress(address) : undefined;
                    const counterpart = isAddress(recipientWallet)
                      ? getAddress(recipientWallet)
                      : undefined;
                    const txFrom = tx.from
                      ? getAddress(tx.from as `0x${string}`)
                      : undefined;
                    const txTo = getAddress(toAddr);

                    const participantsMatch =
                      !!me &&
                      !!counterpart &&
                      ((txFrom === me && txTo === counterpart) ||
                        (txFrom === counterpart && txTo === me));

                    const cidMatch = conversationId
                      ? cid === conversationId
                      : false;

                    if (participantsMatch || cidMatch) {
                      let content = "(no conv key)";
                      if (conversationKeyRef.current) {
                        try {
                          content = mockDecryptMessage(
                            ciphertext,
                            conversationKeyRef.current
                          );
                        } catch {
                          content = "(failed to decrypt)";
                        }
                      }

                      const isCounterpart =
                        !!counterpart && txFrom === counterpart;
                      const newMsg = {
                        id: hash || `${Number(block.number)}:${Date.now()}`,
                        blockNumber: String(Number(block.number)),
                        from: (txFrom ||
                          "0x0000000000000000000000000000000000000000") as `0x${string}`,
                        to: txTo as `0x${string}`,
                        content,
                        createdAt: new Date().toISOString(),
                        sender: isCounterpart
                          ? {
                              dehive_id: userChatWith.id || "counterpart",
                              display_name:
                                userChatWith.displayname || "Counterpart",
                              avatar_ipfs_hash:
                                userChatWith.avatar_ipfs_hash || "",
                            }
                          : {
                              dehive_id: "me",
                              display_name: "You",
                              avatar_ipfs_hash: "",
                            },
                      };

                      setMessages((prev) => {
                        if (hash && prev.some((m) => m.id === hash))
                          return prev;
                        return [...prev, newMsg];
                      });
                    }
                  }
                } catch (e) {
                  console.info("decode sendMessage failed", e);
                }
              }
            }
          }
          // Log a simple statement for monitoring
          console.log(
            `[Realtime] Block ${Number(
              block.number
            )}: ${count} "Send Message" tx(s) to ${proxy}`
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
  }, [publicClient, proxy]);

  // UI sibling data (chat partner info), mirroring DirectMessagePage
  interface WalletProps {
    _id: string;
    address: string;
    user_id: string;
    name_service: null | string;
    is_primary: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  interface UserChatWith {
    id: string;
    displayname: string;
    username: string;
    avatar_ipfs_hash: string;
    wallets: WalletProps[];
    status: string;
  }
  const [userChatWith, setUserChatWith] = useState<UserChatWith>({
    id: "",
    displayname: "",
    username: "",
    avatar_ipfs_hash: "",
    wallets: [],
    status: "offline",
  });
  const counterpartPrimaryWallet = useMemo(() => {
    const w = userChatWith.wallets.find((w) => w.is_primary);
    return w?.address ?? recipientWallet;
  }, [userChatWith.wallets, recipientWallet]);

  const ensureSepolia = async () => {
    if (chainId === sepolia.id) return;
    await switchChainAsync({ chainId: sepolia.id });
  };

  // (Removed createConversation UI; sending will auto-create if missing)

  // Auto-compute deterministic conversationId whenever address/recipient is valid
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

  // Fetch user chat-with info to populate header avatar/name (same API as DirectMessagePage)
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
      if (!apiResponse.ok) return;
      const response = await apiResponse.json();
      if (response.statusCode === 200 && response.message === "OK") {
        setUserChatWith(response.data as UserChatWith);
      }
    } catch (err) {
      console.error("fetchUserChatWith error", err);
    }
  }, [channelId]);
  useEffect(() => {
    fetchUserChatWith();
  }, [fetchUserChatWith]);

  const sendPayAsYouGo = async () => {
    if (!proxy) return alert("Proxy address missing");
    if (!isConnected) return alert("Please connect recipientWallet");
    if (!address) return alert("No account");
    if (!newMessage.trim()) return alert("Message empty");
    try {
      setLoading(true);
      await ensureSepolia();

      // Ensure we have a conversationId (compute deterministically if missing)
      let conversationIdLocal = conversationId;
      if (!conversationIdLocal) {
        if (!isAddress(recipientWallet)) throw new Error("Invalid recipient");
        conversationIdLocal = computeConversationId(address, recipientWallet);
        setConversationId(conversationIdLocal);
      }

      // Early attempt: derive my conversation key from the conversations tuple (no msg.sender needed)
      if (!conversationKeyRef.current && address) {
        try {
          const conv = (await publicClient!.readContract({
            address: proxy,
            abi: messageAbi,
            functionName: "conversations",
            args: [conversationIdLocal!],
          })) as readonly [
            `0x${string}`,
            `0x${string}`,
            `0x${string}`,
            `0x${string}`,
            bigint
          ];
          const [smaller, , encSmall, encLarge, cAt] = conv;
          if (cAt && cAt !== BigInt(0)) {
            const me = getAddress(address);
            const isSmaller = me.toLowerCase() === smaller.toLowerCase();
            const enc = isSmaller ? encSmall : encLarge;
            const encHex2 = enc.startsWith("0x") ? enc.slice(2) : enc;
            if (encHex2) {
              conversationKeyRef.current =
                await decryptConversationKeyForAddress(encHex2, address);
            }
          }
        } catch {
          // ignore — conversation may not exist yet
        }
      }

      // Check if conversation exists on-chain; if not, create it
      type ConversationTuple = readonly [
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        bigint
      ];
      const convData = (await publicClient!.readContract({
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
        await publicClient!.waitForTransactionReceipt({ hash: txHash });
        // Use the generated key immediately for the first message
        localConvKey = convKey;
      }

      // Retrieve my encrypted conversation key from contract and decrypt it
      if (!conversationKeyRef.current) {
        try {
          const encKey = (await publicClient!.readContract({
            address: proxy,
            abi: messageAbi,
            functionName: "getMyEncryptedConversationKeys",
            args: [conversationIdLocal!],
          })) as string;
          const encHex = encKey.startsWith("0x") ? encKey.slice(2) : encKey;
          if (encHex) {
            conversationKeyRef.current = await decryptConversationKeyForAddress(
              encHex,
              address
            );
          }
        } catch {
          // ignore (may revert if not participant yet)
        }
        // Fallback: read from conversations tuple and pick my slot
        if (!conversationKeyRef.current) {
          try {
            const conv = (await publicClient!.readContract({
              address: proxy,
              abi: messageAbi,
              functionName: "conversations",
              args: [conversationIdLocal!],
            })) as readonly [
              `0x${string}`,
              `0x${string}`,
              `0x${string}`,
              `0x${string}`,
              bigint
            ];
            const [smaller, , encSmall, encLarge, cAt] = conv;
            if (cAt && cAt !== BigInt(0)) {
              const me = getAddress(address);
              const isSmaller = me.toLowerCase() === smaller.toLowerCase();
              const enc = isSmaller ? encSmall : encLarge;
              const encHex2 = enc.startsWith("0x") ? enc.slice(2) : enc;
              if (encHex2) {
                conversationKeyRef.current =
                  await decryptConversationKeyForAddress(encHex2, address);
              }
            }
          } catch {
            // ignore
          }
        }
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
        args: [conversationIdLocal!, getAddress(recipientWallet), ciphertext],
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

  const fetchMessages = useCallback(async () => {
    if (!proxy) return alert("Proxy address missing");
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      let conversationIdLocal = conversationId;
      if (!conversationIdLocal) {
        if (!(address && isAddress(recipientWallet)))
          return alert("No conversationId");
        conversationIdLocal = computeConversationId(address, recipientWallet);
        setConversationId(conversationIdLocal);
      }

      // Try to obtain conversation key early from tuple so decrypt works right after refresh
      if (!conversationKeyRef.current && address) {
        try {
          const conv = (await publicClient!.readContract({
            address: proxy,
            abi: messageAbi,
            functionName: "conversations",
            args: [conversationIdLocal!],
          })) as readonly [
            `0x${string}`,
            `0x${string}`,
            `0x${string}`,
            `0x${string}`,
            bigint
          ];
          const [smaller, , encSmall, encLarge, cAt] = conv;
          if (cAt && cAt !== BigInt(0)) {
            const me = getAddress(address);
            const isSmaller = me.toLowerCase() === smaller.toLowerCase();
            const enc = isSmaller ? encSmall : encLarge;
            const encHex2 = enc.startsWith("0x") ? enc.slice(2) : enc;
            if (encHex2) {
              conversationKeyRef.current =
                await decryptConversationKeyForAddress(encHex2, address);
            }
          }
        } catch {
          // ignore
        }
      }

      const res = await fetch("/api/sc-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          conversationId: conversationIdLocal.toString(),
          first: 20,
          skip: 0,
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
        // If we obtained a key and have cached entries from a previous run, re-decrypt them now
        if (conversationKeyRef.current && messageMapRef.current.size > 0) {
          try {
            for (const [id, data] of messageMapRef.current.entries()) {
              try {
                const dec = mockDecryptMessage(
                  data.encryptedMessage,
                  conversationKeyRef.current
                );
                messageMapRef.current.set(id, { ...data, dec });
              } catch {
                // leave as is
              }
            }
          } catch {}
        }
        // Ensure decrypted conversation key available for current user (only if conversation exists and I'm a participant)
        if (!conversationKeyRef.current && address) {
          try {
            const conv = (await publicClient!.readContract({
              address: proxy,
              abi: messageAbi,
              functionName: "conversations",
              args: [conversationIdLocal!],
            })) as readonly [
              `0x${string}`,
              `0x${string}`,
              `0x${string}`,
              `0x${string}`,
              bigint
            ];
            const [smaller, larger, , , cAt] = conv;
            if (cAt && cAt !== BigInt(0)) {
              const me = getAddress(address);
              const isParticipant =
                me.toLowerCase() === smaller.toLowerCase() ||
                me.toLowerCase() === larger.toLowerCase();
              if (isParticipant) {
                try {
                  const encKey = (await publicClient!.readContract({
                    address: proxy,
                    abi: messageAbi,
                    functionName: "getMyEncryptedConversationKeys",
                    args: [conversationIdLocal!],
                  })) as string;
                  const encHex = encKey.startsWith("0x")
                    ? encKey.slice(2)
                    : encKey;
                  if (encHex) {
                    conversationKeyRef.current =
                      await decryptConversationKeyForAddress(encHex, address);
                  }
                } catch (e) {
                  console.info("Key fetch/decrypt skipped", e);
                }
              }
            }
          } catch (e) {
            // Conversation may not exist yet; ignore
            console.info("Conversation read skipped", e);
          }
        }
        const newIds: string[] = [];
        // events come ascending (oldest -> newest). Collect unseen events into map
        events.forEach((e) => {
          const eventId = `${e.blockNumber}:${e.from}:${e.to}:${e.encryptedMessage}`;
          if (messageMapRef.current.has(eventId)) return; // already recorded
          // build display lines
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
          messageMapRef.current.set(eventId, {
            blockNumber: e.blockNumber,
            from: e.from,
            to: e.to,
            encryptedMessage: e.encryptedMessage,
            dec: decText,
          });
          newIds.push(eventId);
        });
        if (newIds.length > 0) {
          // Add new ids to the map then rebuild ordered list by blockNumber ascending
          for (const id of newIds) {
            messageOrderRef.current.push(id);
          }
          // Rebuild order from map values sorted by blockNumber asc
          const ordered = Array.from(messageMapRef.current.keys()).sort(
            (a, b) => {
              const aa = Number(messageMapRef.current.get(a)!.blockNumber);
              const bb = Number(messageMapRef.current.get(b)!.blockNumber);
              return aa - bb;
            }
          );
          messageOrderRef.current = ordered;
          // Rebuild styled messages list like DirectMessagePage
          const rebuilt: Array<{
            id: string;
            blockNumber: string;
            from: `0x${string}`;
            to: `0x${string}`;
            content: string;
            createdAt: string;
            sender: {
              dehive_id: string;
              display_name: string;
              avatar_ipfs_hash: string;
            };
          }> = [];
          for (let idx = 0; idx < ordered.length; idx++) {
            const id = ordered[idx];
            const data = messageMapRef.current.get(id)!;
            const isCounterpart =
              getAddress(data.from as `0x${string}`) ===
              getAddress(counterpartPrimaryWallet as `0x${string}`);
            rebuilt.push({
              id,
              blockNumber: data.blockNumber,
              from: getAddress(data.from as `0x${string}`) as `0x${string}`,
              to: getAddress(data.to as `0x${string}`) as `0x${string}`,
              content: data.dec,
              createdAt: new Date().toISOString(),
              sender: isCounterpart
                ? {
                    dehive_id: userChatWith.id || "counterpart",
                    display_name: userChatWith.displayname || "Counterpart",
                    avatar_ipfs_hash: userChatWith.avatar_ipfs_hash || "",
                  }
                : {
                    dehive_id: "me",
                    display_name: "You",
                    avatar_ipfs_hash: "",
                  },
            });
          }
          setMessages(rebuilt);
        }
        return;
      }

      // No events found for this conversation: do not treat as an error.
      // Keep messages array empty so UI can render the "No messages yet" state.
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("fetchMessages error", msg);
      setError(`fetchMessages error: ${msg}`);
    } finally {
      isFetchingRef.current = false;
    }
  }, [
    conversationId,
    address,
    recipientWallet,
    proxy,
    publicClient,
    counterpartPrimaryWallet,
    userChatWith.id,
    userChatWith.displayname,
    userChatWith.avatar_ipfs_hash,
  ]);

  // Fetch once when entering a conversation (per recipientWallet). Do not refetch afterward.
  const initialFetchForRecipientRef = useRef<string | null>(null);
  useEffect(() => {
    if (initialFetchForRecipientRef.current !== recipientWallet) {
      initialFetchForRecipientRef.current = recipientWallet;
      void fetchMessages();
    }
    // We intentionally only depend on recipientWallet so this runs once per route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientWallet]);

  // Auto scroll to bottom when messages change (like Direct initial behavior)
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }
  }, [messages.length]);

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const msg = newMessage.trim();
      if (msg && !loading) {
        void sendPayAsYouGo();
      }
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={`https://ipfs.de-id.xyz/ipfs/${userChatWith.avatar_ipfs_hash}`}
            />
            <AvatarFallback>{userChatWith.displayname} Avatar</AvatarFallback>
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

      <ScrollArea ref={listRef} className="flex-1 bg-background">
        <div className="flex flex-col gap-4 px-6 py-6">
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
                      src={`https://ipfs.de-id.xyz/ipfs/${message.sender.avatar_ipfs_hash}`}
                    />
                    <AvatarFallback>
                      {message.sender.display_name} Avatar
                    </AvatarFallback>
                  </Avatar>

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
          <Button
            className="h-11 w-11 shrink-0 rounded-full bg-muted text-lg text-muted-foreground hover:bg-accent"
            disabled
            title="Attachments are disabled in this view"
          >
            +
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
