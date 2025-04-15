import Link from "next/link";
import React from "react";

import NavbarSigninAvatar from "./helper/NavbarSigninAvatar";
import Image from "next/image";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-7xl px-4 mx-auto">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="logo"
              width={80}
              height={80}
              className="dark:invert h-[25px] w-auto"
            />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
              Groimon
            </h1>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            Features
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-purple-600 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform" />
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            Pricing
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-purple-600 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform" />
          </Link>
          <Link
            href="/dashboard/automation?type=post"
            className="text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 transition-opacity"
          >
            Dashboard
          </Link>
        </nav>

        <NavbarSigninAvatar />
      </div>
    </header>
  );
};

export default Header;
