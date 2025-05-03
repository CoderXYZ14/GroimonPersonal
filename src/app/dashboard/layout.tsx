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
      <div className="relative flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-1 sm:px-2 lg:px-2 w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
