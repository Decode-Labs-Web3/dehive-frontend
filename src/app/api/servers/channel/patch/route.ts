import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";
import { httpStatus } from "@/constants/index.constants";

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
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing sessionId",
        },
        {
          status: httpStatus.BAD_REQUEST,
        }
      );
    }

    const body = await req.json();
    const { channelId, name } = body;

    if (!channelId || !name) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing channelId or name",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const requestBody = {
      name,
    };

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

    const backendRes = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers/channels/${channelId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
          "x-fingerprint-hashed": fingerprint,
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
          success: false,
          statusCode: backendRes.status || httpStatus.BAD_REQUEST,
          message: error.message,
        },
        { status: backendRes.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendRes.json();
    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Operation successful",
      },
      { status: response.statusCode || httpStatus.OK }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Server error for edit server",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.log(`${pathname} - ${requestId}`);
  }
}
