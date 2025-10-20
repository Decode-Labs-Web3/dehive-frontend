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
    console.log(`${pathname}:`, body);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Un Ban Form is lacking info ",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const backendResponse = await fetch(
      `${process.env.DEHIVE_USER_DEHIVE_SERVER}/api/memberships/unban`,
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
    //   `${pathname}`,
    //   backendResponse.status
    // );

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname} error:`, error);
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
    // console.info(`${pathname}:`, response.data);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.CREATED,
        message: response.message || "User successfully unbanned.",
      },
      { status: response.statusCode || httpStatus.CREATED }
    );
  } catch (error) {
    console.error(`${pathname}:`, error);
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
