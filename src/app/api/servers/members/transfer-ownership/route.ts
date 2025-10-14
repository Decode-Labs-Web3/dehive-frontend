import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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
    const { serverId, memberId } = body;

    if (!serverId || !memberId) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 400,
          message: "Missing serverId or memberId",
        },
        { status: 400 }
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

    // console.log("hdkqwhdqkjwdnqwkjdbnwqdjqwbdwjhqdbqwudjyqwbdujebduwejdbweujd",backendRes )

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
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
        message: response.message || "Ownership transferred successfully.",
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: false,
      statusCode: 500,
      message: "Server error for ownership transferred",
    });
  } finally {
    console.log(`${pathname} - ${requestId}`);
  }
}
