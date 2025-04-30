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
      await handleInstagramLogin();
    } catch (error) {
      console.error("Instagram Login Error:", error);
    }
  };

  // Brand gradients for shine
  const lightGrad = ["#1A69DD", "#26A5E9"];
  const darkGrad = ["#166dbd", "#1e99c7"];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(26,105,221,0.1),transparent)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(30,153,199,0.2),transparent)]">
      {/* Floating accent blobs */}
      <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-[#1A69DD]/30 dark:bg-[#166dbd]/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/5 w-64 h-64 bg-[#26A5E9]/30 dark:bg-[#1e99c7]/30 rounded-full blur-3xl animate-float-delayed" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl px-6 py-8"
      >
        <div className="relative">
          <Card className="relative overflow-visible border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl focus-within:ring-4 focus-within:ring-[#1A69DD]/50 dark:focus-within:ring-[#26A5E9]/50 rounded-2xl">
            <ShineBorder
              shineColor={theme === "dark" ? darkGrad : lightGrad}
              duration={12}
              borderWidth={1}
              className="rounded-2xl"
            />
            <CardHeader className="pt-8 pb-6 space-y-2 text-center">
              <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
                Connect Instagram
              </CardTitle>
              <p className="text-gray-700 dark:text-gray-300 text-base font-medium">
                Use your Instagram account to connect to Groimon.
              </p>
            </CardHeader>

            <CardHeader className="pt-8 pb-5 space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="Groimon"
                  width={50}
                  height={50}
                  className="transition-transform hover:scale-110"
                />
                <span className="text-5xl font-bold text-gray-500 dark:text-gray-400">
                  ⇋
                </span>
                <Image
                  src="/instagram.svg"
                  alt="Instagram"
                  width={50}
                  height={50}
                  className="transition-transform hover:scale-110"
                />
              </div>
            </CardHeader>

            <CardContent className="px-8 space-y-6 pt-2 pb-8 text-center">
              <Button
                onClick={handleInstagramLink}
                className="w-3/4 mx-auto relative flex items-center justify-center gap-3 py-6 px-6 rounded-3xl bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] text-white font-semibold shadow-lg hover:shadow-[0_12px_40px_rgba(26,105,221,0.3)] hover:scale-[1.04] transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300 group backdrop-blur-md"
              >
                <span className="text-lg sm:text-xl font-bold tracking-wide z-10">
                  Sign in with Instagram
                </span>
              </Button>
            </CardContent>

            <div className="text-center text-gray-600 dark:text-gray-400 text-base px-12 pb-12 leading-relaxed">
              Log in with{" "}
              <span className="font-semibold text-[#1A69DD] dark:text-[#26A5E9]">
                Instagram
              </span>
              , set your permissions, and you're ready to connect with{" "}
              <span className="font-semibold text-[#1A69DD] dark:text-[#26A5E9]">
                Groimon
              </span>
              !
            </div>

            {/* Center the Meta badge and certification text */}
            <div className="flex flex-col items-center justify-center gap-2 pb-8">
              <Image
                src="/metaTech.svg"
                alt="Approved by Meta"
                width={100}
                height={28}
                className="opacity-100 hover:opacity-90 transition-opacity dark:bg-white/50 dark:rounded-lg mb-2 px-1 py-1 rounded-lg"
              />

              <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>
                  Groimon has been certified by Meta as an official Tech
                  Provider.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
