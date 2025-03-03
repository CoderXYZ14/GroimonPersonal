"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutomationStats } from "@/components/AutomationStats";
import { AutomationTabs } from "@/components/AutomationTabs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { scope } from "@/constants/constants";

export default function AutomationPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [instagramToken, setInstagramToken] = useState(null);

  const handleInstagramLogin = () => {
    const appId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URLL}/your_insta_token`
    );
    console.log("redirectUri", redirectUri);
    const instaScope = scope.join(",").replace(/,/g, "%2C");

    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${instaScope}`;
    console.log("authUrl", authUrl);
    window.location.href = authUrl;
  };

  const handlePostAutomation = async () => {
    const storedToken = localStorage.getItem("instagram_token");
    if (storedToken) {
      router.push("/dashboard/automation/create");
    } else {
      handleInstagramLogin();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Full-width background */}
      <div className="w-full absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/10 via-pink-300/5 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 dark:to-transparent"></div>

      {/* Workspace container */}
      <div className="relative w-full lg:w-[calc(100%-64px)] ml-0 lg:ml-16 p-4 md:p-6">
        <div className="flex flex-col space-y-6 max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 w-full">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Post automation
            </h2>
            <Button
              onClick={handlePostAutomation}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Automation
            </Button>
          </div>

          {/* Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 w-full">
            <div className="p-4">
              <AutomationStats />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
