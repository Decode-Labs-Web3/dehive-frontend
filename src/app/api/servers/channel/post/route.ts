import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const sessionId = (await cookies()).get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing sessionId",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { serverId, categoryId, name, type } = body;

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    // console.log("[category/post] incoming payload", { serverId, name });

    if (!serverId || !categoryId || !name || !type) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message:
            "Missing required fields: serverId and categoryId and name and type are required",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      name,
      type,
    };

    const backendResponse = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers/${serverId}/categories/${categoryId}/channels`,
      {
        method: "POST",
        headers: {
          "x-session-id": sessionId,
          "Content-Type": "application/json",
          "x-fingerprint-hashed": fingerprint_hashed,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.debug( "create-category backend response status", backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error("/api/servers/channel/post backend error:", error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 401,
          message: error?.message || "Create category failed",
        },
        { status: backendResponse.status || 401 }
      );
    }

    const response = await backendResponse.json();
    // console.debug("create-category success response", response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 201,
        message: response.message || "Operation successful",
        data: response.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("/api/servers/channel/post handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server error while get server",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
