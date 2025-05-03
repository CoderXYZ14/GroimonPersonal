"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/userSlice";
import Image from "next/image";
import { ShieldCheck, Lock } from "lucide-react";

declare global {
  interface Window {
    isProcessingAuth?: boolean;
  }
}

export default function YourInstaToken() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const processInstagramAuth = async () => {
      if (window.isProcessingAuth) return;
      window.isProcessingAuth = true;

      const urlParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlParams.get("code");

      const processedCode = sessionStorage.getItem("processed_auth_code");
      if (processedCode === authorizationCode) {
        return;
      }

      if (!authorizationCode) {
        toast.error("Authorization code not found");
        router.push("/");
        return;
      }

      try {
        const { data } = await axios.post("/api/instagram_token", {
          code: authorizationCode,
        });

        sessionStorage.setItem("processed_auth_code", authorizationCode);

        const { user: userData, tokenData } = data;

        localStorage.setItem("user_details", JSON.stringify(userData));
        localStorage.setItem("instagram_token", tokenData.access_token);

        await dispatch(
          setUser({
            _id: userData._id,
            instagramId: userData.instagramId,
            instagramUsername: userData.instagramUsername,
            instagramAccessToken: tokenData.access_token,
          })
        );

        toast.success("Successfully connected to Instagram");
        router.replace("/dashboard/automation?type=post");
      } catch (error) {
        console.error("[Instagram Token Page] Authentication error:", {
          message: error.response?.data?.error || error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        toast.error(
          error.response?.data?.error || "Failed to connect to Instagram"
        );
        console.error("Instagram authentication error:", error);
        router.push("/dashboard/automation?type=post");
      } finally {
        window.isProcessingAuth = false;
      }
    };

    processInstagramAuth();
  }, [router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FBFF] dark:bg-[#090E1A]">
      {/* Background elements */}
      <div className="absolute top-1/3 left-1/5 w-64 h-64 bg-[#1A69DD]/10 dark:bg-[#166dbd]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/5 w-64 h-64 bg-[#26A5E9]/10 dark:bg-[#1e99c7]/10 rounded-full blur-3xl animate-float-delayed" />

      {/* Main card */}
      <div className="relative z-10 max-w-md w-full space-y-6 p-8 bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl border border-border">
        {/* Branding */}
        <div className="flex flex-col items-center">
          <div className="mb-4 flex items-center gap-2">
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
          <h2 className="text-2xl font-semibold text-center text-foreground">
            Instagram Connection
          </h2>
        </div>

        {/* Loading state */}
        <div className="flex flex-col items-center py-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-[#1A69DD]/10 dark:bg-[#1A69DD]/20 flex items-center justify-center">
              <BeatLoader color="#1A69DD" size={12} />
            </div>
            <div className="absolute -inset-2 border-4 border-[#1A69DD]/20 rounded-full animate-ping"></div>
          </div>

          <h3 className="text-lg font-medium text-foreground mb-2">
            Securely connecting to Instagram
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Establishing a secure connection through Instagram’s official API
          </p>
        </div>

        {/* Trust indicators */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#1A69DD]" />
            <div>
              <p className="text-sm font-medium text-foreground">
                End-to-end encrypted
              </p>
              <p className="text-xs text-muted-foreground">
                Your data is protected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-[#1A69DD]" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Official Instagram API
              </p>
              <p className="text-xs text-muted-foreground">
                Using secure OAuth 2.0
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground text-center pt-4">
          This window will close automatically when complete
        </p>
      </div>
    </div>
  );
}
