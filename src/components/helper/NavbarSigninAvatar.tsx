"use client";
import React from "react";
import { ModeToggle } from "./mode-toggle";
import AvatarDropdown from "./AvatarDropdown";
import Link from "next/link";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";

const NavbarSigninAvatar = () => {
  const { data: session } = useSession();

  return (
    <div className="flex items-center gap-4">
      <ModeToggle />
      {session ? (
        <AvatarDropdown />
      ) : (
        <Link href="/signin">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white">
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
};

export default NavbarSigninAvatar;
