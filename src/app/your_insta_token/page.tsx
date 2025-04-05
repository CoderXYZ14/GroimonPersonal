"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/userSlice";

export default function YourInstaToken() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const processInstagramAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlParams.get("code");

      if (!authorizationCode) {
        toast.error("Authorization code not found");
        router.push("/");
        return;
      }

      try {
        const { data } = await axios.post("/api/instagram_token", {
          code: authorizationCode,
        });

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
        router.replace("/dashboard/automation");
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Failed to connect to Instagram"
        );
        console.error("Instagram authentication error:", error);
        router.push("/dashboard/automation");
      }
    };

    processInstagramAuth();
  }, [router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <BeatLoader color="#3B82F6" size={15} />
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Connecting to Instagram
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we process your authentication...
          </p>
        </div>
      </div>
    </div>
  );
}
