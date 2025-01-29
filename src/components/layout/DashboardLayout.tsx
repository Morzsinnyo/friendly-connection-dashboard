import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function DashboardLayout() {
  console.log("[DashboardLayout] Rendering dashboard layout");

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
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-accent"
                onClick={() => console.log("[DashboardLayout] Mobile menu trigger clicked")}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-[280px] p-0 block"
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                console.log("[DashboardLayout] Sheet opened");
              }}
            >
              <AppSidebar className="h-full w-full" />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pt-16 md:pt-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}