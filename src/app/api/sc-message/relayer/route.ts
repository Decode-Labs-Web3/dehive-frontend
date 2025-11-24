import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// Minimal ABI only for the server-side relayer operations
const messageServerAbi = parseAbi([
  "function relayer() view returns (address)",
  "function relayerFee() view returns (uint256)",
  "function funds(address) view returns (uint256)",
  "function sendMessageViaRelayer(uint256 conversationId, address from, address to, string encryptedMessage, uint256 feeAmount) returns (bool)",
]);

// POST /api/sc-message/relayer
export async function POST(req: NextRequest) {
  try {
    console.log("[Relayer API] Incoming POST /api/sc-message/relayer");
    const body = await req.json().catch(() => ({}));
    console.log("[Relayer API] Body:", {
      conversationId: body?.conversationId,
      from: body?.from,
      to: body?.to,
      encryptedMessageLen:
        typeof body?.encryptedMessage === "string"
          ? body.encryptedMessage.length
          : 0,
    });
    const proxy = process.env.NEXT_PUBLIC_PROXY_ADDRESS as
      | `0x${string}`
      | undefined;
    const rpcUrl =
      process.env.SEPOLIA_RPC_URL ||
      process.env.NEXT_PUBLIC_SEPOLIA_RPC ||
      "https://1rpc.io/sepolia";
    const pkRaw = process.env.RELAYER_PRIVATE_KEY;
    console.log("[Relayer API] Env:", {
      hasProxy: !!proxy,
      rpcUrl,
      hasRelayerPk: !!pkRaw,
    });

    if (!proxy || !isAddress(proxy)) {
      return NextResponse.json(
        { error: "Missing or invalid proxy address" },
        { status: 400 }
      );
    }
    if (!pkRaw) {
      return NextResponse.json(
        { error: "Missing RELAYER_PRIVATE_KEY on server" },
        { status: 500 }
      );
    }
    // normalize pk to 0x... format and validate
    const privateKey = pkRaw.startsWith("0x")
      ? (pkRaw as `0x${string}`)
      : (`0x${pkRaw}` as `0x${string}`);
    const pkLower = privateKey.toLowerCase();
    const isHex64 = /^0x[0-9a-f]{64}$/.test(pkLower);
    const looksLikeAddress = /^0x[0-9a-f]{40}$/.test(pkLower);
    if (!isHex64) {
      const reason = looksLikeAddress
        ? "Provided RELAYER_PRIVATE_KEY looks like an address, not a private key"
        : "RELAYER_PRIVATE_KEY must be a 0x-prefixed 64-hex private key";
      console.warn("[Relayer API] Invalid RELAYER_PRIVATE_KEY format", {
        reason,
        valueLength: privateKey.length,
      });
      return NextResponse.json(
        {
          error: "Invalid RELAYER_PRIVATE_KEY format",
          reason,
          hint: "Set RELAYER_PRIVATE_KEY to the PRIVATE KEY of the relayer wallet (0x + 64 hex), not the address.",
        },
        { status: 400 }
      );
    }

    const account = privateKeyToAccount(privateKey);
    console.log("[Relayer API] Relayer wallet:", account.address);
    const transport = http(rpcUrl);
    const pub = createPublicClient({ chain: sepolia, transport });
    const wallet = createWalletClient({ account, chain: sepolia, transport });

    // Optional: if provided, verify RELAYER_WALLET_ADDRESS matches the derived account
    const envRelayerAddr = process.env.RELAYER_WALLET_ADDRESS;
    if (
      envRelayerAddr &&
      envRelayerAddr.toLowerCase() !== account.address.toLowerCase()
    ) {
      console.warn("[Relayer API] RELAYER_WALLET_ADDRESS mismatch", {
        envRelayerAddr,
        derived: account.address,
      });
    }

    const { conversationId, from, to, encryptedMessage } = body as {
      conversationId?: string | number | bigint;
      from?: string;
      to?: string;
      encryptedMessage?: string;
    };

    if (
      conversationId === undefined ||
      !from ||
      !to ||
      typeof encryptedMessage !== "string" ||
      encryptedMessage.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!isAddress(from) || !isAddress(to)) {
      return NextResponse.json(
        { error: "Invalid from/to address" },
        { status: 400 }
      );
    }

    // Optional safety check: ensure this server's wallet matches the on-chain relayer
    try {
      const onchainRelayer = await pub.readContract({
        address: proxy,
        abi: messageServerAbi,
        functionName: "relayer",
      });
      console.log("[Relayer API] On-chain relayer:", onchainRelayer);
      if (
        (onchainRelayer as string).toLowerCase() !==
        account.address.toLowerCase()
      ) {
        console.warn("[Relayer API] Relayer mismatch", {
          expected: onchainRelayer,
          actual: account.address,
        });
        return NextResponse.json(
          {
            error: "Server relayer wallet does not match contract relayer",
            expected: onchainRelayer,
            actual: account.address,
          },
          { status: 409 }
        );
      }
    } catch {
      // ignore validation failure, continue
    }

    // Fetch current relayer fee and ensure user has enough funds
    const [fee, userFunds] = await Promise.all([
      pub.readContract({
        address: proxy,
        abi: messageServerAbi,
        functionName: "relayerFee",
      }) as Promise<bigint>,
      pub.readContract({
        address: proxy,
        abi: messageServerAbi,
        functionName: "funds",
        args: [from as `0x${string}`],
      }) as Promise<bigint>,
    ]);
    const relayerEthBalance = await pub.getBalance({
      address: account.address,
    });
    console.log("[Relayer API] Economics:", {
      relayerFeeWei: fee.toString(),
      userFundsWei: userFunds.toString(),
      relayerEthWei: relayerEthBalance.toString(),
    });

    if (userFunds < fee) {
      return NextResponse.json(
        {
          error: "Insufficient deposited funds",
          required: fee.toString(),
          balance: userFunds.toString(),
        },
        { status: 402 }
      );
    }

    // Ensure relayer wallet has some ETH for gas (user's deposit only covers fee inside contract)
    const minRelayerWei = BigInt(100_000_000_000_000); // 0.0001 ETH
    if (relayerEthBalance < minRelayerWei) {
      return NextResponse.json(
        {
          error: "Relayer wallet has insufficient ETH for gas",
          balanceWei: relayerEthBalance.toString(),
          hint: "Fund the relayer address with a small amount of Sepolia ETH (e.g., 0.01) to pay gas.",
        },
        { status: 402 }
      );
    }

    // Send tx via relayer
    const convIdBigInt =
      typeof conversationId === "bigint"
        ? (conversationId as bigint)
        : BigInt(conversationId as string);
    console.log("[Relayer API] sendMessageViaRelayer args:", {
      conversationId: convIdBigInt.toString(),
      from,
      to,
      ciphertextLen: (encryptedMessage as string).length,
    });
    // Pre-estimate gas & fees to avoid provider defaults that may be too low
    let gas: bigint;
    try {
      gas = await pub.estimateContractGas({
        address: proxy,
        abi: messageServerAbi,
        functionName: "sendMessageViaRelayer",
        args: [
          convIdBigInt,
          from as `0x${string}`,
          to as `0x${string}`,
          encryptedMessage as string,
          fee,
        ],
        account,
      });
    } catch (estErr) {
      console.warn(
        "[Relayer API] estimateContractGas failed, retry with fixed gas",
        estErr
      );
      // Use a conservative default gas limit if estimation fails
      gas = BigInt(250_000);
    }
    const fees = await pub.estimateFeesPerGas().catch(async () => {
      // Fallback for rare RPCs: derive from last block base fee with a small tip
      const block = await pub.getBlock();
      const base = block.baseFeePerGas ?? BigInt(1_000_000_000); // 1 gwei fallback
      return {
        maxFeePerGas: base * BigInt(2),
        maxPriorityFeePerGas: BigInt(1_000_000_000), // 1 gwei tip
      } as const;
    });
    console.log("[Relayer API] Gas & Fees:", {
      gas: gas.toString(),
      maxFeePerGas: fees.maxFeePerGas.toString(),
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas.toString(),
    });

    const hash = await wallet.writeContract({
      address: proxy,
      abi: messageServerAbi,
      functionName: "sendMessageViaRelayer",
      args: [
        convIdBigInt,
        from as `0x${string}`,
        to as `0x${string}`,
        encryptedMessage as string,
        fee,
      ],
      account,
      gas,
      maxFeePerGas: fees.maxFeePerGas,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
    });
    console.log("[Relayer API] tx submitted:", hash);

    // Optionally wait for inclusion for better UX
    const receipt = await pub.waitForTransactionReceipt({ hash });
    console.log("[Relayer API] tx mined:", {
      txHash: hash,
      blockNumber: Number(receipt.blockNumber),
      status: receipt.status,
    });

    return NextResponse.json({
      ok: true,
      txHash: hash,
      blockNumber: Number(receipt.blockNumber),
    });
  } catch (e: unknown) {
    const err = e as Error & { stack?: string };
    console.error("[Relayer API] ERROR:", {
      message: err?.message,
      stack: err?.stack,
    });
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: msg, stack: err?.stack },
      { status: 500 }
    );
  }
}
