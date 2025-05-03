"use client";
import { CreateStoryAutomationForm } from "@/components/CreateStoryForm";

export default function CreateAutomationPage() {
  return (
    <div className="w-full bg-gradient-to-b from-white to-[#F9FBFF] dark:from-[#090E1A] dark:to-[#0A142E]">
      <div className="w-full absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1A69DD]/10 via-[#26A5E9]/5 to-transparent dark:from-[#166dbd]/20 dark:via-[#1e99c7]/10 dark:to-transparent"></div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all">
        <div className="flex flex-col space-y-6">
          <div className="pb-2 border-b border-border">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
              Create Story Automation
            </h2>
          </div>
          <div className="bg-white dark:bg-[#0F172A] rounded-lg shadow-md border border-border overflow-hidden">
            <CreateStoryAutomationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
