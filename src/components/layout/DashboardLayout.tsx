import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  console.log("[DashboardLayout] Rendering dashboard layout");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    console.log("[DashboardLayout] Toggling mobile menu, current state:", !isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Custom Mobile Menu */}
        <div 
          className={cn(
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden",
            isMobileMenuOpen ? "block" : "hidden"
          )}
          onClick={toggleMobileMenu}
        >
          <div 
            className={cn(
              "fixed inset-y-0 left-0 w-[280px] bg-background shadow-lg transition-transform duration-300 ease-in-out",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <AppSidebar className="h-full w-full" />
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-accent"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
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