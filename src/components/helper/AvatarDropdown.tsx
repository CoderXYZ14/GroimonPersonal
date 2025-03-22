"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";

interface UserDetails {
  name?: string;
  email?: string;
  image?: string;
  provider?: string;
  instagramUsername?: string;
}

const AvatarDropdown = () => {
  const { data: session } = useSession();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const details = localStorage.getItem("user_details");
    if (details) {
      setUserDetails(JSON.parse(details));
    }
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem("nextauth.message");
    localStorage.removeItem("user_details");
    localStorage.removeItem("instagram_token");

    if (session) {
      await signOut({ callbackUrl: "/" });
    } else {
      window.location.href = "/";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 cursor-pointer ring-offset-background transition-all duration-300 hover:scale-105 hover:shadow-md">
          <AvatarImage
            src={session?.user?.image || userDetails?.image || ""}
            className="object-cover"
            loading="lazy"
          />
          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 text-white animate-in zoom-in">
            {session?.user?.name?.charAt(0) ||
              (userDetails?.name
                ? userDetails.name.charAt(0).toUpperCase()
                : userDetails?.provider === "instagram"
                ? "I"
                : "U")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 mt-2 p-2 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border border-border/40 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-200"
      >
        <div className="px-2 py-2 mb-2 border-b border-border/40">
          <p className="text-sm font-medium text-foreground">
            {session?.user?.name ||
              userDetails?.name ||
              (userDetails?.provider === "instagram"
                ? userDetails.instagramUsername
                : "Guest")}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {session?.user?.email ||
              userDetails?.email ||
              (userDetails?.provider === "instagram"
                ? "Complete your profile"
                : "Guest User")}
          </p>
        </div>

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-sm text-foreground hover:text-foreground/90 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors">
          <div className="flex-1">Profile</div>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-sm text-foreground hover:text-foreground/90 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors">
          <div className="flex-1">Settings</div>
        </DropdownMenuItem>

        <div className="h-px bg-border/40 my-2" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 cursor-pointer text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-2 rounded-md hover:bg-red-50/50 dark:hover:bg-red-950/50 transition-colors"
        >
          <div className="flex-1">Logout</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarDropdown;
