import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@/constants/index.constants";
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
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: "Missing sessionId",
        },
        {
          status: HTTP_STATUS.UNAUTHORIZED,
        }
      );
    }

    const body = await req.json();
    const { serverId } = body;

    if (!serverId ) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Missing serverId",
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

    const backendRes = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers/${serverId}/channels`,
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

    // console.log(`${pathname} :`, backendRes)

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          status: false,
          statusCode: backendRes.status || HTTP_STATUS.BAD_REQUEST,
          message: error.message,
        },
        { status: backendRes.status || HTTP_STATUS.BAD_REQUEST }
      );
    }

    const response = await backendRes.json();
    console.log("channel-list response:", response);
    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || HTTP_STATUS.OK,
        message: response.message || "Operation successful",
        data: response.data,
      },
      { status: response.statusCode || HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Server error for edit server",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.log(`${pathname} - ${requestId}`);
  }
}
