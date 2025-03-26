
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { RandomFeedbackPrompt } from "@/components/feedback/RandomFeedbackPrompt";

export function DashboardLayout() {
  console.log("[DashboardLayout] Rendering dashboard layout");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const toggleMobileMenu = useCallback(() => {
    console.log("[DashboardLayout] Toggling mobile menu, current state:", !isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  const onTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

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
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
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
              "fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-gray-900 border-r transition-transform duration-300 ease-in-out",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col overflow-hidden">
              {/* Mobile Header */}
              <div className="flex h-14 items-center justify-between px-4 border-b">
                <span className="font-semibold text-lg text-[#071A52] dark:text-white">LinkUp</span>
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
        <main className="flex-1 overflow-auto bg-background">
          {/* Top Bar with Mobile Menu Trigger */}
          <div className="p-4 flex items-center justify-between border-b bg-background sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden hover:bg-accent"
                onClick={toggleMobileMenu}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Feedback Components */}
        <FeedbackButton />
        <RandomFeedbackPrompt />
      </div>
    </SidebarProvider>
  );
}
