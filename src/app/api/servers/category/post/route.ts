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
    const { serverId, name } = body;

    // console.log("[category/post] incoming payload", { serverId, name });

    if (!serverId || !name) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing required fields: serverId and name are required",
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
      `${process.env.DEHIVE_SERVER}/api/servers/${serverId}/categories`,
      {
        method: "POST",
        headers: {
          "x-session-id": sessionId,
          "Content-Type": "application/json",
          "x-fingerprint-hashed": fingerprint,
        },
        body: JSON.stringify({ name }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.debug(`${pathname} error:`, backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || httpStatus.BAD_REQUEST,
          message: error?.message || "Create category failed",
        },
        { status: backendResponse.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();
    // console.debug(`${pathname}`, response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.CREATED,
        message: response.message || "Operation successful",
        data: response.data,
      },
      { status: response.statusCode || httpStatus.CREATED }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
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
