"use client";

import { CreateAutomationForm } from "@/components/CreateAutomationForm";

export default function CreateAutomationPage() {
  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/10 via-pink-300/5 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 dark:to-transparent"></div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="pb-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Create Automation
            </h2>
            <p className="text-muted-foreground mt-2 sm:mt-0">
              Set up automated responses for your Instagram DMs to boost
              engagement
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <CreateAutomationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
