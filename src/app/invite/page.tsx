"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const handleInvite = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        credentials: "include",
        body: JSON.stringify({ code }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(response.message);
        router.push("/");
        return;
      }
      if (
        response.statusCode === 201 &&
        response.message === "Operation successful"
      ) {
        const serverId = String(response.data.server_id);
        // console.log("hello this is ",response.data.server_id)
        router.push(`/app/channels/${serverId}`);
      }
    } catch (error) {
      console.error(error);
      console.log("Server for Invite to server error");
      return;
    }
  }, [code, router]);

  useEffect(() => {
    handleInvite();
  }, [handleInvite]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center shadow-xl bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="mb-6">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="text-indigo-400 text-6xl mb-4"
            />
          </div>

          <CardTitle className="text-3xl font-bold text-gray-200 mb-4">
            Processing Invite
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-indigo-400 text-4xl animate-spin"
            />
          </div>

          <p className="text-gray-400 mb-2">
            Please wait while we process your invitation...
          </p>

          {code && (
            <div className="mt-6 bg-gray-700 rounded-lg p-4 border border-gray-600">
              <p className="text-sm text-gray-400 mb-1">Invite Code</p>
              <p className="text-lg font-mono font-semibold text-gray-200">
                {code}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
