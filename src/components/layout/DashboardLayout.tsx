import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  console.log("[DashboardLayout] Rendering dashboard layout");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const toggleMobileMenu = () => {
    console.log("[DashboardLayout] Toggling mobile menu, current state:", !isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && isMobileMenuOpen) {
      console.log("[DashboardLayout] Closing sidebar via swipe");
      setIsMobileMenuOpen(false);
    } else if (isRightSwipe && !isMobileMenuOpen && touchStart < 50) {
      console.log("[DashboardLayout] Opening sidebar via swipe");
      setIsMobileMenuOpen(true);
    }
  }, [touchStart, touchEnd, isMobileMenuOpen]);

  useEffect(() => {
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchEnd]);

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
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300 md:hidden",
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={toggleMobileMenu}
        >
          {/* Mobile Menu Panel */}
          <div 
            className={cn(
              "fixed inset-y-0 left-0 w-[280px] bg-background border-r transition-transform duration-300 ease-in-out",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col overflow-hidden">
              {/* Mobile Header */}
              <div className="flex h-14 items-center justify-between px-4 border-b">
                <span className="font-semibold">Menu</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="hover:bg-accent"
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

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Mobile Menu Trigger */}
          <div className="p-4 md:hidden fixed top-0 left-0">
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

          <div className="p-4 md:p-6 pt-16 md:pt-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}