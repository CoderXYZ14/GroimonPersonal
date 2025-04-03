"use client";

import { User2 } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

export function AutomationStats() {
  const user = useAppSelector((state) => state.user);
  const hasInstagramAuth = user.instagramUsername && user.instagramId;

  if (!hasInstagramAuth) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-800 shrink-0">
            <User2 className="w-5 h-5 text-purple-600 dark:text-purple-300" />
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
    </div>
  );
}
