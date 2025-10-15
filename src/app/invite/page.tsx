"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faSpinner } from "@fortawesome/free-solid-svg-icons";

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
        router.push(`/app/channels/${response.data.server_id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="text-indigo-600 text-6xl mb-4"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Processing Invite
        </h1>

        <div className="mb-6">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-indigo-600 text-4xl animate-spin"
          />
        </div>

        <p className="text-gray-600 mb-2">
          Please wait while we process your invitation...
        </p>

        {code && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Invite Code</p>
            <p className="text-lg font-mono font-semibold text-gray-800">
              {code}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
