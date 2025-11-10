import { randomBytes } from "crypto";
import { AUTH_EXPIRE, HTTP_STATUS } from "@/constants/index.constants";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    // console.log("hello this is sso")
    const decodeBase = process.env.DECODE_BASE_URL;
    if (!decodeBase) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Missing DECODE_BASE_URL",
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const appId = "dehive";

    const origin = req.nextUrl.origin;
    const redirectUri = `${origin}/sso`;

    const state = randomBytes(16).toString("base64url");

    const ssoUrl = new URL(`${decodeBase}/sso`);
    ssoUrl.searchParams.set("app", appId);
    ssoUrl.searchParams.set("redirect_uri", redirectUri);
    ssoUrl.searchParams.set("state", state);

    const res = NextResponse.json(
      {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Login URL created",
        data: ssoUrl,
      },
      { status: HTTP_STATUS.OK }
    );

    res.cookies.delete("ssoState");

    res.cookies.set("ssoState", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_EXPIRE.ssoState,
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message:
          error instanceof Error ? error.message : "Failed to create SSO URL",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.log(`${pathname} - ${requestId}`);
  }
}
