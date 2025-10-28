"use client";

import { useCallback, useEffect } from "react";
import { toastError } from "@/utils/toast.utils";
import { useSearchParams, useRouter } from "next/navigation";
import {
  faRobot,
  faFaceSmile,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Authorize() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ssoToken = searchParams.get("sso_token");
  const state = searchParams.get("state");

  const handleAuthorize = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/auth/get-sso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        credentials: "include",
        body: JSON.stringify({ ssoToken, state }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(response.message);
        toastError(response.message);
        router.push("/");
        return;
      }

      console.log(apiResponse);

      const userInfoResponse = await fetch("/api/user/user-info", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        credentials: "include",
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!userInfoResponse.ok) {
        console.error("Failed to fetch user info");
        toastError("Failed to load user info");
        router.push("/");
        return;
      }

      router.push("/app/channels/me");
    } catch (error) {
      console.error(error);
      console.log("Server for SSO error");
      toastError("SSO server error");
      return;
    }
  }, [ssoToken, state, router]);

  useEffect(() => {
    handleAuthorize();
  }, [handleAuthorize]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-xl bg-neutral-900 border-gray-800 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-200 text-lg">
              <FontAwesomeIcon
                icon={faRobot}
                className="w-6 h-6 text-gray-200"
                aria-hidden
              />
            </div>
            <div>
              <CardTitle className="text-lg">Authorizing</CardTitle>
              <p className="text-sm text-gray-400">
                Finishing SSO flow — please wait
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-gray-400 w-5 h-5"
            />
            <div className="text-sm text-gray-300 flex items-center gap-2">
              <span>Waiting for authorization from the SSO server...</span>
              <FontAwesomeIcon
                icon={faFaceSmile}
                className="text-gray-400 w-4 h-4"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={handleAuthorize}
              className="bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
