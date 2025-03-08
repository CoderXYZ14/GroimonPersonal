"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface CreatorData {
  id: string;
  username: string;
}

export function AutomationStats() {
  const [creatorData, setCreatorData] = useState<CreatorData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const token = localStorage.getItem("instagram_token");
        if (!token) {
          setIsLoggedIn(false);
          console.log("No Instagram token found in localStorage");
          return;
        }

        setIsLoggedIn(true);

        const response = await axios.get("/api/fetch-creator-data", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Creator Data:", response.data);
        setCreatorData(response.data);
      } catch (error) {
        console.error("Error fetching creator data:", error);
        setIsLoggedIn(false); // In case of error, consider the user not logged in.
      }
    };

    fetchCreatorData();
  }, []);

  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-t-purple-500 border-b-purple-300 border-l-purple-300 border-r-purple-300 rounded-full animate-spin mb-3"></div>
          Loading...
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">
            Please log in
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {creatorData ? (
        <div className="flex flex-col sm:flex-row gap-4 p-2">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 flex-1">
            <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">
              Creator Data
            </h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Username:
                </span>
                <span className="font-medium">
                  {creatorData.username || "Coderxyz"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">ID:</span>
                <span className="font-medium">{creatorData.id}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-6 text-gray-500 dark:text-gray-400">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-t-purple-500 border-b-purple-300 border-l-purple-300 border-r-purple-300 rounded-full animate-spin mb-3"></div>
            Loading creator data...
          </div>
        </div>
      )}
    </div>
  );
}
