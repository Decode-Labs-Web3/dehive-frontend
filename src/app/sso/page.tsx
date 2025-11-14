"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getApiHeaders } from "@/utils/api.utils";
import { useFingerprint } from "@/hooks/useFingerprint";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faFaceSmile } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AuthorizePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ssoToken = searchParams.get("sso_token");
  const state = searchParams.get("state");
  const { fingerprintHash } = useFingerprint();

  // console.log("This is fingerprint", fingerprintHash);

  const handleAuthorize = useCallback(async () => {
    if (!fingerprintHash) return;
    try {
      const apiResponse = await fetch("/api/auth/get-sso", {
        method: "POST",
        headers: getApiHeaders(fingerprintHash, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
        body: JSON.stringify({ ssoToken, state }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();
      if (!apiResponse.ok) {
        console.error(response.message);
        router.push("/");
        return;
      }
      // console.log(apiResponse);
      router.push("/app/channels/me");
    } catch (error) {
      console.error(error);
      console.log("Server for SSO error");
      return;
    }
  }, [ssoToken, state, router, fingerprintHash]);

  useEffect(() => {
    if (!fingerprintHash) return;
    handleAuthorize();
  }, [handleAuthorize, fingerprintHash]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-md md:max-w-xl bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm md:text-lg">
              <FontAwesomeIcon
                icon={faRobot}
                className="w-5 h-5 md:w-6 md:h-6 text-gray-400"
                aria-hidden
              />
            </div>
            <div>
              <CardTitle className="text-base md:text-lg">
                Authorizing
              </CardTitle>
              <p className="text-xs md:text-sm text-gray-400">
                Finishing SSO flow — please wait
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3">
            <Spinner className="text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <div className="text-xs md:text-sm text-gray-200 flex items-center gap-2">
              <span>Waiting for authorization from the SSO server...</span>
              <FontAwesomeIcon
                icon={faFaceSmile}
                className="text-gray-400 w-3 h-3 md:w-4 md:h-4"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={handleAuthorize} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 md:p-6">
          <Card className="w-full max-w-md md:max-w-xl bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm md:text-lg">
                  <FontAwesomeIcon
                    icon={faRobot}
                    className="w-5 h-5 md:w-6 md:h-6 text-gray-400"
                    aria-hidden
                  />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">
                    Loading...
                  </CardTitle>
                  <p className="text-xs md:text-sm text-gray-400">
                    Preparing SSO authorization
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Spinner className="text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <div className="text-xs md:text-sm text-gray-200">
                  <span>Loading authorization page...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AuthorizePageContent />
    </Suspense>
  );
}
