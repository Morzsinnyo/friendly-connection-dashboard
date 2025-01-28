import { Menu } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Mobile Sidebar - only visible on mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-4 top-4 md:hidden z-50"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="p-0 w-[80%] max-w-[300px] border-r"
          >
            <nav className="h-full bg-background">
              <AppSidebar />
            </nav>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">
          <div className="md:hidden h-14" /> {/* Spacer for mobile menu button */}
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}