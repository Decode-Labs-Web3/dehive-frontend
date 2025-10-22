import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { httpStatus } from "@/constants/index.constants";
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
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing sessionId",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const body = await req.json();
    const { channelId, page } = body;

    if (!channelId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing channelId",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const fingerprint = (await cookies()).get("fingerprint")?.value;

    if (!fingerprint) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing fingerprint header",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const backendResponse = await fetch(
      `${process.env.DEHIVE_CHANNEL_MESSAGING}/api/messages/channel/${channelId}?page=${page}&limit=30`,
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

    // console.debug(`${pathname}:`, backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname}: `, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || httpStatus.BAD_REQUEST,
          message: error?.message || "Create server failed",
        },
        { status: backendResponse.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();
    // console.info(`${pathname}:`, response.data.items);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "OK",
        data: response.data,
      },
      { status: response.statusCode || httpStatus.OK }
    );
  } catch (error) {
    console.error(`${pathname}: handler error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Server error while get server",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
