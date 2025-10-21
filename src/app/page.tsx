"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fingerprintService } from "@/services/fingerprint.services";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-md bg-card border flex items-center justify-center mb-4">
            <Image
              src="/images/logos/dehive.png"
              alt={"Dehive Logo"}
              width={64}
              height={64}
              className="w-12 h-12 object-contain"
              unoptimized
            />
          </div>
          <h1 className="text-foreground text-2xl font-bold">
            Welcome to Dehive
          </h1>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Continue with your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 text-base font-semibold transition-transform duration-150 ease-out hover:scale-105"
              variant="default"
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
              <p className="text-muted-foreground text-sm">
                Secure authentication powered by{" "}
                <span className="text-foreground font-medium">Decode</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
