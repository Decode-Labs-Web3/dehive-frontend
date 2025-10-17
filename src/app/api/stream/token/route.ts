export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";

export async function GET(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const secret = process.env.STREAM_SECRET;

  if (!apiKey || !secret) {
    console.error("[stream] missing env", {
      hasApiKey: !!apiKey,
      hasSecret: !!secret,
    });
    return new NextResponse(
      JSON.stringify({
        error: "Missing env: NEXT_PUBLIC_STREAM_API_KEY / STREAM_SECRET",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "anonymous";

  try {
    const serverClient = new StreamClient(apiKey, secret);
    const token = serverClient.createToken(userId);
    return new NextResponse(JSON.stringify({ apiKey, token, userId }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[stream] token error:", e);
    return new NextResponse(JSON.stringify({ error: "token_failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
}
