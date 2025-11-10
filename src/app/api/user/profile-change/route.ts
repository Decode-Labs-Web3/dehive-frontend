import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@/constants/index.constants";
import {
  guardInternal,
  apiPathName,
  generateRequestId,
} from "@/utils/index.utils";

interface ProfileChangeInput {
  avatar_ipfs_hash?: string;
  display_name?: string;
  bio?: string;
}

function diffProfileChanges(
  current: ProfileChangeInput,
  original: ProfileChangeInput
) {
  const tasks = [];

  if (current.avatar_ipfs_hash !== original.avatar_ipfs_hash) {
    tasks.push({
      endpoint: "avatar",
      body: { avatar_ipfs_hash: current.avatar_ipfs_hash },
    });
  }

  if (current.display_name !== original.display_name) {
    tasks.push({
      endpoint: "display-name",
      body: { display_name: current.display_name },
    });
  }

  if (current.bio !== original.bio) {
    tasks.push({
      endpoint: "bio",
      body: { bio: current.bio },
    });
  }

  return tasks;
}

export async function PUT(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { current, original } = body;
    if (!current || !original) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: "Missing current or origin",
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const fingerprint = req.headers.get("X-Fingerprint-Hashed");
    // console.log("this is fingerprint from headers:", fingerprint);
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
    const changeData = diffProfileChanges(current, original);

    // console.log("current and original", current, original);
    // console.log("change data", changeData);

    const promises = changeData.map(async (data) => {
      const backendRes = await fetch(
        `${process.env.DEHIVE_USER_DEHIVE_SERVER}/api/memberships/profile/${data.endpoint}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
            "x-fingerprint-hashed": fingerprint,
          },
          body: JSON.stringify(data.body),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!backendRes.ok) {
        const error = await backendRes.json().catch(() => ({}));
        console.error(`${pathname} error: `, error);
        return NextResponse.json(
          {
            success: false,
            statusCode: backendRes.status || HTTP_STATUS.BAD_REQUEST,
            message: error.message || "Failed to change profile",
          },
          { status: backendRes.status || HTTP_STATUS.BAD_REQUEST }
        );
      }

      const response = await backendRes.text().catch(() => "");
      return {
        response: response,
        endpoint: data.endpoint,
        status: backendRes.status,
      };
    });
    const results = await Promise.all(promises);

    const allOk = results.every((r) => r.status);
    const someOk = results.some((r) => r.status);

    if (allOk) {
      return NextResponse.json(
        {
          success: true,
          statusCode: HTTP_STATUS.OK,
          message: "Profile updated",
        },
        { status: HTTP_STATUS.OK }
      );
    }

    if (someOk) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.PARTIAL_CONTENT,
          message: "Partial update",
        },
        { status: HTTP_STATUS.PARTIAL_CONTENT }
      );
    }
  } catch (error) {
    console.error(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to change profile",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
