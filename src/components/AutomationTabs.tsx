"use client";

import { MessageCircle, Image, Play } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AutomationTable } from "@/components/AutomationTable";

export function AutomationTabs() {
  return (
    <Tabs defaultValue="post" className="w-full">
      {/* Tabs List */}
      <div className="px-4 pt-4 pb-0 sm:p-4 border-b border-gray-100 dark:border-gray-700 ">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 gap-1 bg-gray-100/80 dark:bg-gray-800/50 p-1 rounded-lg">
          <TabsTrigger
            value="post"
            className="flex items-center justify-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2"
          >
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Post</span>
          </TabsTrigger>
          <TabsTrigger
            value="story"
            className="flex items-center justify-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Story</span>
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="flex items-center justify-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tabs Content */}
      <TabsContent value="post" className="mt-0">
        <AutomationTable />
      </TabsContent>
      <TabsContent value="story" className="mt-0">
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 md:w-[766px]">
          <div className="py-12 ">
            <Play className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600 " />
            <h3 className="text-lg font-medium mb-2">Story Automation</h3>
            <p>Coming soon! We're working on bringing this feature to you.</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="chat" className="mt-0 w-full">
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 md:w-[766px]">
          <div className="py-12">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-2">Chat Automation</h3>
            <p>Coming soon! We're working on bringing this feature to you.</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
