"use client";

import { MessageCircle, Image, Play } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AutomationTable } from "@/components/AutomationTable";

export function AutomationTabs() {
  return (
    <Tabs defaultValue="post" className="w-full">
      {/* Tabs List */}
      <TabsList className="w-full sm:w-auto grid grid-cols-3 gap-1 bg-gray-100/80 dark:bg-gray-800/50 p-1 rounded-lg">
        <TabsTrigger
          value="post"
          className="flex items-center justify-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2"
        >
          <Image className="h-4 w-4" />
          <span>Post</span>
        </TabsTrigger>
        <TabsTrigger
          value="story"
          className="flex items-center justify-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2"
        >
          <Play className="h-4 w-4" />
          <span>Story</span>
        </TabsTrigger>
        <TabsTrigger
          value="chat"
          className="flex items-center justify-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Chat</span>
        </TabsTrigger>
      </TabsList>

      {/* Tabs Content */}
      <TabsContent value="post" className="mt-4 w-full">
        <AutomationTable />
      </TabsContent>
      <TabsContent value="story" className="mt-4 w-full">
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 w-full">
          Story automation is coming soon!
        </div>
      </TabsContent>
      <TabsContent value="chat" className="mt-4 w-full">
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 w-full">
          Chat automation is coming soon!
        </div>
      </TabsContent>
    </Tabs>
  );
}
