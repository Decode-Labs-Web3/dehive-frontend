import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";
import { httpStatus } from "@/constants/index.constants";
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
          statusCode: httpStatus.UNAUTHORIZED,
          message: "userId is not found",
        },
        { status: httpStatus.UNAUTHORIZED }
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
        statusCode: httpStatus.OK,
        message: "Stream.io token retrieved successfully",
        data: { token },
      },
      { status: httpStatus.OK }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Server get user info fail",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
