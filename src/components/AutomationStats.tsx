"use client";

import { MessageCircle, Zap } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

export function AutomationStats() {
  const user = useAppSelector((state) => state.user);
  const hasInstagramAuth = user.instagramUsername && user.instagramId;
  const [redirectCount, setRedirectCount] = useState<number>(0);
  const [totalHits, setTotalHits] = useState<number>(0);
  const [automationsCount, setAutomationsCount] = useState<number>(0);
  const [profilePic, setProfilePic] = useState<string | null>(null);

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

    const fetchProfilePic = async () => {
      if (hasInstagramAuth) {
        try {
          const response = await axios.get(
            `/api/insta_details?userId=${user.instagramId}&accessToken=${user.instagramAccessToken}`
          );

          if (response.data && response.data.profilePic) {
            setProfilePic(response.data.profilePic);
          }
        } catch (error) {
          console.error("Error fetching Instagram profile picture:", {
            error,
            message: error.response?.data || error.message,
            userId: user.instagramId,
            hasToken: !!user.instagramAccessToken,
          });
        }
      }
    };

    fetchStats();
    fetchProfilePic();
  }, [user._id, user.instagramId, user.instagramAccessToken, hasInstagramAuth]);

  if (!hasInstagramAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-4">
        <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30">
          <div className="w-8 h-8 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            @
          </div>
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-800 shrink-0 flex items-center justify-center overflow-hidden">
            {profilePic ? (
              <Image
                src={profilePic}
                alt={`${user.instagramUsername}'s profile`}
                width={20}
                height={20}
                className="rounded-full w-5 h-5 object-cover"
                unoptimized={true}
              />
            ) : (
              <div className="w-5 h-5 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                @
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Instagram Username
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              @{user.instagramUsername}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800 shrink-0">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Automations
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {automationsCount}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-800 shrink-0">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-300" />
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Redirect Hits
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {redirectCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-800 shrink-0">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-300" />
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total DM Hits
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
