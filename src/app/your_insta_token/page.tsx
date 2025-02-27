// app/your_insta_token/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function YourInstaToken() {
  const [message, setMessage] = useState<string>(
    "Processing your authorization..."
  );
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const getToken = async () => {
      try {
        // Get code from URL params - this exactly mirrors the Python code
        const code = searchParams.get("code") + "_";

        if (!code) {
          setMessage("Error: Authorization code not found");
          return;
        }

        // Make the token exchange request to Instagram API
        const url = "https://api.instagram.com/oauth/access_token";

        // This exactly mirrors the Python payload structure
        const payload = {
          client_id: "3672122089745813",
          client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET || "", // This should be securely stored
          grant_type: "authorization_code",
          redirect_uri:
            "https://f73b-2401-4900-86a7-8df3-3945-abe7-935b-8f0.ngrok-free.app/your_insta_token",
          code: code,
        };

        // Using FormData to match the Python requests format
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, value);
        });

        const response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Process the response like the Python code
        const data = response.data;
        const accessToken = data.access_token;

        if (accessToken) {
          // Store the token
          localStorage.setItem("instagram_token", accessToken);
          setToken(accessToken.substring(0, 5) + "...");
          setMessage(
            `Hello, User! Your token is: ${accessToken.substring(0, 5) + "..."}`
          );

          // Redirect after a delay
          setTimeout(() => {
            router.push("/dashboard/automation");
          }, 3000);
        } else {
          setMessage("Failed to retrieve access token");
        }
      } catch (error) {
        console.error("Error exchanging code for token:", error);
        setMessage("Error during token exchange. Please try again.");
      }
    };

    getToken();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Instagram Authentication</h1>
        <p className="mb-4">{message}</p>
        {token && (
          <p className="text-sm text-gray-500">
            Redirecting you back to the dashboard...
          </p>
        )}
      </div>
    </div>
  );
}
