"use client";

import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  const handleSignIn = async (provider: "google" | "instagram") => {
    try {
      const response = await signIn(provider, {
        callbackUrl: "/",
        redirect: false,
      });
      console.log("SignIn Response:", response);
    } catch (error) {
      console.error("SignIn Error:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => handleSignIn("google")} className="w-full">
            Sign in with Google
          </Button>
          <Button onClick={() => handleSignIn("instagram")} className="w-full">
            Sign in with Instagram
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
