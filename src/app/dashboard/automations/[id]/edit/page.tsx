"use client";

import { useEffect, useState } from "react";
import { EditAutomationForm } from "@/components/EditAutomationForm";
import { useParams } from "next/navigation";
import { IAutomation } from "@/models/Automation";
import axios from "axios";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function EditAutomationPage() {
  const params = useParams();
  const [automation, setAutomation] = useState<IAutomation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAutomation = async () => {
      try {
        const { data } = await axios.get(`/api/automations?id=${params.id}`);
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
      <div className="bg-[#F9FBFF] dark:bg-[#090E1A] min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A69DD]/10 via-[#26A5E9]/10 to-transparent dark:from-[#166dbd]/20 dark:via-[#1e99c7]/20 dark:to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded w-1/4 mb-4" />
              <div className="h-4 bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded w-1/2" />
            </div>
            <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded w-1/3" />
                <div className="h-4 bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded w-1/4" />
                <div className="h-4 bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !automation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#1A69DD]/5 dark:from-gray-900 dark:to-[#26A5E9]/10"
      >
        <div className="max-w-md p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="inline-flex flex-col items-center space-y-4"
          >
            <div className="p-4 bg-red-100/80 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 animate-pulse" />
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              {error ? "Error Occurred" : "Not Found"}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {error || "The requested automation could not be found"}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] text-white rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all"
              onClick={() => window.location.reload()} // Optional refresh action
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </motion.button>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 px-4 py-2 bg-[#1A69DD]/5 dark:bg-[#26A5E9]/10 rounded-md">
              If the problem persists, contact our support team
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F9FBFF] dark:bg-[#090E1A]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/5 w-64 h-64 bg-[#1A69DD]/10 dark:bg-[#166dbd]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/5 w-64 h-64 bg-[#26A5E9]/10 dark:bg-[#1e99c7]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="pb-4 mb-6 border-b border-border">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] dark:from-[#1e99c7] dark:to-[#166dbd]">
            Edit Post Automation
          </h2>
        </div>

        {/* Form Container */}
        {/* <div className="bg-white dark:bg-[#0F172A] rounded-xl shadow-lg border border-border"> */}
        {/* <div className="p-6 sm:p-8 lg:p-10"> */}
        <EditAutomationForm automation={automation} />
        {/* </div> */}
        {/* </div> */}
      </div>
    </div>
  );
}
