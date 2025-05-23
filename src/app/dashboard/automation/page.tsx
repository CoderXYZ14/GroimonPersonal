"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutomationStats } from "@/components/AutomationStats";
import { AutomationTabs, AutomationType } from "@/components/AutomationTabs";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AutomationContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as AutomationType) || "post";

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
            {type === "story" ? "Story Automation" : "Post Automation"}
          </h1>
        </div>

        <Link
          href={
            type === "story"
              ? "/dashboard/automation/story/create"
              : "/dashboard/automation/create"
          }
        >
          <Button
            className={`
              group relative overflow-hidden h-12 px-6 rounded-lg
              bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]
              shadow-lg transition-transform duration-300 ease-out
              hover:scale-105 hover:-translate-y-1
              hover:shadow-2xl hover:shadow-[#1A69DD]/40
            `}
          >
            <span
              className={`
                absolute -left-16 top-0 h-full w-16 bg-white opacity-10
                transform -skew-x-12 transition-all duration-300 ease-out
                group-hover:translate-x-56
              `}
            />

            <Plus className="relative z-10 h-8 w-8 mr-2 font-bold stroke-[4]" />
            <span className="relative z-10 text-lg font-bold">
              Create Automation
            </span>
          </Button>
        </Link>
      </div>

      <div className="bg-white/80 dark:bg-[#0F172A] backdrop-blur-xl rounded-2xl shadow-xl border border-border">
        <div className="p-6">
          <AutomationStats />
        </div>
      </div>

      <div className="bg-white/80 dark:bg-[#0F172A] backdrop-blur-xl rounded-2xl shadow-xl border border-border overflow-hidden">
        <AutomationTabs defaultType={type} />
      </div>
    </>
  );
}

export default function AutomationPage() {
  return (
    <div className="bg-[#F9FBFF] dark:bg-[#090E1A] min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/5 w-64 h-64 bg-[#1A69DD]/10 dark:bg-[#166dbd]/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/5 w-64 h-64 bg-[#26A5E9]/10 dark:bg-[#1e99c7]/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A69DD]"></div>
              </div>
            }
          >
            <AutomationContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
