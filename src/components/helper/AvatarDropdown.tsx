"use client";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";

const AvatarDropdown = () => {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    localStorage.removeItem("nextauth.message");
    localStorage.removeItem("session_data");
    localStorage.removeItem("instagram_user_id");
    localStorage.removeItem("instagram_username");
    localStorage.removeItem("instagram_token");

    await signOut({ callbackUrl: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback>
            {session?.user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-background border border-gray-200 rounded-lg shadow-lg">
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-sm text-gray-700 hover:bg-gray-100 p-2"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarDropdown;
