// app/instagram-callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function InstagramCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        console.error("No authorization code found");
        router.push("/dashboard/automation");
        return;
      }

      try {
        const response = await axios.post("/api/exchange-code", { code });
        const { accessToken } = response.data;

        // Store the access token securely (e.g., in an HTTP-only cookie)
        await axios.post("/api/store-token", { accessToken });

        // Redirect to the automation page
        router.push("/dashboard/automation");
      } catch (error) {
        console.error("Error exchanging code for token:", error);
        router.push("/dashboard/automation");
      }
    };

    exchangeCodeForToken();
  }, [router]);

  return <div>Loading...</div>;
}
