import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@/constants/index.constants";

export const dynamic = "force-dynamic";
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
    const body = await request.json();
    const { conversationId, first, skip } = body;

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Missing conversationId",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

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

    const resp = await fetch(`${process.env.SUBGRAPH_URL}`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${process.env.SUBGRAPH_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: { conversationId, first, skip },
        operationName: "GetMessagesByConversation",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
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
