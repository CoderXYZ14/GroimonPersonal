import { cn } from "@/lib/utils";

import NavbarSigninAvatar from "./helper/NavbarSigninAvatar";

export function Navbar() {
  return (
    <nav
      className={cn(
        "sticky top-0 z-30 w-full border-b",
        "bg-white dark:bg-background",
        "px-4 sm:px-6 flex items-center justify-between h-16",
        "transition-all duration-300",
        "lg:w-[calc(100%-64px)] md:w-[calc(100%)] w-screen"
      )}
    >
      <div className="flex items-center relative z-10"></div>
      <NavbarSigninAvatar />
    </nav>
  );
}
