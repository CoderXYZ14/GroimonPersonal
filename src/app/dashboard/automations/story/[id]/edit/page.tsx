"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import axios from "axios";
import { EditStoryForm } from "@/components/EditStoryForm";

export default function EditAutomationPage() {
  const params = useParams();
  const [automation, setAutomation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAutomation = async () => {
      try {
        const { data } = await axios.get(
          `/api/automations/stories?id=${params.id}`
        );
        setAutomation(data);
      } catch (err) {
        setError("Failed to load automation");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAutomation();
  }, [params.id]);

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !automation) {
    return (
      <div className="w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "Automation not found"}</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full  absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/10 via-pink-300/5 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 dark:to-transparent"></div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all">
        <div className="flex flex-col space-y-6">
          <div className="pb-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Edit Automation
            </h2>
            <p className="text-muted-foreground mt-2 sm:mt-0">
              Update your Instagram DM automation settings
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden ">
            <EditStoryForm story={automation} />
          </div>
        </div>
      </div>
    </div>
  );
}
