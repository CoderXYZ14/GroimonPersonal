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
  Lock,
  Zap,
  Trophy,
  UserPlus,
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
import { Button } from "@/components/ui/button";
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
    {
      title: "IPL Registration",
      icon: UserPlus,
      href: "/ipl-registration",
      isNew: true,
    },
    {
      title: "IPL Leaderboard",
      icon: Trophy,
      href: "/ipl-leaderboard",
      isNew: true,
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  const legalLinks = [
    {
      title: "Privacy Policy",
      icon: Lock,
      href: "/privacy-policy",
    },
    {
      title: "Terms of Service",
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/10 via-pink-300/5 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 dark:to-transparent"></div>

      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-3 top-20 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1.5 z-10",
          "shadow-lg hover:shadow-purple-500/25 dark:hover:shadow-purple-400/20",
          "transition-all duration-300 hover:scale-110 active:scale-95"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

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
                src="/logo.svg"
                alt="logo"
                width={80}
                height={80}
                className="dark:invert h-[25px] w-auto"
              />
            </Link>
          ) : (
            <Link href="/" className="transition-opacity hover:opacity-80">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={80}
                  height={25}
                  className="dark:invert"
                />
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
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
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg py-2",
                          "relative transition-all duration-200",
                          "hover:bg-purple-500/10 dark:hover:bg-purple-400/10",
                          isCollapsed ? "justify-center px-2" : "px-3",
                          isActive
                            ? "bg-white/50 dark:bg-white/5 font-medium text-purple-600 dark:text-purple-400 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isActive
                              ? "text-purple-600 dark:text-purple-400"
                              : ""
                          )}
                        />
                        {!isCollapsed && (
                          <div className="flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.isNew && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                        )}
                        {isActive && (
                          <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 rounded-r-full" />
                        )}
                        {isCollapsed && item.isNew && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
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
                        ? "bg-white dark:bg-background font-medium text-purple-500 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10"
                    )}
                  >
                    <User2
                      className={cn(
                        "h-5 w-5",
                        pathname === "/profile" ? "text-purple-500" : ""
                      )}
                    />
                    {!isCollapsed && <span>Profile</span>}
                    {pathname === "/profile" && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-r-full" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/terms-of-service"
                    className={cn(
                      "flex items-center gap-3 rounded-lg py-2",
                      "transition-all duration-300 ease-in-out",
                      isCollapsed ? "justify-center px-2" : "px-3",
                      pathname === "/terms-of-service"
                        ? "bg-white dark:bg-background font-medium text-purple-500 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10"
                    )}
                  >
                    <HelpCircle
                      className={cn(
                        "h-5 w-5",
                        pathname === "/terms-of-service"
                          ? "text-purple-500"
                          : ""
                      )}
                    />
                    {!isCollapsed && <span>Help & Support</span>}
                    {pathname === "/terms-of-service" && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-r-full" />
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
          <div
            className={cn(
              "bg-white/50 dark:bg-white/5 rounded-xl p-4 shadow-sm border border-border/40",
              "backdrop-blur-sm supports-[backdrop-filter]:bg-background/60",
              isCollapsed ? "py-3 px-2" : ""
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              {!isCollapsed && (
                <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
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
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 dark:from-purple-400 dark:to-pink-400 dark:hover:from-purple-500 dark:hover:to-pink-500 text-white border-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg">
                {isCollapsed ? "⭐" : "Upgrade Now"}
              </Button>
            </Link>
          </div>

          {!isCollapsed && (
            <div className="flex justify-between mt-4 px-2 text-xs text-muted-foreground">
              {legalLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="flex items-center gap-1 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
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
