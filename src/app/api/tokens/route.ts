import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

type Token = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string; // raw string balance in smallest unit
  logoURI?: string;
  chainId: number;
};

// Helper: parse query params with sane defaults
function getQueryParams(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = (searchParams.get("address") || "").trim();
  const chainId = Number(searchParams.get("chainId") || 1);
  const includeZero = searchParams.get("includeZero") === "true";
  const provider = (searchParams.get("provider") || "").trim().toLowerCase();
  return { address, chainId, includeZero, provider };
}

export async function GET(req: NextRequest) {
  try {
    const { address, chainId, includeZero, provider } = getQueryParams(req);

    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid or missing 'address'" },
        { status: 400 }
      );
    }

    const covalentKey = process.env.COVALENT_API_KEY;
    const alchemyKey = process.env.ALCHEMY_API_KEY;

    // Determine provider order: query param > env default > legacy default
    const envDefault = (
      process.env.DEFAULT_TOKEN_INDEXER_PROVIDER || ""
    ).toLowerCase();
    const preferred = provider || envDefault || "auto";
    const order: Array<"alchemy" | "covalent"> =
      preferred === "alchemy"
        ? ["alchemy", "covalent"]
        : preferred === "covalent"
        ? ["covalent", "alchemy"]
        : ["covalent", "alchemy"]; // legacy default

    for (const p of order) {
      if (p === "alchemy" && alchemyKey) {
        const tokens = await fetchAlchemyBalances({
          address,
          chainId,
          apiKey: alchemyKey,
          includeZero,
        });
        return NextResponse.json(
          { tokens },
          { status: 200, headers: cacheHeaders() }
        );
      }
      if (p === "covalent" && covalentKey) {
        const data = await fetchCovalentBalances({
          address,
          chainId,
          apiKey: covalentKey,
        });
        const tokens = (data || []).filter(
          (t) => includeZero || t.balance !== "0"
        );
        return NextResponse.json(
          { tokens },
          { status: 200, headers: cacheHeaders() }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "No indexer configured. Set COVALENT_API_KEY or ALCHEMY_API_KEY in server env to enable token discovery.",
      },
      { status: 501 }
    );
  } catch (err: any) {
    console.error("/api/tokens error", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

function cacheHeaders() {
  // Cache for 60s at the edge/browser; tweak as needed
  return {
    "Cache-Control": "public, max-age=30, s-maxage=60",
  };
}

async function fetchCovalentBalances({
  address,
  chainId,
  apiKey,
}: {
  address: string;
  chainId: number;
  apiKey: string;
}): Promise<Token[]> {
  // Map common chainIds to Covalent chains
  // https://www.covalenthq.com/docs/networks
  const covalentChainId = chainId; // Covalent largely uses EVM chain IDs directly

  const url = new URL(
    `https://api.covalenthq.com/v1/${covalentChainId}/address/${address}/balances_v2/`
  );
  url.searchParams.set("nft", "false");
  url.searchParams.set("no-nft-fetch", "true");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Covalent error ${res.status}: ${text}`);
  }
  const json = await res.json();
  const items: any[] = json?.data?.items || [];

  const tokens: Token[] = items
    .filter((i) => i?.type === "cryptocurrency" && i?.contract_address)
    .map((i) => ({
      address: i.contract_address,
      symbol: i.contract_ticker_symbol || "",
      name: i.contract_name || "",
      decimals: Number(i.contract_decimals || 18),
      balance: String(i.balance || "0"),
      logoURI: i.logo_url || undefined,
      chainId,
    }));
  return tokens;
}

async function fetchAlchemyBalances({
  address,
  chainId,
  apiKey,
  includeZero,
}: {
  address: string;
  chainId: number;
  apiKey: string;
  includeZero: boolean;
}): Promise<Token[]> {
  // Use JSON-RPC Enhanced APIs
  const base = alchemyBaseUrl(chainId, apiKey);

  // Step 1: get token balances via JSON-RPC
  const balancesRes = await fetch(base, {
    method: "POST",
    headers: { "content-type": "application/json" },
    // See https://docs.alchemy.com/reference/alchemy_gettokenbalances
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getTokenBalances",
      params: includeZero
        ? [address, "erc20", { includeZeroBalance: true }]
        : [address, "erc20"],
    }),
    next: { revalidate: 60 },
  });
  if (!balancesRes.ok) {
    const text = await balancesRes.text();
    throw new Error(
      `Alchemy getTokenBalances error ${balancesRes.status}: ${text}`
    );
  }
  const balancesJson = await balancesRes.json();
  const tokenBalances: Array<{
    contractAddress: string;
    tokenBalance: string;
  }> = balancesJson?.result?.tokenBalances || [];

  // Step 2: fetch metadata for each token via JSON-RPC (limit to 200 to avoid overfetching)
  const limited = tokenBalances.slice(0, 200);
  const metaPromises = limited.map(async (tb) => {
    try {
      const metaRes = await fetch(base, {
        method: "POST",
        headers: { "content-type": "application/json" },
        // https://docs.alchemy.com/reference/alchemy_gettokenmetadata
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getTokenMetadata",
          params: [tb.contractAddress],
        }),
        next: { revalidate: 300 },
      });
      if (!metaRes.ok) return null;
      const metaJson = await metaRes.json();
      const meta = metaJson?.result || {};
      return {
        address: tb.contractAddress,
        symbol: meta.symbol || "",
        name: meta.name || "",
        decimals: Number(meta.decimals ?? 18),
        balance: String(tb.tokenBalance || "0"),
        logoURI: meta.logo || undefined,
        chainId,
      } satisfies Token;
    } catch {
      return null;
    }
  });

  const tokens = (await Promise.all(metaPromises)).filter(Boolean) as Token[];
  return tokens;
}

function alchemyBaseUrl(chainId: number, apiKey: string) {
  // https://docs.alchemy.com/reference/api-overview#api-urls
  switch (chainId) {
    case 1:
      return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
    case 11155111:
      // Ethereum Sepolia testnet
      return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    case 137:
      return `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`;
    case 10:
      return `https://opt-mainnet.g.alchemy.com/v2/${apiKey}`;
    case 42161:
      return `https://arb-mainnet.g.alchemy.com/v2/${apiKey}`;
    case 8453:
      return `https://base-mainnet.g.alchemy.com/v2/${apiKey}`;
    default:
      // Default to Ethereum mainnet
      return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
  }
}
