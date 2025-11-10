import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { HTTP_STATUS, AUTH_EXPIRE } from "@/constants/index.constants";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";

export async function GET(req: Request) {
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
          message: "SessionId is not found",
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
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

    // console.log("this is ssoToken and state from sso", ssoToken, state);

    const backendRes = await fetch(`${process.env.DEHIVE_AUTH}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
        "x-fingerprint-hashed": fingerprint,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || HTTP_STATUS.BAD_REQUEST,
          message: error?.message,
        },
        { status: backendRes.status || HTTP_STATUS.BAD_REQUEST }
      );
    }

    const response = await backendRes.json();
    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || HTTP_STATUS.OK,
        message: response.message || "User found",
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
        message: "Server get user info fail",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
