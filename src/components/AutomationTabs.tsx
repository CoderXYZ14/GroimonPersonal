"use client";

import { MessageCircle, Image, Play } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AutomationTabs() {
  return (
    <Tabs defaultValue="post">
      <TabsList>
        <TabsTrigger value="post" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Post
        </TabsTrigger>
        <TabsTrigger value="story" className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Story
        </TabsTrigger>
        <TabsTrigger value="chat" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
