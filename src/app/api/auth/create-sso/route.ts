import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  try {
    const decodeBase = process.env.DECODE_BASE_URL;
    if (!decodeBase) {
      const statusCode = 500;
      const message = "Missing DECODE_BASE_URL";
      return NextResponse.json(
        { success: false, statusCode, message },
        { status: statusCode }
      );
    }

    const appId = process.env.DEHIVE_APP_ID ?? "dehive";

    const origin = req.nextUrl.origin;
    const redirectUri = `${origin}/sso`;

    const state = randomBytes(16).toString("base64url");

    const authorizeUrl = new URL(`${decodeBase}/sso`);
    authorizeUrl.searchParams.set("app", appId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("state", state);

    const statusCode = 200;
    const message = "Login URL created";

    const res = NextResponse.json(
      {
        success: true,
        statusCode,
        message,
        data: { authorizeUrl: authorizeUrl.toString() },
      },
      { status: statusCode, headers: { "Cache-Control": "no-store" } }
    );

    res.cookies.set("sso_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5,
    });

    return res;
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Failed to create SSO URL",
      },
      { status: 500 }
    );
  }
}
