"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import handleInstagramLogin from "@/hooks/handleInstagramLogin";

export default function SignIn() {
  const { theme } = useTheme();

  const handleInstagramLink = async () => {
    try {
      handleInstagramLogin();
    } catch (error) {
      console.error("Instagram Link Error:", error);
    }
  };

  const lightModeColors = ["#FF9A9E", "#FAD0C4", "#A1C4FD", "#C2E9FB"];
  const darkModeColors = ["#FF6F61", "#FFD166", "#06D6A0", "#118AB2"];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-400/10 via-pink-300/5 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 dark:to-transparent animate-pulse-slow"></div>

        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400/30 dark:bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-400/30 dark:bg-pink-600/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[400px] px-4"
      >
        <Card className="relative overflow-hidden border shadow-lg bg-white/90 dark:bg-background/90 backdrop-blur-xl">
          <ShineBorder
            shineColor={theme === "dark" ? darkModeColors : lightModeColors}
            duration={14}
            borderWidth={1}
            className="rounded-xl"
          />

          <CardHeader className="space-y-6 pb-2">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="block">
                <div className="flex items-center justify-center gap-2 font-bold text-xl">
                  <Image
                    src="/logo.svg"
                    alt="logo"
                    width={80}
                    height={25}
                    className="dark:invert transition-transform hover:scale-105"
                  />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
                    Groimon
                  </span>
                </div>
              </Link>
            </motion.div>

            <CardTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
              Welcome Back
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={handleInstagramLink}
                variant="outline"
                className="w-full relative group flex items-center justify-center gap-3 py-5 border shadow-sm hover:shadow-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 h-auto transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                Sign in with Instagram
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-sm text-muted-foreground mt-6"
            >
              By signing in, you agree to our{" "}
              <Link
                href="/terms-of-service"
                className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
              
  href="/privacy-policy"
                className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                Privacy Policy
              </Link>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
