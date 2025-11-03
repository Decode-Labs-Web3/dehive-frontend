import { NextResponse } from "next/server";

// Server-side proxy for The Graph subgraph queries
// Keeps the authorization token hidden from the client.
//
// Configuration (set in .env.local):
// - SUBGRAPH_URL:     Server-only subgraph endpoint (preferred)
// - SUBGRAPH_TOKEN:   Server-only bearer token if required by the endpoint
//
// For backward compatibility, this route will also fall back to
// NEXT_PUBLIC_SUBGRAPH_URL and NEXT_PUBLIC_SUBGRAPH_TOKEN if the
// server-only variants are not defined.

export const dynamic = "force-dynamic"; // ensure no caching by Next for this route

type MessageSent = {
  id: string;
  conversationId: string;
  from: `0x${string}`;
  to: `0x${string}`;
  encryptedMessage: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: `0x${string}`;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      conversationId: string | number | bigint;
      first?: number;
      skip?: number;
    };

    if (
      !body ||
      body.conversationId === undefined ||
      body.conversationId === null
    ) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    const conversationId = String(body.conversationId);
    const first = Number.isFinite(body.first) ? Number(body.first) : 50;
    const skip = Number.isFinite(body.skip) ? Number(body.skip) : 0;

    const SUBGRAPH_URL =
      process.env.SUBGRAPH_URL ||
      process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
      "https://api.studio.thegraph.com/query/1713799/dehive-messaging/version/latest";
    const SUBGRAPH_TOKEN =
      process.env.SUBGRAPH_TOKEN || process.env.NEXT_PUBLIC_SUBGRAPH_TOKEN;

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

    const resp = await fetch(SUBGRAPH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables: { conversationId, first, skip },
        operationName: "GetMessagesByConversation",
      }),
      // Avoid edge caches or intermediaries caching sensitive results
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return NextResponse.json(
        {
          error: `Subgraph HTTP ${resp.status} ${resp.statusText}`,
          details: text,
        },
        { status: 502 }
      );
    }

    const json = (await resp.json()) as {
      data?: { messageSents: MessageSent[] };
      errors?: unknown;
    };

    if (json.errors) {
      return NextResponse.json(
        { error: "Subgraph returned errors", details: json.errors },
        { status: 502 }
      );
    }

    return NextResponse.json({ messageSents: json.data?.messageSents ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
