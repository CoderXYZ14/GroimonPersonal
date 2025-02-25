"use client";

import { usePathname } from "next/navigation";
import { Bot, HelpCircle, Home, Settings, User2 } from "lucide-react";

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
import clsx from "clsx"; // Ensure you have 'clsx' installed
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Home",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Automation",
      icon: Bot,
      href: "/dashboard/automation",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <div className="px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-primary"
          >
            DMPro
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-1 flex-col gap-4 py-4">
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 text-muted-foreground hover:text-foreground",
                        "relative transition-colors",
                        "hover:bg-muted/50",
                        isActive && "bg-muted/50 font-medium text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn("h-4 w-4", isActive && "text-primary")}
                      />
                      <span>{item.title}</span>
                      {isActive && (
                        <span className="absolute inset-y-0 left-0 w-1 bg-primary" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          <div className="mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary">
                      <User2 className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/help"
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Help</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="p-4 space-y-2">
          <div className="text-sm font-medium">Upgrade to Pro</div>
          <div className="text-xs text-muted-foreground">
            Unlock all features including AI and more
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 mt-2">
            Upgrade
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
