import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  try {
    // console.log("hello this is sso")
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

    const ssoUrl = new URL(`${decodeBase}/sso`);
    ssoUrl.searchParams.set("app", appId);
    ssoUrl.searchParams.set("redirect_uri", redirectUri);
    ssoUrl.searchParams.set("state", state);

    const res = NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "Login URL created",
        data: ssoUrl,
      },
      { status: 200 }
    );

    res.cookies.delete("ssoState")

    res.cookies.set("ssoState", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5,
    });

    return res;
  } catch (error: unknown) {
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
