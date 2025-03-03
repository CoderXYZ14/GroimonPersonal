"use client";

import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useTheme } from "next-themes";
import Link from "next/link";

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

  const { theme } = useTheme();

  // Define colors for light and dark modes
  const lightModeColors = ["#FF9A9E", "#FAD0C4", "#A1C4FD", "#C2E9FB"]; // Soft pastel gradient
  const darkModeColors = ["#FF6F61", "#FFD166", "#06D6A0", "#118AB2"]; // Vibrant but cohesive gradient

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400/10 via-pink-300/5 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 dark:to-transparent"></div>

      <Card className="w-full max-w-[400px] border shadow-lg relative z-10 bg-white/90 dark:bg-background/90 backdrop-blur-sm">
        <ShineBorder
          shineColor={theme === "dark" ? darkModeColors : lightModeColors}
          duration={14}
          borderWidth={1}
        />
        <CardHeader className="text-center pb-2">
          <Link href="/">
            <div className="flex items-center justify-center gap-2 font-bold text-xl mb-6">
              <Instagram className="h-6 w-6 text-purple-500" />
              <span>Groimon</span>
            </div>
          </Link>
          <CardTitle className="text-2xl">Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <Button
            onClick={() => handleSignIn("google")}
            variant="outline"
            className="w-full flex items-center justify-center gap-3 py-5 border shadow-sm hover:shadow bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 h-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative bg-white dark:bg-background px-4 text-sm text-gray-500 dark:text-gray-400">
              or
            </div>
          </div>

          <Button
            onClick={() => handleSignIn("instagram")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white flex items-center justify-center gap-3 py-5 h-auto"
          >
            <div className="w-5 h-5 relative flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="white"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>
            Sign in with Instagram
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By signing in, you agree to our
            <a
              href="/terms-of-service"
              className="text-purple-500 hover:text-purple-600 mx-1"
            >
              Terms of Service
            </a>
            and
            <a
              href="/privacy-policy"
              className="text-purple-500 hover:text-purple-600 mx-1"
            >
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
