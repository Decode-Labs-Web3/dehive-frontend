import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_EXPIRE, HTTP_STATUS } from "@/constants/index.constants";
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
    // const cookieStore = await cookies();
    // const ssoState = cookieStore.get("ssoState")?.value;

    const ssoState = (await cookies()).get("ssoState")?.value;

    if (!ssoState) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: "SSO State is expired",
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const body = await req.json();
    const { ssoToken, state } = body;

    if (ssoState !== state) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: "SSO State mismatch",
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

    const requestBody = {
      sso_token: ssoToken,
      fingerprint_hashed: fingerprint,
    };

    const backendRes = await fetch(
      `${process.env.DEHIVE_AUTH}/auth/session/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.error(`${pathname}`,backendRes)

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.log(`${pathname}`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || HTTP_STATUS.UNAUTHORIZED,
          message: error?.message || "SSO failed",
        },
        { status: backendRes.status || HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const response = await backendRes.json();
    // console.log(`${pathname}`,response);

    const res = NextResponse.json(
      {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "SSO token created",
      },
      { status: HTTP_STATUS.OK }
    );

    res.cookies.delete("ssoState");
    res.cookies.delete("accessExp");
    res.cookies.delete("sessionId");

    res.cookies.set(
      "accessExp",
      String(Math.floor(Date.now() / 1000) + AUTH_EXPIRE.sessionToken),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: AUTH_EXPIRE.sessionToken,
      }
    );

    res.cookies.set("sessionId", response.data.session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_EXPIRE.sessionToken,
    });

    return res;
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Server create SSO fail",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
      message: "Method Not Allowed",
    },
    { status: HTTP_STATUS.METHOD_NOT_ALLOWED }
  );
}
