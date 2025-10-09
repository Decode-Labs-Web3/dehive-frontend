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
      router.push("/app");
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-neutral-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-200 text-lg">
            <FontAwesomeIcon
              icon={faRobot}
              className="w-6 h-6 text-gray-200"
              aria-hidden
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Authorizing</h1>
            <p className="text-sm text-gray-400">
              Finishing SSO flow — please wait
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
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
          <button
            onClick={handleAuthorize}
            className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-sm text-gray-200 hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
