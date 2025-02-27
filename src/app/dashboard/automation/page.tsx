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
  const appId = "3672122089745813";
  const redirectUri =
    "https://f73b-2401-4900-86a7-8df3-3945-abe7-935b-8f0.ngrok-free.app/your_insta_token";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/check-auth");
        setIsLoggedIn(response.data.isLoggedIn);

        const storedToken = localStorage.getItem("instagram_token");
        if (storedToken) {
          setInstagramToken(storedToken);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
      }
    };

    checkAuth();
  }, []);

  const handleInstagramLogin = () => {
    // This exactly matches the Python implementation
    let url = "https://www.instagram.com/oauth/authorize?";
    url = url + `client_id=${appId}`;
    url = url + `&redirect_uri=${redirectUri}`;
    url = url + "&response_type=code";
    url = url + "&scope=";

    // This exactly matches the Python code's scope format with the replace operation
    const scope =
      "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments";

    // This duplicates the Python replace operation in JavaScript
    const formattedScope = scope.replace(/,/g, "%2C");
    console.log(formattedScope);
    // const authUrl = url + formattedScope;

    // window.location.href = authUrl;
  };

  const handlePostAutomation = async () => {
    if (isLoggedIn && instagramToken) {
      router.push("/dashboard/automation/create");
    } else {
      handleInstagramLogin();
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get("/api/logout");
      localStorage.removeItem("instagram_token");
      setInstagramToken(null);
      setIsLoggedIn(false);
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <AutomationStats />
      <div className="flex items-center justify-between">
        <AutomationTabs />
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button
                onClick={handlePostAutomation}
                variant="default"
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Post automation
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={handleInstagramLogin}
              variant="default"
              className="bg-primary hover:bg-primary/90"
            >
              Login with Instagram
            </Button>
          )}
        </div>
      </div>
      <AutomationTable />
    </div>
  );
}
