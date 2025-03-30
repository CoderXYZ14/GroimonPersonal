"use client";
import React from "react";
import { ModeToggle } from "./mode-toggle";
import AvatarDropdown from "./AvatarDropdown";
import Link from "next/link";
import { Button } from "../ui/button";
import { useAppSelector } from "@/redux/hooks";
// import { useSession } from "next-auth/react";

const NavbarSigninAvatar = () => {
  const user = useAppSelector((state) => state.user);

  return (
    <div className="flex items-center gap-6">
      <ModeToggle />
      {user.isAuthenticated ? (
        <AvatarDropdown />
      ) : (
        <Link href="/signin">
          <Button className="relative px-6 py-2 font-medium text-sm rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 dark:from-purple-400 dark:to-pink-400 dark:hover:from-purple-500 dark:hover:to-pink-500 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg">
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
};

export default NavbarSigninAvatar;
