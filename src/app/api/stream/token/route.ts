import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";
import { HTTP_STATUS } from "@/constants/index.constants";
export const runtime = "nodejs";
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
    const userId = (await cookies()).get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: "userId is not found",
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const apiKey = process.env.STREAM_KEY!;
    const apiSecret = process.env.STREAM_SECRET!;
    const client = new StreamClient(apiKey, apiSecret);
    const validity = 60 * 60 * 24 * 30;

    const token = client.generateUserToken({
      user_id: userId!,
      validity_in_seconds: validity,
    });
    return NextResponse.json(
      {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Stream.io token retrieved successfully",
        data: { token },
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Server get user info fail",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
