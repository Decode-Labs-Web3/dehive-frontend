import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { httpStatus } from "@/constants/index.constants";
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
    const { serverId, memberId } = body;

    if (!serverId || !memberId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing serverId or memberId",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const requestBody = {
      server_id: serverId,
      user_dehive_id: memberId,
    };

    const backendRes = await fetch(
      `${process.env.DEHIVE_USER_DEHIVE_SERVER}/api/memberships/transfer-ownership`,
      {
        method: "PATCH",
        headers: {
          "x-session-id": sessionId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
        message: response.message || "Ownership transferred successfully.",
      },
      { status: response.statusCode || httpStatus.OK }
    );
  } catch (error) {
    console.error(`${pathname}:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Server error for ownership transferred",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.log(`${pathname} - ${requestId}`);
  }
}
