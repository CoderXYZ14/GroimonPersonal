"use client";

// import { usePathname } from "next/navigation";
import { User2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/helper/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  return (
    <nav
      className={cn(
        "sticky top-0 z-30 w-full border-b",
        "bg-white dark:bg-background",
        "px-4 sm:px-6 flex items-center justify-between h-16",
        "transition-all duration-300",
        "lg:w-[calc(100%-64px)] md:w-[calc(100%)] w-screen"
      )}
    >
      <div className="flex items-center relative z-10"></div>
      <div className="flex items-center gap-4 relative z-10">
        <ModeToggle />

        <Avatar className="h-8 w-8 cursor-pointer transition-all hover:scale-105">
          <AvatarImage src="/avatar-placeholder.png" alt="User profile" />
          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
            <User2 className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
