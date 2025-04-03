"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/userSlice";

export default function YourInstaToken() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processInstagramAuth = async () => {
      // Prevent multiple processing attempts
      if (isProcessing) return;

      const urlParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlParams.get("code");

      // Clear the URL to prevent reuse of the code
      window.history.replaceState({}, document.title, window.location.pathname);

      if (!authorizationCode) {
        toast.error("Authorization code not found");
        router.push("/dashboard/automation");
        return;
      }

      setIsProcessing(true);

      try {
        const { data } = await axios.post("/api/instagram_token", {
          code: authorizationCode,
        });

        const { user: userData, tokenData } = data;

        await dispatch(
          setUser({
            _id: userData._id,
            instagramId: userData.instagramId,
            instagramUsername: userData.instagramUsername,
            instagramAccessToken: tokenData.access_token,
          })
        );

        const userDataForStorage = {
          _id: userData._id,
          instagramId: userData.instagramId,
          instagramUsername: userData.instagramUsername,
          instagramAccessToken: tokenData.access_token,
        };

        localStorage.setItem(
          "user_details",
          JSON.stringify(userDataForStorage)
        );
        localStorage.setItem("instagram_token", tokenData.access_token);

        const cookies = document.cookie.split(";");
        const redirectCookie = cookies.find((c) =>
          c.trim().startsWith("redirectTo=")
        );
        const redirectTo = redirectCookie
          ? decodeURIComponent(redirectCookie.split("=")[1])
          : "/dashboard/automation";

        document.cookie =
          "redirectTo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        toast.success("Successfully connected to Instagram");

        router.replace(redirectTo);
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
  }, [router, dispatch]);

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
