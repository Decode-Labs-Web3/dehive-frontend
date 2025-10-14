import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";

export async function PATCH(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const sessionId = (await cookies()).get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 401,
          message: "Missing sessionId",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();
    const { channelId, name } = body;

    if (!channelId || !name) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 400,
          message: "Missing channelId or name",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      name,
    };

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    const backendRes = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers/channels/${channelId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
          "x-fingerprint-hashed": fingerprint_hashed,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.log(`${pathname} :`, backendRes)

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error(`${pathname} error:`, backendRes);
      return NextResponse.json(
        {
          status: false,
          statusCode: backendRes.status || 400,
          message: error.message,
        },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json();
    return NextResponse.json(
      {
        status: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Operation successful",
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: false,
      statusCode: 500,
      message: "Server error for edit server",
    });
  } finally {
    console.log(`${pathname} - ${requestId}`);
  }
}
