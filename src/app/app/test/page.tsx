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
      const list = json.data?.messageSents || [];
      const out = list.map(
        (m) =>
          `${m.blockNumber} ${m.from.slice(0, 6)} -> ${m.to.slice(0, 6)}: ${
            m.encryptedMessage
          }`
      );
      setLogs((l) => [...out, ...l]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLogs((l) => [`fetchMessages error (subgraph): ${msg}`, ...l]);
      // Fallback to direct RPC logs if subgraph fails and RPC allows
      try {
        let cid = convId;
        if (!cid) {
          if (!(address && isAddress(recipient))) return;
          cid = computeConversationId(address, recipient);
        }
        const event = parseAbiItem(
          "event MessageSent(uint256 indexed conversationId, address indexed from, address indexed to, string encryptedMessage)"
        );
        const logsOnchain = await publicClient!.getLogs({
          address: proxy,
          event,
          args: { conversationId: cid },
          fromBlock: BigInt(0),
          toBlock: "latest",
        });
        const out = logsOnchain.map((lg) => {
          const { args } = lg as unknown as {
            args: {
              conversationId: bigint;
              from: `0x${string}`;
              to: `0x${string}`;
              encryptedMessage: string;
            };
          };
          return `${lg.blockNumber} ${args.from.slice(0, 6)} -> ${args.to.slice(
            0,
            6
          )}: ${args.encryptedMessage}`;
        });
        setLogs((l) => [...out.reverse(), ...l]);
      } catch (e2: unknown) {
        const msg2 = e2 instanceof Error ? e2.message : String(e2);
        setLogs((l) => [
          `fetchMessages error: HTTP request failed.\n\n${msg2}`,
          ...l,
        ]);
      }
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Dehive On-chain Messaging – Pay-as-you-go (Sepolia)</h2>
        <ConnectButton />
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Recipient (0x...)</label>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value.trim())}
            placeholder="0x..."
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            disabled={busy || !recipient || !isAddress(recipient)}
            onClick={createConversation}
          >
            {busy ? "Processing..." : "Create conversation"}
          </button>
          <button
            disabled={busy || !convId || !message.trim()}
            onClick={sendPayAsYouGo}
          >
            {busy ? "Sending..." : "Send (pay-as-you-go)"}
          </button>
          <button onClick={fetchMessages}>Fetch messages</button>
        </div>

        <div>
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

        <div style={{ display: "grid", gap: 8 }}>
          <label>Message</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message... (POC will store plaintext as 'encryptedMessage')"
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
          />
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>Logs</h3>
      <pre
        style={{
          background: "#0b0b0b",
          color: "#c8facc",
          padding: 12,
          borderRadius: 8,
          minHeight: 160,
        }}
      >
        {logs.join("\n")}
      </pre>
    </main>
  );
}
