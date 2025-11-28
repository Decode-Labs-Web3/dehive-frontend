import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

type Token = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  logoURI?: string;
  chainId: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const address: string = (body.address || "").trim();
    const chainId: number = Number(body.chainId ?? 1);
    const includeZero: boolean = Boolean(body.includeZero);

    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid or missing 'address'" },
        { status: 400 }
      );
    }

    const alchemyKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyKey) {
      return NextResponse.json(
        { error: "Alchemy API key not configured" },
        { status: 501 }
      );
    }

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
  } catch (err: any) {
    console.error("/api/tokens POST error", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

function cacheHeaders() {
  return { "Cache-Control": "public, max-age=30, s-maxage=60" };
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
  const base = alchemyBaseUrl(chainId, apiKey);

  const balancesRes = await fetch(base, {
    method: "POST",
    headers: { "content-type": "application/json" },
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
    throw new Error(`Alchemy error ${balancesRes.status}: ${text}`);
  }

  const balancesJson = await balancesRes.json();
  const tokenBalances: Array<{
    contractAddress: string;
    tokenBalance: string;
  }> = balancesJson?.result?.tokenBalances || [];

  const limited = tokenBalances.slice(0, 200);
  const metaPromises = limited.map(async (tb) => {
    try {
      const metaRes = await fetch(base, {
        method: "POST",
        headers: { "content-type": "application/json" },
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
  switch (chainId) {
    case 1:
      return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
    case 11155111:
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
      return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
  }
}
