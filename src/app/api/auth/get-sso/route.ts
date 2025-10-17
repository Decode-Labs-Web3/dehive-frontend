import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";

function isoToMaxAgeSeconds(expiresAtISO: string): number {
  const now = Date.now();
  const expMs = Date.parse(expiresAtISO);
  return Math.max(0, Math.floor((expMs - now) / 1000));
}

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
          statusCode: 401,
          message: "SSO State is expired",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { ssoToken, state } = body;

    if (ssoState !== state) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "SSO State mismatch",
        },
        { status: 401 }
      );
    }

    // console.log("this is ssoToken and state from sso", ssoToken, state);
    const fingerprint = (await cookies()).get("fingerprint")?.value;

    if (!fingerprint) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing fingerprint header",
        },
        { status: 400 }
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
      const err = await backendRes.json().catch(() => null);
      console.log(`${pathname}`, err);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: err?.message || "SSO failed",
        },
        { status: backendRes.status || 401 }
      );
    }

    const response = await backendRes.json();
    // console.log(`${pathname}`,response);

    const res = NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "SSO token created",
      },
      { status: 200 }
    );

    res.cookies.delete("ssoState");
    res.cookies.delete("accessExp");
    res.cookies.delete("sessionId");
    const accessExpISO = response.data.expires_at as string;
    const accessMaxAge = isoToMaxAgeSeconds(accessExpISO);
    const accessExpSec = Math.floor(Date.parse(accessExpISO) / 1000);

    res.cookies.set("accessExp", String(accessExpSec), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: accessMaxAge,
    });

    res.cookies.set("sessionId", response.data.session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: accessMaxAge,
    });

    return res;
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server create SSO fail",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: 405,
      message: "Method Not Allowed",
    },
    { status: 405 }
  );
}
