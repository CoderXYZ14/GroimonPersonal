"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navbar() {
  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50  border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <SidebarTrigger className="mr-4 md:hidden">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button
            className="bg-primary hover:bg-primary/90 hidden md:flex"
            size="sm"
          >
            Create Automation
          </Button>

          <Button
            className="bg-primary hover:bg-primary/90 md:hidden"
            size="sm"
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <img
              src="/placeholder.svg?height=32&width=32"
              alt="Avatar"
              className="rounded-full"
              height={32}
              width={32}
            />
          </Button>
        </div>
      </div>
    </header>
  );
}

//comments
