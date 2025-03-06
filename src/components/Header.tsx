import { Instagram } from "lucide-react";
import Link from "next/link";
import React from "react";

import NavbarSigninAvatar from "./helper/NavbarSigninAvatar";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
      <div className="container flex h-16 items-center justify-between max-w-7xl p-4">
        <Link href="/">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Instagram className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Groimon
            </h1>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-12">
          <Link
            href="/features"
            className="text-sm font-medium hover:text-purple-500 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium hover:text-purple-500 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-purple-500 transition-colors"
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
