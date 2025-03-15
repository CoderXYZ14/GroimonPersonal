import { cn } from "@/lib/utils";
import NavbarSigninAvatar from "./helper/NavbarSigninAvatar";

export function Navbar() {
  return (
    <nav
      className={cn(
        "sticky top-0 z-30 w-full border-b",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "px-4 sm:px-6 flex h-14 items-center justify-between",
        "transition-all duration-300",
        "lg:w-[calc(100%-64px)] md:w-[calc(100%)] w-screen"
      )}
    >
      <div className="flex items-center relative z-10" />
      <div className="flex items-center gap-4">
        <NavbarSigninAvatar />
      </div>
    </nav>
  );
}
