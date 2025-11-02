"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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
  parseAbiItem,
  toHex,
} from "viem";
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

export default function PayAsYouGoTestPage() {
  const [recipient, setRecipient] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [convId, setConvId] = useState<bigint | null>(null);
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

  const ensureSepolia = async () => {
    if (chainId === sepolia.id) return;
    await switchChainAsync({ chainId: sepolia.id });
  };

  const createConversation = async () => {
    if (!proxy) return alert("Proxy address missing");
    if (!isConnected) return alert("Please connect wallet");
    if (!address) return alert("No account");
    if (!isAddress(recipient)) return alert("Invalid recipient");
    try {
      setBusy(true);
      await ensureSepolia();
      // POC: use same random 32-byte "encrypted key" for both participants
      const enc = randomBytesHex(32);
      const txHash = await writeContractAsync({
        address: proxy,
        abi: messageAbi,
        functionName: "createConversation",
        args: [getAddress(recipient), enc, enc],
        chainId: sepolia.id,
      });
      const rc = await publicClient!.waitForTransactionReceipt({
        hash: txHash,
      });
      // compute deterministic conversation id off-chain
      const cid = computeConversationId(address, recipient);
      setConvId(cid);
      setLogs((l) => [
        `createConversation tx: ${txHash} (block ${rc.blockNumber})`,
        `conversationId: ${cid.toString()}`,
        ...l,
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // In case conversation already exists (tx revert), still compute deterministic convId so user can continue
      if (address && isAddress(recipient)) {
        const cid = computeConversationId(address, recipient);
        setConvId(cid);
        setLogs((l) => [
          `createConversation error: ${msg}`,
          `Using computed conversationId (maybe already exists): ${cid.toString()}`,
          ...l,
        ]);
      } else {
        setLogs((l) => [`createConversation error: ${msg}`, ...l]);
      }
    } finally {
      setBusy(false);
    }
  };

  // Auto-compute deterministic conversationId whenever address/recipient is valid
  useEffect(() => {
    if (address && isAddress(recipient)) {
      try {
        const cid = computeConversationId(address, recipient);
        setConvId(cid);
      } catch {
        setConvId(null);
      }
    } else {
      setConvId(null);
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
      let cid = convId;
      if (!cid) {
        if (!isAddress(recipient)) throw new Error("Invalid recipient");
        cid = computeConversationId(address, recipient);
        setConvId(cid);
      }
      // Check if conversation exists on-chain; if not, create it
      type ConversationTuple = readonly [
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        `0x${string}`,
        bigint
      ];
      const onchainConv = await publicClient!.readContract({
        address: proxy,
        abi: messageAbi,
        functionName: "conversations",
        args: [cid!],
      });
      const [, , , , createdAt] = onchainConv as ConversationTuple;
      if (!createdAt || createdAt === BigInt(0)) {
        const enc = randomBytesHex(32);
        const txCreate = await writeContractAsync({
          address: proxy,
          abi: messageAbi,
          functionName: "createConversation",
          args: [getAddress(recipient), enc, enc],
          chainId: sepolia.id,
        });
        await publicClient!.waitForTransactionReceipt({ hash: txCreate });
      }
      const fee = (payAsYouGoFee as bigint | undefined) ?? BigInt(0);
      const txHash = await writeContractAsync({
        address: proxy,
        abi: messageAbi,
        functionName: "sendMessage",
        args: [cid!, getAddress(recipient), message], // POC: store plaintext as "encryptedMessage"
        chainId: sepolia.id,
        value: fee,
      });
      const rc = await publicClient!.waitForTransactionReceipt({
        hash: txHash,
      });
      setLogs((l) => [
        `sendMessage tx: ${txHash} (fee ${Number(fee) / 1e18} ETH, block ${
          rc.blockNumber
        })`,
        ...l,
      ]);
      setMessage("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLogs((l) => [`sendMessage error: ${msg}`, ...l]);
    } finally {
      setBusy(false);
    }
  };

  const fetchMessages = async () => {
    if (!proxy) return alert("Proxy address missing");
    try {
      let cid = convId;
      if (!cid) {
        if (!(address && isAddress(recipient)))
          return alert("No conversationId");
        cid = computeConversationId(address, recipient);
        setConvId(cid);
      }

      // Prefer The Graph subgraph to avoid RPC endpoints that block eth_getLogs
      const SUBGRAPH_URL =
        process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
        "https://api.studio.thegraph.com/query/1713799/dehive-messaging/version/latest";
      const SUBGRAPH_TOKEN = process.env.NEXT_PUBLIC_SUBGRAPH_TOKEN;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (SUBGRAPH_TOKEN) headers["Authorization"] = `Bearer ${SUBGRAPH_TOKEN}`;

      const query = `
        query GetMessagesByConversation($conversationId: BigInt!, $first: Int!, $skip: Int!) {
          messageSents(
            where: { conversationId: $conversationId }
            first: $first,
            skip: $skip,
            orderBy: blockTimestamp,
            orderDirection: asc
          ) {
            id
            conversationId
            from
            to
            encryptedMessage
            blockNumber
            blockTimestamp
            transactionHash
          }
        }
      `;

      const body = JSON.stringify({
        query,
        variables: { conversationId: cid.toString(), first: 50, skip: 0 },
        operationName: "GetMessagesByConversation",
      });

      const res = await fetch(SUBGRAPH_URL, { method: "POST", headers, body });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText}\n${text}`);
      }
      const json = (await res.json()) as {
        data?: {
          messageSents: Array<{
            blockNumber: string;
            from: `0x${string}`;
            to: `0x${string}`;
            encryptedMessage: string;
          }>;
        };
        errors?: unknown;
      };
      if (json.errors) throw new Error(JSON.stringify(json.errors));

      const events = json.data?.messageSents ?? [];
      if (events.length > 0) {
        const lines = [
          `Subgraph: ${events.length} MessageSent events for ${cid.toString()}`,
          ...events.map(
            (e, i) =>
              `#${i + 1} from ${e.from} to ${e.to}: ${
                e.encryptedMessage
              } (block ${e.blockNumber})`
          ),
        ];
        setLogs((l) => [...lines, ...l]);
        return;
      }

      // Fallback to RPC logs if subgraph returned none
      try {
        const event = parseAbiItem(
          "event MessageSent(uint256 conversationId, address from, address to, string encryptedMessage)"
        );
        const rpcLogs = await publicClient!.getLogs({
          address: proxy,
          event,
          args: { conversationId: cid },
          fromBlock: BigInt(0),
        });
        const lines = [
          `RPC: ${rpcLogs.length} MessageSent events for ${cid.toString()}`,
          ...rpcLogs.map((ev, i) => {
            const anyEv = ev as unknown as {
              args?: { from?: string; to?: string; encryptedMessage?: string };
              blockNumber?: bigint;
            };
            return `#${i + 1} from ${anyEv.args?.from} to ${anyEv.args?.to}: ${
              anyEv.args?.encryptedMessage
            } (block ${anyEv.blockNumber?.toString()})`;
          }),
        ];
        setLogs((l) => [...lines, ...l]);
      } catch (err) {
        setLogs((l) => [
          `RPC logs fallback failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
          ...l,
        ]);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLogs((l) => [`fetchMessages error: ${msg}`, ...l]);
    }
  };

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
            title="Tạo cuộc trò chuyện on-chain giữa ví của bạn (A) và người nhận (B). Chỉ cần 1 lần. Nếu đã tồn tại, có thể bỏ qua."
            disabled={busy || !recipient || !isAddress(recipient)}
            onClick={createConversation}
            className="inline-flex items-center rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Processing..." : "Create conversation"}
          </button>
          <button
            title="Gửi tin nhắn kèm theo phí pay-as-you-go trực tiếp từ ví của bạn."
            disabled={busy || !convId || !message.trim()}
            onClick={sendPayAsYouGo}
            className="inline-flex items-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Sending..." : "Send (pay-as-you-go)"}
          </button>
          <button
            title="Lấy lịch sử MessageSent cho conversationId hiện tại (ưu tiên từ The Graph)."
            onClick={fetchMessages}
            className="inline-flex items-center rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-4 py-2 text-sm font-medium"
          >
            Fetch messages
          </button>
        </div>

        <div className="text-xs text-neutral-400 space-y-1">
          <div>
            <b>Create conversation</b>: tạo hội thoại on-chain (chỉ cần 1 lần,
            hai địa chỉ A/B sẽ có conversationId cố định).
          </div>
          <div>
            <b>Send (pay-as-you-go)</b>: gửi tin nhắn từ ví của bạn, trả phí mỗi
            tin nhắn = payAsYouGoFee.
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
            <b>ConversationId:</b> {convId?.toString() ?? "(none)"}
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
