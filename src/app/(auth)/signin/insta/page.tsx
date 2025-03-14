"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import handleInstagramLogin from "@/hooks/handleInstagramLogin";

export default function InstagramLink() {
  const { data: session } = useSession();
  const { theme } = useTheme();

  const handleInstagramLink = async () => {
    try {
      handleInstagramLogin("/dashboard/automation");
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

          <CardHeader className="space-y-6">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 p-[2px]">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {session?.user?.name?.[0] || "U"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Signed in as
                </p>
                <p className="font-semibold text-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </motion.div>

            <CardTitle className="text-center text-2xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
                Link Your Instagram
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <p className="text-center text-sm text-muted-foreground">
                Connect your Instagram account to start automating your growth
              </p>

              <Button
                onClick={handleInstagramLink}
                className="w-full relative group flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 dark:from-purple-400 dark:to-pink-400 dark:hover:from-purple-500 dark:hover:to-pink-500 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
              >
                <Instagram className="w-5 h-5" />
                Connect Instagram Account
              </Button>

              <div className="text-center">
                <Link
                  href="/dashboard/automation"
                  className="text-sm text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                >
                  Skip for now
                </Link>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-xs text-muted-foreground"
            >
              We&apos;ll never post without your permission. View our
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
