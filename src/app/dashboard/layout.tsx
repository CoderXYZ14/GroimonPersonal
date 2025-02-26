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
      <div className="relative flex min-h-screen ">
        <AppSidebar />
        <div className="flex  w-[calc(100vw-262px)] flex-col mx-auto">
          <Navbar />
          <main className="flex flex-1 p-6 justify-center mx-auto max-w-7xl">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
