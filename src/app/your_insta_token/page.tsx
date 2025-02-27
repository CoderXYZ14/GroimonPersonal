"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function YourInstaToken() {
  const router = useRouter();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlParams.get("code");

      console.log("Authorization Code:", authorizationCode); // Debugging log

      if (!authorizationCode) {
        console.error("Authorization code not found in URL");
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

        router.push("/dashboard/automation/create");
      } catch (error) {
        console.error(
          "Error exchanging code for token:",
          error.response?.data || error.message
        ); // Debugging log
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
