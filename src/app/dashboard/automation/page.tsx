"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutomationStats } from "@/components/AutomationStats";
import { AutomationTabs } from "@/components/AutomationTabs";
import { AutomationTable } from "@/components/AutomationTable";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";

export default function AutomationPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [instagramToken, setInstagramToken] = useState<string | null>(null);

  // Use the exact values from your Python code
  // const appId = "1009455214362205";
  // const redirectUri =
  //   "https://f73b-2401-4900-86a7-8df3-3945-abe7-935b-8f0.ngrok-free.app/your_insta_token";

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const response = await axios.get("/api/check-auth");
  //       setIsLoggedIn(response.data.isLoggedIn);

  //       const storedToken = localStorage.getItem("instagram_token");
  //       if (storedToken) {
  //         setInstagramToken(storedToken);
  //       }
  //     } catch (error) {
  //       console.error("Error checking authentication status:", error);
  //     }
  //   };

  //   checkAuth();
  // }, []);

  const handleInstagramLogin = () => {
    const appId = "1009455214362205";
    const redirectUri = encodeURIComponent(
      "https://f73b-2401-4900-86a7-8df3-3945-abe7-935b-8f0.ngrok-free.app/your_insta_token"
    );

    const scope = [
      "instagram_business_basic",
      "instagram_business_content_publish",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_manage_insights",
    ]
      .join(",") // Ensure no newlines
      .replace(/,/g, "%2C"); // URL encode commas

    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

    console.log("Redirecting to Instagram OAuth:", authUrl);
    window.location.href = authUrl;
  };

  const handlePostAutomation = async () => {
    if (isLoggedIn && instagramToken) {
      router.push("/dashboard/automation/create");
    } else {
      handleInstagramLogin();
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <AutomationStats />
      <div className="flex items-center justify-between">
        <AutomationTabs />
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePostAutomation}
            variant="default"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post automation
          </Button>
        </div>
      </div>
      <AutomationTable />
    </div>
  );
}
