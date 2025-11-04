"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { isAddress, encodePacked, getAddress, keccak256, toHex } from "viem";
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
  // interpret keccak256 bytes32 as uint256
  return BigInt(hash);
}

function randomBytesHex(len = 32): `0x${string}` {
  // Using crypto.getRandomValues via viem's toHex on random bytes
  const bytes = new Uint8Array(len);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback: pseudo-random (not secure, but this is a POC UI)
    for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return toHex(bytes);
}

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

// Simple conversation key management (local only)
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

function getStoredConvKey(conversationId: bigint): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`convKey:${conversationId.toString()}`);
  } catch {
    return null;
  }
}

function setStoredConvKey(conversationId: bigint, key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`convKey:${conversationId.toString()}`, key);
  } catch {
    // ignore
  }
}

export default function PayAsYouGoTestPage() {
  const [recipient, setRecipient] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [conversationId, setConversationId] = useState<bigint | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();

  const proxy = useMemo(() => PROXY_ADDRESS, []);

  const { data: payAsYouGoFee } = useReadContract({
    address: proxy,
    abi: messageAbi,
    functionName: "payAsYouGoFee",
    chainId: sepolia.id,
    query: { enabled: Boolean(proxy) },
  });

  const { writeContractAsync } = useWriteContract();

  const isFetchingRef = useRef(false);

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
    if (!message.trim()) return alert("Message empty");
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
      // Check if conversation exists on-chain; if not, create it
      type ConversationTuple = readonly [
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        bigint
      ];
      const onchainConversation = await publicClient!.readContract({
        address: proxy,
        abi: messageAbi,
        functionName: "conversations",
        args: [conversationIdLocal!],
      });
      const [, , , , createdAt] = onchainConversation as ConversationTuple;
      if (!createdAt || createdAt === BigInt(0)) {
        const placeholderEncryptedKey = randomBytesHex(32);
        const createConversationTxHash = await writeContractAsync({
          address: proxy,
          abi: messageAbi,
          functionName: "createConversation",
          args: [
            getAddress(recipient),
            placeholderEncryptedKey,
            placeholderEncryptedKey,
          ],
          chainId: sepolia.id,
        });
        await publicClient!.waitForTransactionReceipt({
          hash: createConversationTxHash,
        });
      }
      // Ensure we have or create a local conversation key for encryption
      let conversationKey = getStoredConvKey(conversationIdLocal!);
      if (!conversationKey) {
        conversationKey = generateConversationKey();
        setStoredConvKey(conversationIdLocal!, conversationKey);
        setLogs((prevLogs) => [
          `Generated new local conversation key for ${conversationIdLocal!.toString()}`,
          ...prevLogs,
        ]);
      }

      // Encrypt message using mock scheme (prefix + base64)
      const ciphertext = mockEncryptMessage(message, conversationKey);

      const fee = (payAsYouGoFee as bigint | undefined) ?? BigInt(0);
      const txHash = await writeContractAsync({
        address: proxy,
        abi: messageAbi,
        functionName: "sendMessage",
        args: [conversationIdLocal!, getAddress(recipient), ciphertext],
        chainId: sepolia.id,
        value: fee,
      });
      const receipt = await publicClient!.waitForTransactionReceipt({
        hash: txHash,
      });
      setLogs((prevLogs) => [
        `sendMessage tx: ${txHash} (fee ${Number(fee) / 1e18} ETH, block ${
          receipt.blockNumber
        })`,
        ...prevLogs,
      ]);
      setMessage("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLogs((prevLogs) => [`sendMessage error: ${msg}`, ...prevLogs]);
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
        const conversationKey = getStoredConvKey(conversationIdLocal!);
        const lines: string[] = [
          `Subgraph: ${
            events.length
          } MessageSent events for ${conversationIdLocal!.toString()}`,
        ];
        events.forEach((e, i) => {
          const encrypted = e.encryptedMessage;
          const header = `#${i + 1} from ${e.from} -> ${e.to} [block ${
            e.blockNumber
          }]`;
          const encLine = `#${i + 1} ciphertext: ${encrypted}`;
          let decLine = `#${i + 1} decrypted: `;
          if (conversationKey) {
            try {
              const decrypted = mockDecryptMessage(encrypted, conversationKey);
              decLine += decrypted;
            } catch {
              decLine += `(failed to decrypt)`;
            }
          } else {
            decLine += `(no local key)`;
          }
          lines.push(header, encLine, decLine);
        });
        setLogs((prevLogs) => [...lines, ...prevLogs]);
        return;
      }

      // Subgraph returned no events; RPC fallback removed — relying on subgraph only
      setLogs((prevLogs) => [
        `No on-chain MessageSent events found via subgraph for ${conversationIdLocal!.toString()}`,
        ...prevLogs,
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLogs((prevLogs) => [`fetchMessages error: ${msg}`, ...prevLogs]);
    } finally {
      isFetchingRef.current = false;
    }
  }, [conversationId, address, recipient, proxy]);

  useEffect(() => {
    if (!conversationId) return;
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
            disabled={busy || !message.trim()}
            onClick={sendPayAsYouGo}
            className="inline-flex items-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Sending..." : "Send (pay-as-you-go)"}
          </button>
        </div>

        <div className="text-xs text-neutral-400 space-y-1">
          <div>
            <b>Send (pay-as-you-go)</b>: gửi tin nhắn từ ví của bạn; nếu
            conversation chưa tồn tại, app sẽ tự tạo rồi gửi.
          </div>
          <div>
            <b>Fetch messages</b>: tải danh sách sự kiện MessageSent theo
            conversationId (qua Subgraph, fallback RPC nếu cần).
          </div>
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message... (POC will store plaintext as 'encryptedMessage')"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <h3 className="mt-6 font-semibold">Logs</h3>
      <div className="bg-neutral-900 text-emerald-100 p-3 rounded-lg min-h-[220px] max-h-[320px] overflow-y-auto font-mono text-xs leading-relaxed border border-neutral-800 whitespace-pre-wrap break-words">
        {logs.length === 0 ? (
          <div className="opacity-60">
            No logs yet. Actions will appear here…
          </div>
        ) : (
          logs.map((line, idx) => (
            <div key={idx} className="py-0.5">
              {line}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
