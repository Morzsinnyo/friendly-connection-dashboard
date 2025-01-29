import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
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

        {/* Mobile Menu Overlay */}
        <div 
          className={cn(
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden",
            isMobileMenuOpen ? "block" : "hidden"
          )}
          onClick={toggleMobileMenu}
        >
          {/* Mobile Menu Panel */}
          <div 
            className={cn(
              "fixed inset-y-0 left-0 w-[280px] bg-sidebar shadow-lg transition-transform duration-300 ease-in-out",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col overflow-hidden">
              {/* Mobile Header */}
              <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
                <span className="font-semibold">Menu</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="hover:bg-sidebar-accent"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Mobile Sidebar Content */}
              <div className="flex-1 overflow-y-auto">
                <MobileSidebar onClose={toggleMobileMenu} />
              </div>
            </div>
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