import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";
import { HTTP_STATUS } from "@/constants/index.constants";

export async function DELETE(req: Request) {
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

    if (!serverId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Missing serverId",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const backendRes = await fetch(
      `${process.env.DEHIVE_USER_DEHIVE_SERVER}/api/memberships/server/${serverId}/leave`,
      {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.log(`${pathname}:`,backendRes )

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || HTTP_STATUS.BAD_REQUEST,
          message: error.message,
        },
        { status: backendRes.status || HTTP_STATUS.BAD_REQUEST }
      );
    }

    const response = await backendRes.json();
    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || HTTP_STATUS.OK,
        message: response.message || "Successfully left server.",
      },
      { status: response.statusCode || HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Server error for deleted server",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.log(`${pathname} - ${requestId}`);
  }
}
