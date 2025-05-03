"use client";

import { MessageCircle, Users, Link2, Plug2 } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export function AutomationStats() {
  const user = useAppSelector((state) => state.user);
  const hasInstagramAuth = user.instagramUsername && user.instagramId;
  const [redirectCount, setRedirectCount] = useState<number>(0);
  const [totalHits, setTotalHits] = useState<number>(0);
  const [automationsCount, setAutomationsCount] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (user._id) {
        try {
          const [hitsResponse, automationsResponsePost] = await Promise.all([
            axios.get(
              `/api/automations?userId=${user._id}&redirectCount=true&`
            ),
            axios.get(`/api/automations?userId=${user._id}`),
          ]);

          const automationsResponseStory = await axios.get(
            `/api/automations/stories?userId=${user._id}`
          );
          setTotalHits(hitsResponse.data.totalRedirectHits);
          setRedirectCount(hitsResponse.data.totalHits);
          setAutomationsCount(
            automationsResponsePost.data.length +
              automationsResponseStory.data.length
          );
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      }
    };

    fetchStats();
  }, [user._id]);

  if (!hasInstagramAuth) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-[#1A69DD]/10 to-[#26A5E9]/10 border border-border space-y-4"
      >
        <div className="p-3 rounded-full bg-[#1A69DD]/10 animate-pulse">
          <div className="w-8 h-8 text-[#1A69DD] flex items-center justify-center">
            <Plug2 className="w-6 h-6" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[#1A294D] dark:text-white">
            Connect Instagram
          </h3>
          <p className="text-muted-foreground mt-1">
            Connect your Instagram account to Unlock Automation Superpowers
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-white/80 dark:bg-[#0F172A] rounded-xl p-4 shadow-sm border border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 shrink-0 border border-indigo-300 dark:border-indigo-800">
            <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Automations
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {automationsCount}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-[#0F172A] rounded-xl p-4 shadow-sm border border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0 border border-blue-300 dark:border-blue-800">
            <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Link Clicks
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {redirectCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* <div className="bg-white/80 dark:bg-[#0F172A] rounded-xl p-4 shadow-sm border border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-sky-100 dark:bg-sky-900/30 shrink-0 border border-sky-300 dark:border-sky-800">
            <UserPlus className="w-5 h-5 text-sky-600 dark:text-sky-300" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Followers Gained
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {totalHits.toLocaleString()}
            </p>
          </div>
        </div>
      </div> */}

      <div className="bg-white/80 dark:bg-[#0F172A] rounded-xl p-4 shadow-sm border border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 shrink-0 border border-green-300 dark:border-green-800">
            <Users className="w-5 h-5 text-green-600 dark:text-green-300" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Contacts
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {totalHits.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
