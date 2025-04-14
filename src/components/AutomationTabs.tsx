import { MessageCircle, Image as ImageIcon, Play } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AutomationTable } from "@/components/AutomationTable";
import React from "react";

const AUTOMATION_TABS = [
  {
    id: "post",
    label: "Post",
    description: "Automate responses to Instagram posts",
    icon: <ImageIcon className="h-3.5 w-3.5" />,
    isActive: true,
  },
  {
    id: "story",
    label: "Story",
    description: "Automate responses to Instagram stories",
    icon: <Play className="h-3.5 w-3.5" />,
    isActive: true,
  },
  {
    id: "dm",
    label: "DM",
    description: "Automate Instagram direct message responses",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    comingSoon: true,
    gradient: "from-blue-600/20 to-purple-600/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
];

export function AutomationTabs() {
  return (
    <Tabs defaultValue="post" className="w-full">
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <TabsList className="inline-flex p-1 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
          {AUTOMATION_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200
                data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 
                data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                hover:bg-white/80 dark:hover:bg-gray-800/80"
            >
              {tab.icon}
              <span className="text-xs font-medium">{tab.label}</span>
              {tab.comingSoon && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 text-[8px] text-white items-center justify-center">
                    ✨
                  </span>
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {["post", "story"].map((tabId) => (
        <TabsContent key={tabId} value={tabId} className="mt-0">
          <div className="p-4">
            <AutomationTable type={tabId} />
          </div>
        </TabsContent>
      ))}

      <TabsContent value="dm" className="mt-0">
        <div className="flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="relative inline-block">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur opacity-75" />
              <div className="relative bg-white dark:bg-gray-800 rounded-full p-3 backdrop-blur-xl">
                <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <h3 className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                DM Automation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automate Instagram direct message responses
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coming soon! We&apos;re working on this feature.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400">
                <span>✨</span>
                <span>In Development</span>
                <span>✨</span>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
