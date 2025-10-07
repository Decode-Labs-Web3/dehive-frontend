import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateRequestId, apiPathName } from "@/utils/index.utils";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  try {
    const sessionId = (await cookies()).get("sessionId")?.value;
    const body = await req.json();
    const { name, description } = body;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "Missing sessionId",
        },
        { status: 401 }
      );
    }

    if (!name || !description) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing name and description",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      name,
      description,
    };

    const backendResponse = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.debug("create-server backend response status", backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error("/api/servers/server backend error:", error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 400,
          message: error?.message || "Create server failed",
        },
        { status: backendResponse.status || 400 }
      );
    }

    const response = await backendResponse.json();
    // console.debug("create-server success response", response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 201,
        message: response.message || "Operation successful",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("/api/servers/server handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server error while creating server",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  try {
    const sessionId = (await cookies()).get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing sessionId",
        },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers`,
      {
        method: "GET",
        headers: {
          "x-session-id": sessionId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.debug("get-server backend response status", backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error("/api/server/server backend error:", error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 400,
          message: error?.message || "Create server failed",
        },
        { status: backendResponse.status || 400 }
      );
    }

    const response = await backendResponse.json();
    // console.debug("create-server success response", response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Operation successful",
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/servers/server handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server error while get server",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function PATCH(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  try {
    const sessionId = (await cookies()).get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 401,
          message: "Missing sessionId",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();
    const { serverId, name, description } = body;

    if (!serverId || !name || !description) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 400,
          message: "Missing serverId or name or description",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      name,
      description,
    };

    const backendRes = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers/${serverId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.log("this is backend response from ", backendRes)

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          status: false,
          statusCode: backendRes.status || 400,
          message: error.message,
        },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json();
    return NextResponse.json(
      {
        status: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Operation successful",
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error(error)
    return NextResponse.json({
      status: false,
      statusCode: 500,
      message: "Server error for edit server",
    });
  } finally {
    console.log(`${pathname} - ${requestId}`);
  }
}

export async function DELETE(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  try {
    const sessionId = (await cookies()).get("sessionId")?.value;
    if (!sessionId) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 401,
          message: "Missing sessionId",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();
    const { serverId } = body;

    if (!serverId) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 400,
          message: "Missing serverId",
        },
        { status: 400 }
      );
    }

    const backendRes = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers/${serverId}`,
      {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          status: false,
          statusCode: backendRes.status || 400,
          message: error.message,
        },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json();
    return NextResponse.json(
      {
        status: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Operation successful",
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error(error)
    return NextResponse.json({
      status: false,
      statusCode: 500,
      message: "Server error for deleted server",
    });
  } finally {
    console.log(`${pathname} - ${requestId}`);
  }
}
