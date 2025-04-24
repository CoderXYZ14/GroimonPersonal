"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Button
              variant="ghost"
              className="mr-2 font-bold"
              onClick={() => router.push("/dashboard")}
            >
              Groimon Admin
            </Button>
          </div>
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/ipl-registrations")}
            >
              IPL Registrations
            </Button>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
