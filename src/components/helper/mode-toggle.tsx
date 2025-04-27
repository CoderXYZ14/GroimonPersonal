"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 h-10 flex items-center justify-center bg-transparent rounded-full"
    >
      {/* Sun animation for light mode */}
      <Sun
        className={`absolute h-6 w-6 text-[#D6A700] transition-all duration-500 ease-in-out transform 
          ${
            theme === "light"
              ? "rotate-0 scale-100 translate-x-0"
              : "rotate-180 scale-0 translate-x-[40px]"
          }
        `}
      />
      {/* Moon animation for dark mode */}
      <Moon
        className={`absolute h-6 w-6 text-[#A7A7A7] transition-all duration-500 ease-in-out transform 
          ${
            theme === "dark"
              ? "rotate-0 scale-100 translate-x-0"
              : "rotate-180 scale-0 translate-x-[-40px]"
          }
        `}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
