"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

      console.log("This is login", response);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand Area */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-6 shadow-2xl">
            <div className="w-8 h-8 bg-black rounded-lg"></div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Dehive</h1>
          <p className="text-gray-400 text-lg">Welcome back</p>
        </div>

        {/* Login Card */}
        <div className="bg-black/40 backdrop-blur-lg border-[var(--border-color)] rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Sign In
              </h2>
              <p className="text-gray-400">Continue with your account</p>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="group relative w-full bg-white hover:bg-gray-100 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Continue with SSO</span>
                  </>
                )}
              </div>
            </button>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Secure authentication powered by{" "}
                <span className="text-white font-medium">Decode</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="text-white hover:text-gray-300 underline underline-offset-2"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-white hover:text-gray-300 underline underline-offset-2"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
