"use client";
import { CreateAutomationForm } from "@/components/CreateAutomationForm";

export default function CreateAutomationPage() {
  return (
    <div className="w-full min-h-screen bg-[#F9FBFF] dark:bg-[#090E1A]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/5 w-64 h-64 bg-[#1A69DD]/10 dark:bg-[#166dbd]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/5 w-64 h-64 bg-[#26A5E9]/10 dark:bg-[#1e99c7]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="pb-4 mb-6 border-b border-border">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
            Create Post Automation
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl shadow-lg border border-border">
          <div className="p-6 sm:p-8 lg:p-10">
            <CreateAutomationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
