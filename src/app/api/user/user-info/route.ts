import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { httpStatus, authExpire } from "@/constants/index.constants";
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
          statusCode: httpStatus.UNAUTHORIZED,
          message: "SessionId is not found",
        },
        { status: httpStatus.UNAUTHORIZED }
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
          statusCode: backendRes.status || httpStatus.BAD_REQUEST,
          message: error?.message,
        },
        { status: backendRes.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendRes.json();
    const res = NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "User found",
        data: response.data,
      },
      { status: response.statusCode || httpStatus.OK }
    );

    res.cookies.set("userId", response.data._id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: authExpire.sessionToken,
    });

    return res;
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Server get user info fail",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
