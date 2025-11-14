"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiHeaders } from "@/utils/api.utils";
import { isElectron, openExternal } from "@/utils/electron.utils";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const apiResponse = await fetch("/api/auth/create-sso", {
        method: "GET",
        headers: getApiHeaders(),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });
      const response = await apiResponse.json();

      if (!response.success)
        throw new Error(response.message || "Cannot start SSO");

      if (isElectron()) {
        openExternal(response.data);
      } else {
        router.push(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-20 h-10 md:w-40 md:h-20 mb-4 rounded-none">
            <AvatarImage src="/images/logos/dehive.png" alt="Dehive Logo" />
            <AvatarFallback>DeHive logo</AvatarFallback>
          </Avatar>
          <h1 className="text-gray-200 text-xl md:text-2xl font-bold">
            Welcome to Dehive
          </h1>
        </div>

        <Card className="shadow-lg bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl text-gray-200">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-10 md:h-12 text-sm md:text-base font-semibold bg-gray-700 hover:bg-gray-600"
            >
              <div className="flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      className="text-current"
                      icon={faRightToBracket}
                    />
                    <span>Continue with SSO</span>
                  </>
                )}
              </div>
            </Button>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Secure authentication powered by{" "}
                <span className="text-gray-200 font-medium">Decode</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
