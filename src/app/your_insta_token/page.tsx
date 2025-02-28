"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export default function YourInstaToken() {
  const router = useRouter();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlParams.get("code");

      if (!authorizationCode) {
        toast.error("Authorization code not found in URL");
        router.push("/dashboard/automation");
        return;
      }

      try {
        const response = await axios.post("/api/instagram-token", {
          code: authorizationCode,
        });

        const accessToken = response.data.access_token;

        if (typeof window !== "undefined") {
          localStorage.setItem("instagram_token", accessToken);
        }
        toast.success("Instagram logged in successfully");

        router.push("/dashboard/automation/create");
      } catch (error: any) {
        toast.error("Error exchanging code for token");
        console.error(
          "Error exchanging code for token:",
          error.response?.data || error.message
        );
        router.push("/dashboard/automation");
      }
    };

    exchangeCodeForToken();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Processing Instagram token...</p>
    </div>
  );
}
