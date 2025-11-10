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
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: "Missing sessionId",
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const body = await req.json();
    const { channelId, messageId, pageDown } = body;

    // console.log("eduhwdilhewodhlwiedukhwedu", channelId);
    // console.log("eduhwdilhewodhlwiedukhwedu", messageId);
    // console.log("eduhwdilhewodhlwiedukhwedu", pageDown);

    if (!messageId || !channelId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Missing messageId or pageDown",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

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

    const backendResponse = await fetch(
      `${process.env.DEHIVE_CHANNEL_MESSAGING}/api/messages/channels/${channelId}/messages/${messageId}/down?page=${pageDown}&limit=30`,
      {
        method: "GET",
        headers: {
          "x-session-id": sessionId,
          "x-fingerprint-hashed": fingerprint,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.debug("get-server-info backend response status", backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname} backend error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || HTTP_STATUS.BAD_REQUEST,
          message: error?.message || "Search failed",
        },
        { status: backendResponse.status || HTTP_STATUS.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();
    // console.debug(`${pathname}`, response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || HTTP_STATUS.OK,
        message: response.message || "OK",
        data: response.data,
      },
      { status: response.statusCode || HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error(`${pathname}  handler error:`, error);
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
