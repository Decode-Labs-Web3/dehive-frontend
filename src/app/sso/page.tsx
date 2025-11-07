"use client";

import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toastError } from "@/utils/toast.utils";
import { Spinner } from "@/components/ui/spinner";
import { useSearchParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faFaceSmile } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthorizePage() {
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="w-full max-w-xl bg-card border-border shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-lg">
              <FontAwesomeIcon
                icon={faRobot}
                className="w-6 h-6 text-muted-foreground"
                aria-hidden
              />
            </div>
            <div>
              <CardTitle className="text-lg">Authorizing</CardTitle>
              <p className="text-sm text-muted-foreground">
                Finishing SSO flow — please wait
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3">
            <Spinner className="text-muted-foreground w-5 h-5" />
            <div className="text-sm text-card-foreground flex items-center gap-2">
              <span>Waiting for authorization from the SSO server...</span>
              <FontAwesomeIcon
                icon={faFaceSmile}
                className="text-muted-foreground w-4 h-4"
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
