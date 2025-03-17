"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useSession } from "next-auth/react";

export default function YourInstaToken() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    // if (!session) {
    //   toast.error("Please sign in to continue");
    //   router.push("/signin");
    //   return;
    // }

    const processInstagramAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlParams.get("code");

      if (!authorizationCode) {
        toast.error("Authorization code not found");
        router.push("/dashboard/automation");
        return;
      }

      setIsProcessing(true);

      try {
        const { data } = await axios.post("/api/instagram_token", {
          code: authorizationCode,
          userId: "67d7ad008e6101562691c63e",
        });

        localStorage.setItem("user_details", JSON.stringify(data.user));
        localStorage.setItem("instagram_token", data.tokenData.access_token);

        toast.success("Successfully connected to Instagram");
        router.push("/dashboard/automation");
      } catch (error) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response?.data?.error ?? "Failed to connect to Instagram"
            : "An unexpected error occurred";

        toast.error(errorMessage);
        console.error("Instagram authentication error:", error);
        router.push("/dashboard/automation");
      } finally {
        setIsProcessing(false);
      }
    };

    processInstagramAuth();
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          {isProcessing ? (
            <>
              <BeatLoader color="#3B82F6" size={15} />
              <h2 className="mt-6 text-xl font-semibold text-gray-900">
                Connecting to Instagram
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we process your authentication...
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900">
                Redirecting...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You will be redirected shortly
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
