"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useSession } from "next-auth/react";

export default function YourInstaToken() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // First useEffect to handle session loading
  useEffect(() => {
    if (session) {
      setSessionLoaded(true);
    }
  }, [session]);
  useEffect(() => {
    if (!sessionLoaded) return;
    //session.user
    const exchangeCodeForToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlParams.get("code");

      if (!authorizationCode) {
        toast.error("Authorization code not found in URL");
        router.push("/dashboard/automation");
        return;
      }
      const userId = session?.user?.id;
      try {
        const tokenResponse = await axios.post("/api/instagram_token", {
          code: authorizationCode,
          userId,
        });

        const { user, tokenData } = tokenResponse.data;
        console.log("User data:", user);
        console.log("Instagram token data:", tokenData);

        toast.success("Instagram details fetched successfully");

        // router.push("/dashboard/automation/create");
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
        // router.push("/dashboard/automation");
      } finally {
        setLoading(false);
      }
    };

    exchangeCodeForToken();
  }, [router, session, sessionLoaded]);

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
