"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bot,
  HelpCircle,
  Settings,
  User2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    // {
    //   title: "Dashboard",
    //   icon: Home,
    //   href: "/dashboard",
    // },
    {
      title: "Automation",
      icon: Bot,
      href: "/dashboard/automation?type=post",
    },
    // {
    //   title: "IPL Registration",
    //   icon: UserPlus,
    //   href: "/ipl-registration",
    //   isNew: true,
    // },
    // {
    //   title: "IPL Leaderboard",
    //   icon: Trophy,
    //   href: "/ipl-leaderboard",
    //   isNew: true,
    // },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  const legalLinks = [
    {
      title: "Privacy Policy",
      icon: Shield,
      href: "/privacy-policy",
    },
    {
      title: "Terms",
      icon: FileText,
      href: "/terms-of-service",
    },
  ];

  return (
    <Sidebar
      className={cn(
        "border-r border-border/40 transition-all duration-300 ease-in-out bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60",
        isCollapsed ? "w-20" : "w-64",
        "fixed"
      )}
    >
      <div className="absolute -right-3 top-20 z-50">
        <button
          onClick={toggleSidebar}
          className={cn(
            "bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] text-white rounded-full p-1.5",
            "shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-blue-400/20",
            "transition-all duration-300 hover:scale-110 active:scale-95",
            "ring-2 ring-background",
            "cursor-pointer",
            "relative",
            "w-7 h-7 flex items-center justify-center"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-cyan-300/5 to-transparent dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-transparent rounded-full"></div>

          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 pointer-events-none" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 pointer-events-none" />
          )}
        </button>
      </div>

      <SidebarHeader className="relative z-10">
        <div
          className={cn(
            "py-5 transition-all duration-300 flex items-center",
            isCollapsed ? "justify-center px-2" : "px-6"
          )}
        >
          {isCollapsed ? (
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Image
                src="/logo2.svg"
                alt="logo"
                width={60}
                height={60}
                className="h-[25px] w-auto"
              />
            </Link>
          ) : (
            <Link href="/" className="transition-opacity hover:opacity-80">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo2.svg"
                  alt="logo"
                  width={50}
                  height={25}
                  className=""
                />
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
                  Groimon
                </h1>
              </div>
            </Link>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="relative z-10">
        <div className="flex flex-1 flex-col gap-6 py-4">
          <div className="px-3">
            <h2
              className={cn(
                "text-xs uppercase font-medium text-muted-foreground/70 mb-2 transition-all duration-300",
                isCollapsed ? "opacity-0" : "opacity-100"
              )}
            >
              Main Menu
            </h2>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg py-2",
                          "relative transition-all duration-200",
                          "hover:bg-[#1A69DD]/10 dark:hover:bg-[#1A69DD]/20",
                          isCollapsed ? "justify-center px-2" : "px-3",
                          isActive
                            ? "bg-white/50 dark:bg-white/5 font-medium text-[#1A69DD] dark:text-[#26A5E9] shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isActive ? "text-[#1A69DD] dark:text-[#26A5E9]" : ""
                          )}
                        />
                        {!isCollapsed && (
                          <div className="flex items-center gap-2">
                            <span>{item.title}</span>
                          </div>
                        )}
                        {isActive && (
                          <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#1A69DD] to-[#26A5E9] rounded-r-full" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>

          <div className="px-3">
            <h2
              className={cn(
                "text-xs uppercase font-semibold text-muted-foreground mb-2 transition-opacity duration-300",
                isCollapsed ? "opacity-0" : "opacity-100"
              )}
            >
              Account
            </h2>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/profile"
                    className={cn(
                      "flex items-center gap-3 rounded-lg py-2",
                      "transition-all duration-300 ease-in-out",
                      isCollapsed ? "justify-center px-2" : "px-3",
                      pathname === "/profile"
                        ? "bg-white dark:bg-background font-medium text-[#1A69DD] shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-[#1A69DD]/10"
                    )}
                  >
                    <User2
                      className={cn(
                        "h-5 w-5",
                        pathname === "/profile" ? "text-[#1A69DD]" : ""
                      )}
                    />
                    {!isCollapsed && <span>Profile</span>}
                    {pathname === "/profile" && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] rounded-r-full" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/help"
                    className={cn(
                      "flex items-center gap-3 rounded-lg py-2",
                      "transition-all duration-300 ease-in-out",
                      isCollapsed ? "justify-center px-2" : "px-3",
                      pathname === "/help"
                        ? "bg-white dark:bg-background font-medium text-[#1A69DD] shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-[#1A69DD]/10"
                    )}
                  >
                    <HelpCircle
                      className={cn(
                        "h-5 w-5",
                        pathname === "/help" ? "text-[#1A69DD]" : ""
                      )}
                    />
                    {!isCollapsed && <span>Help & Support</span>}
                    {pathname === "/help" && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] rounded-r-full" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 relative z-10">
        <div
          className={cn(
            "p-4 transition-all duration-300",
            isCollapsed ? "text-center" : ""
          )}
        >
          {/* <div
            className={cn(
              "bg-white/50 dark:bg-white/5 rounded-xl p-4 shadow-sm border border-border/40",
              "backdrop-blur-sm supports-[backdrop-filter]:bg-background/60",
              isCollapsed ? "py-3 px-2" : ""
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-[#1A69DD] dark:text-[#26A5E9]" />
              {!isCollapsed && (
                <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1A69DD] to-[#26A5E9]">
                  Upgrade to Pro
                </h3>
              )}
            </div>

            {!isCollapsed && (
              <p className="text-xs text-muted-foreground mb-3">
                Unlock unlimited automations and premium features
              </p>
            )}
            <Link href="/pricing">
              <Button className="w-full bg-gradient-to-r from-[#1A69DD] to-[#26A5E9] hover:from-[#166dbd] hover:to-[#1e99c7] text-white border-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg">
                {isCollapsed ? "⭐" : "Upgrade Now"}
              </Button>
            </Link>
          </div> */}

          {!isCollapsed && (
            <div className="flex justify-between mt-4 px-2 text-xs text-muted-foreground">
              {legalLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="flex items-center gap-1 hover:text-[#1A69DD] dark:hover:text-[#26A5E9] transition-colors"
                >
                  <link.icon className="h-3 w-3" />
                  <span>{link.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
