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
        <div className="flex  md:w-[calc(100vw-262px)] w-screen flex-col mx-auto">
          <Navbar />
          <main className="flex p-6 justify-center mx-auto max-w-screen-2xl">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
