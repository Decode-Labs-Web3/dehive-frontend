import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateRequestId, apiPathName } from "@/utils/index.utils";

export async function GET(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);

  try {
    const sessionId = (await cookies()).get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "SessionId is not found",
        },
        { status: 401 }
      );
    }

    // console.log("this is ssoToken and state from sso", ssoToken, state);
    const requestBody = {
      session_id: sessionId,
    };

    const backendRes = await fetch(
      `${process.env.DEHIVE_AUTH}/auth/session/check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: err?.message,
        },
        { status: backendRes.status || 401 }
      );
    }

    const response = await backendRes.json();
    console.log(response);

    const res = NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "Session found",
        data: response.data.user,
      },
      { status: 200 }
    );

    res.cookies.set("userId", response.data.user._id,{
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return res
  } catch (error) {
    console.error("/api/user/user-info handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server get user info fail",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
