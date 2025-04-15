"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutomationStats } from "@/components/AutomationStats";
import { AutomationTabs, AutomationType } from "@/components/AutomationTabs";
import Link from "next/link";
import { Suspense } from "react";

// Create a client component that uses useSearchParams
import { useSearchParams } from "next/navigation";

function AutomationContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as AutomationType) || "post";

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600">
            Post Automation
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Streamline your social media presence with automated posting
          </p>
        </div>

        <Link
          href={
            type === "story"
              ? "/dashboard/automation/story/create"
              : "/dashboard/automation/create"
          }
        >
          <Button className="mt-4 sm:mt-0 relative group overflow-hidden rounded-full px-6 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 whitespace-nowrap">
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </span>
          </Button>
        </Link>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-500/5 border border-purple-100/20 dark:border-purple-900/20">
        <div className="p-6">
          <AutomationStats />
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-500/5 border border-purple-100/20 dark:border-purple-900/20 overflow-hidden">
        <AutomationTabs defaultType={type} />
      </div>
    </>
  );
}

export default function AutomationPage() {
  return (
    <div className="bg-[#fafafa] dark:bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 dark:from-purple-900/20 dark:via-gray-900 dark:to-blue-900/20 pointer-events-none" />

      <div className="absolute inset-0 bg-[url('/mesh-gradient.png')] opacity-30 mix-blend-soft-light pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Suspense
            fallback={
              <div className="p-4">Loading automation dashboard...</div>
            }
          >
            <AutomationContent />
          </Suspense>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed -bottom-48 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -top-48 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
