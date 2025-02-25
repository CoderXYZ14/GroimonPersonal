import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/helper/Sidebar";
import { Navbar } from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative flex min-h-screen">
        <AppSidebar />
        <div className="flex w-full flex-col">
          <Navbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
