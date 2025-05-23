import { Image as ImageIcon, Play } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AutomationTable } from "@/components/AutomationTable";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type AutomationType = "post" | "story";

const AUTOMATION_TABS = [
  {
    id: "post",
    label: "Post Automation",
    description: "Automate responses to Instagram posts",
    icon: <ImageIcon className="h-4 w-4" />,
    isActive: true,
    gradient: "from-[#1A69DD] to-[#26A5E9]",
    iconColor: "text-white",
  },
  {
    id: "story",
    label: "Story Automation",
    description: "Automate responses to Instagram stories",
    icon: <Play className="h-4 w-4" />,
    isActive: true,
    gradient: "from-[#1A69DD] to-[#26A5E9]",
    iconColor: "text-white",
  },
];

interface AutomationTabsProps {
  defaultType?: AutomationType;
}

export function AutomationTabs({ defaultType = "post" }: AutomationTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType =
    (searchParams.get("type") as AutomationType) || defaultType;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <Tabs value={currentType} onValueChange={handleTabChange}>
        {/* Header with glowing background */}
        <div className="sticky top-0 z-10 px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#1A69DD]/10 to-[#26A5E9]/10 blur-xl opacity-50" />

            <div className="relative flex flex-col space-y-4">
              <TabsList className="inline-flex p-1 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                {AUTOMATION_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`relative flex justify-start w-full text-left items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
    data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 
    data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700
    hover:bg-white/80 dark:hover:bg-gray-800/80`}
                  >
                    <div
                      className={`p-1 rounded-md bg-gradient-to-r ${tab.gradient}`}
                    >
                      {React.cloneElement(tab.icon, {
                        className: `h-4 w-4 ${tab.iconColor}`,
                      })}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </div>

        {/* Tab contents */}
        {["post", "story"].map((tabId) => (
          <TabsContent key={tabId} value={tabId} className="mt-0">
            <div className="p-6">
              <AutomationTable type={tabId} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
