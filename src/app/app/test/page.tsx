"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { isAddress, encodePacked, getAddress, keccak256 } from "viem";
import { messageAbi } from "@/abi/messageAbi";

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

export default function PayAsYouGoTestPage() {
  const [recipient, setRecipient] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [conversationId, setConversationId] = useState<bigint | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const ensureSepolia = async () => {
    if (chainId === sepolia.id) return;
    await switchChainAsync({ chainId: sepolia.id });
  };

  // (Removed createConversation UI; sending will auto-create if missing)

  // Auto-compute deterministic conversationId whenever address/recipient is valid
  useEffect(() => {
    if (address && isAddress(recipient)) {
      try {
        const computedConversationId = computeConversationId(
          address,
          recipient
        );
        setConversationId(computedConversationId);
      } catch {
        setConversationId(null);
      }
    } else {
      setConversationId(null);
    }
  }, [address, recipient]);

  const sendPayAsYouGo = async () => {
    if (!proxy) return alert("Proxy address missing");
    if (!isConnected) return alert("Please connect wallet");
    if (!address) return alert("No account");
    if (!newMessage.trim()) return alert("Message empty");
    try {
      setBusy(true);
      await ensureSepolia();

      // Ensure we have a conversationId (compute deterministically if missing)
      let conversationIdLocal = conversationId;
      if (!conversationIdLocal) {
        if (!isAddress(recipient)) throw new Error("Invalid recipient");
        conversationIdLocal = computeConversationId(address, recipient);
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
          recipient
        );
        const txHash = await writeContractAsync({
          address: proxy,
          abi: messageAbi,
          functionName: "createConversation",
          args: [
            getAddress(recipient),
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
        args: [conversationIdLocal!, getAddress(recipient), ciphertext],
        chainId: sepolia.id,
        value: (payAsYouGoFee as bigint | undefined) ?? BigInt(0),
      });
      await publicClient!.waitForTransactionReceipt({ hash: sendTxHash });

      // Optimistically append my message locally
      setMessages((prev) => [...prev, `${getAddress(address)}: ${newMessage}`]);
      setNewMessage("");
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("sendPayAsYouGo error", msg);
      setError(`sendMessage error: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!proxy) return alert("Proxy address missing");
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      let conversationIdLocal = conversationId;
      if (!conversationIdLocal) {
        if (!(address && isAddress(recipient)))
          return alert("No conversationId");
        conversationIdLocal = computeConversationId(address, recipient);
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
          first: 50,
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
          // Rebuild logs in chronological order (oldest first) as simple lines: "<sender>: <message>"
          const rebuilt: string[] = [];
          for (let idx = 0; idx < ordered.length; idx++) {
            const id = ordered[idx];
            const data = messageMapRef.current.get(id)!;
            const line = `${data.from}: ${data.dec}`;
            rebuilt.push(line);
          }
          setMessages(rebuilt);
        }
        return;
      }

      // Subgraph returned no events; RPC fallback removed — relying on subgraph only
      const info = `No on-chain MessageSent events found via subgraph for ${conversationIdLocal!.toString()}`;
      console.info(info);
      setError(info);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("fetchMessages error", msg);
      setError(`fetchMessages error: ${msg}`);
    } finally {
      isFetchingRef.current = false;
    }
  }, [conversationId, address, recipient, proxy, publicClient]);

  useEffect(() => {
    if (!conversationId) return;
    // Reset message maps when conversation changes
    messageOrderRef.current = [];
    messageMapRef.current.clear();
    conversationKeyRef.current = null;
    fetchMessages();
    const id = setInterval(() => {
      fetchMessages();
    }, 15000);
    return () => clearInterval(id);
  }, [conversationId, fetchMessages]);

  return (
    <main className="px-6 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Dehive On-chain Messaging – Pay-as-you-go (Sepolia)
        </h2>
        <ConnectButton />
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-2">
          <label className="text-sm text-neutral-400">Recipient (0x...)</label>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value.trim())}
            placeholder="0x..."
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            title="Gửi tin nhắn kèm theo phí pay-as-you-go trực tiếp từ ví của bạn."
            disabled={busy || !newMessage.trim()}
            onClick={sendPayAsYouGo}
            className="inline-flex items-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Sending..." : "Send (pay-as-you-go)"}
          </button>
        </div>

        <div className="text-sm space-y-1">
          <div>
            <b>Proxy:</b> {proxy}
          </div>
          <div>
            <b>Network:</b> {chainId ?? "?"}{" "}
            {chainId !== sepolia.id && "(switch to Sepolia)"}
          </div>
          <div>
            <b>Pay-as-you-go fee:</b>{" "}
            {payAsYouGoFee ? `${Number(payAsYouGoFee) / 1e18} ETH` : "..."}
          </div>
          <div>
            <b>ConversationId:</b> {conversationId?.toString() ?? "(none)"}
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-neutral-400">Message</label>
          <textarea
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message... (POC will store plaintext as 'encryptedMessage')"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <h3 className="mt-6 font-semibold">Logs</h3>
      <div className="bg-neutral-900 text-emerald-100 p-3 rounded-lg min-h-[220px] max-h-[320px] overflow-y-auto font-mono text-xs leading-relaxed border border-neutral-800 whitespace-pre-wrap break-words">
        {error ? <div className="text-red-400 py-1">{error}</div> : null}

        {messages.length === 0 ? (
          <div className="opacity-60">
            No messages yet. Actions will appear here…
          </div>
        ) : (
          messages.map((line: string, idx: number) => (
            <div key={idx} className="py-0.5">
              {line}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
