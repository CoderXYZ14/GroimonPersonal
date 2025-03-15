"use client";

import { useEffect, useState } from "react";
import { User2, Loader2 } from "lucide-react";

export function AutomationStats() {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("authenticated");
  const [userData, setUserData] = useState<{
    instagramUsername?: string;
    instagramId?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const userDetailStr = localStorage.getItem("user_details");
      if (!userDetailStr) {
        setStatus("authenticated");
        return;
      }

      const userDetail = JSON.parse(userDetailStr);
      setUserData({
        instagramUsername: userDetail?.instagramUsername,
        instagramId: userDetail?.instagramId,
      });

      if (!userDetail?.instagramUsername || !userDetail?.instagramId) {
        setStatus("authenticated");
        return;
      }

      setStatus("authenticated");
    } catch (error) {
      console.error("Error reading user details:", error);
      setStatus("unauthenticated");
    }
  }, []);

  const renderContent = {
    loading: (
      <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading creator data...</span>
      </div>
    ),
    unauthenticated: (
      <div className="flex flex-col items-center justify-center h-40 space-y-4">
        <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30">
          <User2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300">
            Instagram Account Required
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Connect your Instagram account to get started
          </p>
        </div>
      </div>
    ),
    authenticated: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-800 shrink-0">
              <User2 className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Username
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {userData?.instagramUsername || "Not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800 shrink-0">
              <User2 className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Account ID
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {userData?.instagramId || "NA"}
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return <div className="w-full">{renderContent[status]}</div>;
}
