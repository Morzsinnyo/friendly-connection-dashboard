import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <AppSidebar />
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}