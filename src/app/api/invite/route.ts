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
          statusCode: httpStatus.UNAUTHORIZED,
          message: "sessionId is expired",
        },
        { status: httpStatus.UNAUTHORIZED }
      );
    }

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing code",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    // console.log("this is ssoToken and state from sso", );

    const backendRes = await fetch(
      `${process.env.DEHIVE_USER_DEHIVE_SERVER}/api/memberships/invite/use/${code}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
          "X-Request-Id": requestId,
        },
        // body: JSON.stringify(null),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.error(`${pathname}`, backendRes);

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error(`${pathname} error:`, backendRes);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || httpStatus.BAD_REQUEST,
          message: error.message,
        },
        { status: backendRes.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendRes.json();
    console.log("Hello this is response from server invite", response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.CREATED,
        message: response.message || "Operation successful",
        data: response.data,
      },
      { status: response.statusCode || httpStatus.CREATED }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Server from invite server",
      },
      { status:  httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: httpStatus.METHOD_NOT_ALLOWED,
      message: "Method Not Allowed",
    },
    { status: httpStatus.METHOD_NOT_ALLOWED }
  );
}
