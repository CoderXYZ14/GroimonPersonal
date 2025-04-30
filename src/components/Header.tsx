"use client";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import NavbarSigninAvatar from "./helper/NavbarSigninAvatar";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-white/90 dark:bg-gray-900 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg max-w-7xl mx-auto mt-4 px-6 md:px-10 py-4 rounded-2xl flex items-center justify-between">
        {/* Logo */}
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
          <span
            className="text-xl md:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] dark:text-white"
            style={{
              fontFamily: "'Outfit', 'Urbanist', 'Poppins', sans-serif",
              letterSpacing: "-0.5px",
            }}
          >
            Groimon
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-16 text-base font-medium">
          {/* <Link
            href="/features"
            className="group relative inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-transform duration-200 ease-in-out hover:scale-105"
          >
            <Flame className="w-5 h-5 text-sky-600 transition-transform group-hover:scale-110 group-hover:text-blue-700 dark:text-gray-300 dark:group-hover:text-blue-500" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 whitespace-nowrap transition-all duration-200 ease-in-out group-hover:from-sky-600 group-hover:to-blue-700 dark:group-hover:from-cyan-400 dark:group-hover:to-blue-500">
              Influencer Premier League
            </span>
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 bg-sky-500 transition-opacity dark:bg-sky-400" />
          </Link> */}
          <Link
            href="/dashboard/automation?type=post"
            className="group text-gray-800 dark:text-gray-200 transition-transform duration-200 ease-in-out hover:text-sky-600 hover:scale-105 dark:hover:text-sky-400"
          >
            Dashboard
          </Link>
          <Link
            href="/pricing"
            className="group text-gray-800 dark:text-gray-200 transition-transform duration-200 ease-in-out hover:text-sky-600 hover:scale-105 dark:hover:text-sky-400"
          >
            Pricing
          </Link>
          <Link
            href="/terms-of-service"
            className="group text-gray-800 dark:text-gray-200 transition-transform duration-200 ease-in-out hover:text-sky-600 hover:scale-105 dark:hover:text-sky-400"
          >
            Terms of Service
          </Link>
        </nav>

        {/* Desktop Auth & Theme */}
        <div className="hidden md:flex items-center gap-4">
          <NavbarSigninAvatar />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-900 dark:text-white transition-transform hover:scale-110" />
          ) : (
            <Menu className="w-6 h-6 text-gray-900 dark:text-white transition-transform hover:scale-110" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto px-6 py-4 space-y-3 bg-white/90 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 shadow-lg rounded-2xl backdrop-blur-lg mt-2 text-base font-medium">
          <Link
            href="/dashboard"
            className="block group text-gray-800 dark:text-gray-200 transition-transform duration-200 ease-in-out hover:text-sky-600 hover:scale-105 dark:hover:text-sky-400"
          >
            Dashboard
          </Link>
          <Link
            href="/pricing"
            className="block group text-gray-800 dark:text-gray-200 transition-transform duration-200 ease-in-out hover:text-sky-600 hover:scale-105 dark:hover:text-sky-400"
          >
            Pricing
          </Link>
          <Link
            href="/resources"
            className="block group text-gray-800 dark:text-gray-200 transition-transform duration-200 ease-in-out hover:text-sky-600 hover:scale-105 dark:hover:text-sky-400"
          >
            Resources
          </Link>
          <hr className="my-2 border-gray-200 dark:border-gray-700" />
          <NavbarSigninAvatar />
        </div>
      )}
    </header>
  );
};

export default Header;
