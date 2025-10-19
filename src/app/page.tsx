"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fingerprintService } from "@/services/fingerprint.services";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { fingerprint_hashed } = await fingerprintService();
      document.cookie = `fingerprint=${fingerprint_hashed}; path=/; max-age=31536000; SameSite=Lax`;
    })();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const apiResponse = await fetch("/api/auth/create-sso", {
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
      });
      const response = await apiResponse.json();

      // console.log("This is login", response);
      if (!response.success)
        throw new Error(response.message || "Cannot start SSO");
      router.push(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-md bg-neutral-900 flex items-center justify-center mb-4">
            <Image
              src="/images/logos/dehive.png"
              alt={"Dehive Logo"}
              width={64}
              height={64}
              className="w-12 h-12 object-contain"
              unoptimized
            />
          </div>
          <h1 className="text-white text-2xl font-bold">Welcome to Dehive</h1>
        </div>

        <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-1">
                Sign In
              </h2>
              <p className="text-gray-400">Continue with your account</p>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="group relative w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 px-5 rounded-lg transition-transform duration-150 ease-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed shadow"
            >
              <div className="flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      className="text-black"
                      icon={faRightToBracket}
                    />
                    <span>Continue with SSO</span>
                  </>
                )}
              </div>
            </button>

            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Secure authentication powered by{" "}
                <span className="text-white font-medium">Decode</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
