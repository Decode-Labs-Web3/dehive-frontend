import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";
import { HTTP_STATUS } from "@/constants/index.constants";

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
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Missing sessionId",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const body = await req.json();
    const { serverId, categoryId, name, type } = body;

    const fingerprint = req.headers.get("X-Fingerprint-Hashed");
    // console.log("this is fingerprint from headers:", fingerprint);

    if (!fingerprint) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Missing fingerprint header",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // console.log("[category/post] incoming payload", { serverId, name });

    if (!serverId || !categoryId || !name || !type) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message:
            "Missing required fields: serverId and categoryId and name and type are required",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
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
          "x-fingerprint-hashed": fingerprint,
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
          statusCode: backendResponse.status || HTTP_STATUS.BAD_REQUEST,
          message: error?.message || "Create category failed",
        },
        { status: backendResponse.status || HTTP_STATUS.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();
    // console.debug("create-category success response", response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || HTTP_STATUS.CREATED,
        message: response.message || "Operation successful",
        data: response.data,
      },
      { status: response.statusCode || HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error("/api/servers/channel/post handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Server error while get server",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
