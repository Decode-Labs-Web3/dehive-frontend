"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toastError } from "@/utils/toast.utils";

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
        return;
      }

      console.log(apiResponse)
      router.push("/dashboard")
    } catch (err) {
      console.error(err);
      toastError("SSO server error");
      return;
    }
  }, [ssoToken, state, router]);

  useEffect(() => {
    handleAuthorize();
  }, [handleAuthorize]);

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <h1>Authorize</h1>
      <p>SSO token {ssoToken}</p>
      <p>State: {state}</p>
      <p>Waiting for authorize ...</p>
      <button onClick={handleAuthorize}>Authorize</button>
    </div>
  );
}
