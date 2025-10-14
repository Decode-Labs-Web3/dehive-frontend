import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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
    // console.log(`${pathname}:`, body)

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "kickForm is lacking info ",
        },
        { status: 400 }
      );
    }


    const backendResponse = await fetch(
      `${process.env.DEHIVE_USER_DEHIVE_SERVER}/api/memberships/kick`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.debug(
    //   `${pathname}:`,
    //   backendResponse.status
    // );

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname}:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 401,
          message: error?.message || "Create server failed",
        },
        { status: backendResponse.status || 401 }
      );
    }

    const response = await backendResponse.json();
    // console.info(`${pathname}:`, response.data);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 201,
        message: response.message || "User successfully kicked.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`${pathname}:`, error);
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
