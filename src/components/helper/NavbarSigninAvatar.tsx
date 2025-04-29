"use client";
import React from "react";
import { ModeToggle } from "./mode-toggle";
import AvatarDropdown from "./AvatarDropdown";
import Link from "next/link";
import { Button } from "../ui/button";
import { useAppSelector } from "@/redux/hooks";

const NavbarSigninAvatar = () => {
  const user = useAppSelector((state) => state.user);

  return (
    <div className="flex items-center gap-6">
      <ModeToggle />
      {user.isAuthenticated ? (
        <AvatarDropdown />
      ) : (
        <Link href="/signin">
          <Button
            className="
              relative rounded-full px-6 py-2 text-sm font-semibold text-white
              bg-[rgb(26,105,221)]
              hover:bg-[rgb(22,95,200)]
              focus:outline-none focus:ring-2 focus:ring-blue-400
              transition-all duration-300 ease-in-out
              shadow-md hover:shadow-lg
              hover:scale-105 active:scale-95
              dark:bg-[rgb(26,105,221)] dark:hover:bg-[rgb(22,95,200)]
              dark:focus:ring-blue-400 dark:text-white
            "
          >
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
};

export default NavbarSigninAvatar;
