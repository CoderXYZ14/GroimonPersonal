"use client";

import { CreateAutomationForm } from "@/components/CreateAutomationForm";

export default function CreateAutomationPage() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Automation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set up automated responses for your Instagram DMs
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <CreateAutomationForm />
        </div>
      </div>
    </div>
  );
}
