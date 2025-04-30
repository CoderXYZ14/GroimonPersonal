"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { ShieldCheck, ExternalLink, Loader2 } from "lucide-react";

const RedirectContent = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("url");
  const type = searchParams.get("type"); // automation or story
  const id = searchParams.get("id"); // automation or story ID

  useEffect(() => {
    const handleRedirect = async () => {
      if (!redirectUrl) return;

      if (type && id) {
        try {
          await axios.post("/api/increment-redirect", {
            type,
            id,
          });
          console.log(`Incremented redirect count for ${type} ID: ${id}`);
        } catch (error) {
          console.error("Error incrementing redirect count:", error);
        }
      }

      window.location.href = decodeURIComponent(redirectUrl);
    };

    handleRedirect();
  }, [redirectUrl, type, id]);

  if (!redirectUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FBFF] dark:bg-[#090E1A]">
        <div className="relative z-10 text-center p-8 rounded-2xl bg-white dark:bg-[#0F172A] shadow-xl border border-border max-w-md w-full mx-4">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo2.svg"
              alt="Groimon Logo"
              width={40}
              height={40}
              className=""
            />
          </div>
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Invalid Redirect
          </h1>
          <p className="text-muted-foreground">
            No redirect URL was provided in the request
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="/dashboard/automation"
              className="text-sm font-medium text-[#1A69DD] hover:underline flex items-center gap-1"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FBFF] dark:bg-[#090E1A]">
      {/* Background elements */}
      <div className="absolute top-1/3 left-1/5 w-64 h-64 bg-[#1A69DD]/10 dark:bg-[#166dbd]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/5 w-64 h-64 bg-[#26A5E9]/10 dark:bg-[#1e99c7]/10 rounded-full blur-3xl animate-float-delayed" />

      {/* Main card */}
      <div className="relative z-10 text-center p-8 rounded-2xl bg-white dark:bg-[#0F172A] shadow-xl border border-border max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Branding */}
          <div className="mb-6 flex items-center gap-2">
            <Image
              src="/logo2.svg"
              alt="Groimon Logo"
              width={40}
              height={40}
              className=""
            />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
              Groimon
            </h1>
          </div>

          {/* Loading animation */}
          <div className="mb-6">
            <Loader2 className="h-10 w-10 text-[#1A69DD] animate-spin mx-auto" />
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-2">
            Redirecting You
          </h2>
          <p className="text-muted-foreground mb-6">
            You're being securely redirected to an external website
          </p>

          {/* Destination URL */}
          <div className="w-full p-4 bg-muted/50 rounded-lg border border-border mb-6">
            <div className="flex items-center justify-center gap-2 text-sm break-all">
              <ExternalLink className="h-4 w-4 flex-shrink-0 text-[#1A69DD]" />
              <span className="truncate">
                {decodeURIComponent(redirectUrl)}
              </span>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="w-full space-y-3 text-left">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#1A69DD]" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Secure Redirect
                </p>
                <p className="text-xs text-muted-foreground">
                  Your connection is protected
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-[#1A69DD]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No Data Shared
                </p>
                <p className="text-xs text-muted-foreground">
                  We don't send any personal information
                </p>
              </div>
            </div>
          </div>

          {/* Fallback link */}
          <p className="text-xs text-muted-foreground mt-6">
            Not redirecting?{" "}
            <a
              href={decodeURIComponent(redirectUrl)}
              className="text-[#1A69DD] hover:underline"
            >
              Click here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const RedirectPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F9FBFF] dark:bg-[#090E1A]">
          <div className="relative z-10 text-center p-8 rounded-2xl bg-white dark:bg-[#0F172A] shadow-xl border border-border">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 text-[#1A69DD] animate-spin" />
            </div>
            <p className="mt-4 text-muted-foreground">Preparing redirect...</p>
          </div>
        </div>
      }
    >
      <RedirectContent />
    </Suspense>
  );
};

export default RedirectPage;
