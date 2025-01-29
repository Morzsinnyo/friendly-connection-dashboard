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
              className="p-0 h-[100dvh] w-[80%] max-w-[400px] sm:max-w-[280px] block"
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                console.log("[DashboardLayout] Sheet opened");
              }}
            >
              <div className="h-full w-full overflow-y-auto">
                <AppSidebar className="h-full w-full" />
              </div>
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