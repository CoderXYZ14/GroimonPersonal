"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { ShieldCheck, ExternalLink, Loader2 } from "lucide-react";

const LockIcon = () => (
  <svg
    className="h-5 w-5"
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
);

const TrustItem = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <div className="flex items-start gap-3">
    <span className="text-[#1A69DD]">{icon}</span>
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  </div>
);

const RedirectPage = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("url");
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  useEffect(() => {
    if (!redirectUrl) return;

    const trackAndRedirect = async () => {
      try {
        if (type && id) {
          await axios.post("/api/increment-redirect", { type, id });
        }
        window.location.href = decodeURIComponent(redirectUrl);
      } catch (error) {
        console.error("Redirect error:", error);
      }
    };

    trackAndRedirect();
  }, [redirectUrl, type, id]);

  if (!redirectUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FBFF] dark:bg-[#090E1A]">
        <div className="text-center p-8 rounded-2xl bg-white dark:bg-[#0F172A] shadow-xl border border-border max-w-md w-full mx-4">
          <Image
            src="/logo2.svg"
            alt="Logo"
            width={40}
            height={40}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Invalid Redirect
          </h1>
          <p className="text-muted-foreground mb-6">
            No redirect URL was provided
          </p>
          <a
            href="/dashboard/automation"
            className="text-[#1A69DD] hover:underline"
          >
            Return to Dashboard
          </a>
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
            <Image src="/logo2.svg" alt="Logo" width={40} height={40} />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
              Groimon
            </h1>
          </div>

          {/* Loading spinner */}
          <Loader2 className="h-10 w-10 text-[#1A69DD] animate-spin mb-6" />

          <h2 className="text-xl font-semibold mb-2">Redirecting You</h2>
          <p className="text-muted-foreground mb-6">
            You're being securely redirected
          </p>

          {/* Destination URL */}
          <div className="w-full p-4 bg-muted/50 rounded-lg border border-border mb-6">
            <div className="flex items-center justify-center gap-2 text-sm break-all">
              <ExternalLink className="h-4 w-4 text-[#1A69DD]" />
              <span className="truncate">
                {decodeURIComponent(redirectUrl)}
              </span>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="w-full space-y-3 mb-6">
            <TrustItem
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Secure Redirect"
              text="Your connection is protected"
            />
            <TrustItem
              icon={<LockIcon />}
              title="No Data Shared"
              text="We don't send any personal information"
            />
          </div>

          {/* Fallback link */}
          <p className="text-xs text-muted-foreground">
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

export default RedirectPage;
