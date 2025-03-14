"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutomationStats } from "@/components/AutomationStats";
import { AutomationTabs } from "@/components/AutomationTabs";
import { useRouter } from "next/navigation";
import handleInstagramLogin from "@/hooks/handleInstagramLogin";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AutomationPage() {
  const router = useRouter();
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [instagramToken, setInstagramToken] = useState(null);
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user) {
      localStorage.setItem("session_data", JSON.stringify(session.user));
    }
  }, [session]);
  const handlePostAutomation = async () => {
    const storedToken = localStorage.getItem("instagram_token");

    if (storedToken) {
      router.push("/dashboard/automation/create");
    } else {
      handleInstagramLogin("/dashboard/automation/create");
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/10 via-pink-300/5 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 dark:to-transparent"></div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Post automation
            </h2>
            <Button
              onClick={handlePostAutomation}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Automation
            </Button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 w-[321px] sm:w-[100%] ">
            <div className="p-4 sm:p-6">
              <AutomationStats />
            </div>
          </div>

          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <AutomationTabs />
          </div>
        </div>
      </div>
    </div>
  );
}
