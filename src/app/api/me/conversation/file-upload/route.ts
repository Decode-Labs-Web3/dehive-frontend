import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@/constants/index.constants";
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
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: "Missing sessionId",
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

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const conversationId = form.get("conversationId")?.toString();

    if (!file || !conversationId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Missing file or conversationId",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const forwardForm = new FormData();
    forwardForm.append("file", file);
    forwardForm.append("conversationId", conversationId);

    const backendResponse = await fetch(
      `${process.env.DEHIVE_DIRECT_MESSAGING}/api/dm/files/upload`,
      {
        method: "POST",
        headers: {
          "x-session-id": sessionId,
          "x-fingerprint-hashed": fingerprint,
        },
        body: forwardForm,
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.debug(`${pathname}`, backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || HTTP_STATUS.BAD_REQUEST,
          message: error?.message || "Upload file failed",
        },
        { status: backendResponse.status || HTTP_STATUS.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();
    // console.info(`${pathname}`, response.data);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || HTTP_STATUS.OK,
        message: response.message || "File uploaded successfully",
        data: response.data,
      },
      { status: response.statusCode || HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error(`${pathname}`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Server error while uploading file",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
