import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateRequestId, guardInternal, apiPathName} from "@/utils/index.utils"

export async function POST(req: Request) {
  const requestId = generateRequestId()
  const pathname = apiPathName(req)
  const denied = guardInternal(req)
  if(denied) return denied

  try {
    const cookieStore = await cookies();
    const ssoState = cookieStore.get("sso_state")?.value;

    if(!ssoState) {
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


    if(ssoState !== state) {
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

    const requestBody = {
      sso_token: ssoToken,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/sso/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId
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
          message: err?.message || "SSO failed",
        },
        { status: backendRes.status || 401 }
      );
    }

    const response = await backendRes.json();

    const res = NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "SSO token created",
      },
      { status: 200 }
    );

    res.cookies.set("sessionId", response.data._id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

    return res;
  } catch (error) {
    console.error("/api/auth/sso handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Failed to sso",
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
