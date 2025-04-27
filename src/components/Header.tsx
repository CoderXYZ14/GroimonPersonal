"use client";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { Menu, X, Flame } from "lucide-react";
import NavbarSigninAvatar from "./helper/NavbarSigninAvatar";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-white/70 backdrop-blur-md border border-gray-200 shadow-sm max-w-7xl mx-auto mt-4 px-6 md:px-10 py-4 rounded-2xl flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.svg"
            alt="Groimon Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-xl font-semibold tracking-tight text-blue-600">
            Groimon
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium">
          <Link
            href="/ipl-registration"
            className="relative group inline-flex items-center gap-2 px-2 py-1 rounded-lg transition duration-200 ease-in-out"
          >
            <Flame className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-base font-semibold group-hover:underline decoration-2 underline-offset-4 whitespace-nowrap">
              Influencer Premier League
            </span>
            <span className="absolute -inset-0.5 bg-indigo-500 opacity-0 blur-md group-hover:opacity-20 rounded-xl transition duration-300" />
          </Link>
          <Link href="/pricing" className="hover:text-blue-600 transition">
            Pricing
          </Link>
          <Link href="/settings" className="hover:text-blue-600 transition">
            Settings
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <NavbarSigninAvatar />
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden focus:outline-none"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-800" />
          ) : (
            <Menu className="w-6 h-6 text-gray-800" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto px-6 py-4 space-y-3 bg-white/70 backdrop-blur-md mt-2 rounded-xl shadow-sm text-sm font-medium">
          <Link
            href="/dashboard/automation?type=post"
            className="block hover:text-blue-600"
          >
            Dashboard
          </Link>
          <Link href="/pricing" className="block hover:text-blue-600">
            Pricing
          </Link>
          <Link href="/settings" className="block hover:text-blue-600">
            Settings
          </Link>
          <hr className="my-2 border-gray-200" />
          <NavbarSigninAvatar />
        </div>
      )}
    </header>
  );
};

export default Header;
