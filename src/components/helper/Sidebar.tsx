"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bot,
  HelpCircle,
  Home,
  Settings,
  User2,
  ChevronLeft,
  ChevronRight,
  Instagram,
  MessageCircle,
  Shield,
  FileText,
  Send,
  Lock,
  Zap,
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

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Automation",
      icon: Bot,
      href: "/dashboard/automation",
    },
    {
      title: "Messages",
      icon: MessageCircle,
      href: "/dashboard/messages",
    },
    {
      title: "Instagram",
      icon: Instagram,
      href: "/dashboard/instagram",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  // Footer links for legal pages
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
        "border-r transition-all duration-300 ease-in-out relative bg-white dark:bg-background fixed",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Background gradient similar to the privacy/terms pages */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/10 via-pink-300/5 to-transparent dark:from-purple-900/20 dark:via-pink-900/10 dark:to-transparent"></div>

      {/* Collapse toggle button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-3 top-20 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1 z-10 shadow-md",
          "transition-all duration-300 hover:scale-110"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
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
            <Link href="/">
              <Instagram className="h-8 w-8 text-purple-500" />
            </Link>
          ) : (
            <Link href="/">
              <div className="flex items-center gap-2">
                <Instagram className="h-8 w-8 text-purple-500" />

                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
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
                "text-xs uppercase font-semibold text-muted-foreground mb-2 transition-opacity duration-300",
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
                          "relative transition-all duration-300 ease-in-out",
                          "hover:bg-purple-500/10",
                          isCollapsed ? "justify-center px-2" : "px-3",
                          isActive
                            ? "bg-white dark:bg-background font-medium text-purple-500 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isActive ? "text-purple-500" : ""
                          )}
                        />
                        {!isCollapsed && <span>{item.title}</span>}
                        {isActive && (
                          <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-r-full" />
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
                    href="/help"
                    className={cn(
                      "flex items-center gap-3 rounded-lg py-2",
                      "transition-all duration-300 ease-in-out",
                      isCollapsed ? "justify-center px-2" : "px-3",
                      pathname === "/help"
                        ? "bg-white dark:bg-background font-medium text-purple-500 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10"
                    )}
                  >
                    <HelpCircle
                      className={cn(
                        "h-5 w-5",
                        pathname === "/help" ? "text-purple-500" : ""
                      )}
                    />
                    {!isCollapsed && <span>Help & Support</span>}
                    {pathname === "/help" && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-r-full" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t relative z-10">
        {/* Pro upgrade card similar to terms/privacy pages */}
        <div
          className={cn(
            "p-4 transition-all duration-300",
            isCollapsed ? "text-center" : ""
          )}
        >
          <div
            className={cn(
              "bg-white dark:bg-background rounded-xl p-4 shadow-sm border transition-all duration-300",
              isCollapsed ? "py-3 px-2" : ""
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-500" />
              {!isCollapsed && (
                <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                  Upgrade to Pro
                </h3>
              )}
            </div>

            {!isCollapsed && (
              <p className="text-xs text-muted-foreground mb-3">
                Unlock unlimited automations and premium features
              </p>
            )}

            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-none">
              {isCollapsed ? "⭐" : "Upgrade Now"}
            </Button>
          </div>

          {/* Legal links */}
          {!isCollapsed && (
            <div className="flex justify-between mt-4 px-2 text-xs text-muted-foreground">
              {legalLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="flex items-center gap-1 hover:text-purple-500 transition-colors"
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
