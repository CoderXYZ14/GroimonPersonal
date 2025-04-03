"use client";
import React from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { clearUser } from "@/redux/features/userSlice";

const AvatarDropdown = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const handleSignOut = async () => {
    // Clear localStorage items
    localStorage.removeItem("instagram_token");
    localStorage.removeItem("user_details");

    // Clear cookies
    document.cookie =
      "user_details=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "redirectTo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    dispatch(clearUser());

    // Clear Redux persist state
    if (typeof window !== "undefined") {
      localStorage.removeItem("persist:root");
    }

    window.location.href = "/";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 cursor-pointer ring-offset-background transition-all duration-300 hover:scale-105 hover:shadow-md">
          {/* <AvatarImage
            src={user.image || ""}
            className="object-cover"
            loading="lazy"
          /> */}
          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 text-white animate-in zoom-in">
            {user.instagramUsername
              ? user.instagramUsername.charAt(0).toUpperCase()
              : "I"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 mt-2 p-2 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border border-border/40 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-200"
      >
        <div className="px-2 py-2 mb-2 border-b border-border/40">
          <p className="text-sm font-medium text-foreground">
            {user.instagramUsername || "Instagram User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            Connected via Instagram
          </p>
        </div>

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-sm text-foreground hover:text-foreground/90 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors">
          <div className="flex-1">Instagram Profile</div>
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
