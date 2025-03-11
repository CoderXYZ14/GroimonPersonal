"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";

export default function YourInstaToken() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlParams.get("code");

      if (!authorizationCode) {
        toast.error("Authorization code not found in URL");
        router.push("/dashboard/automation");
        return;
      }
      const session_data = localStorage.getItem("session_data");
      const userId = JSON.parse(session_data).id;
      console.log("userId", userId);
      try {
        const tokenResponse = await axios.post("/api/instagram-token", {
          code: authorizationCode,
          userId,
        });

        const accessToken = tokenResponse.data.access_token;
        console.log("accessToken", accessToken);
        if (typeof window !== "undefined") {
          localStorage.setItem("instagram_token", accessToken);
        }

        const detailsResponse = await axios.post("/api/insta_details", {
          accessToken: accessToken,
        });

        console.log("detailsResponse", detailsResponse.data);
        const { user_id, username } = detailsResponse.data;

        if (typeof window !== "undefined") {
          localStorage.setItem("instagram_user_id", user_id);
          localStorage.setItem("instagram_username", username);
        }

        toast.success("Instagram details fetched successfully");

        router.push("/dashboard/automation/create");
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(
            error.response?.data?.error ||
              "Error during Instagram token exchange or fetching details"
          );
          console.error("Instagram API Error:", error.response?.data || error);
        } else {
          toast.error("An unexpected error occurred");
          console.error("Unexpected Error:", error);
        }
        router.push("/dashboard/automation");
      } finally {
        setLoading(false);
      }
    };

    exchangeCodeForToken();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      {loading ? (
        <div className="flex flex-col items-center">
          <BeatLoader color="#3B82F6" size={15} />
          <p className="mt-4 text-gray-600">
            Processing Instagram token and fetching details...
          </p>
        </div>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
}
