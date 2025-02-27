// components/AutomationStats.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface CreatorData {
  id: string;
  username: string;
}

export function AutomationStats() {
  const [creatorData, setCreatorData] = useState<CreatorData | null>(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const token = localStorage.getItem("instagram_token");
        if (!token) {
          console.error("No Instagram token found in localStorage");
          return;
        }

        const response = await axios.get(
          "https://f73b-2401-4900-86a7-8df3-3945-abe7-935b-8f0.ngrok-free.app/api/fetch-creator-data",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send token in header
            },
          }
        );

        console.log("Creator Data:", response.data);
      } catch (error) {
        console.error("Error fetching creator data:", error);
      }
    };

    fetchCreatorData();
  }, []);

  return (
    <div>
      {creatorData ? (
        <div>
          <h2>Creator Data</h2>
          <p>Username: {creatorData.username}</p>
          <p>ID: {creatorData.id}</p>
        </div>
      ) : (
        <p>Loading creator data...</p>
      )}
    </div>
  );
}
