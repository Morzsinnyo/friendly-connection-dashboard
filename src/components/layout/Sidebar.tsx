
import { UserCircle2, Settings, Calendar, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useLocation, Link as RouterLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Contacts",
    url: "/dashboard",
    icon: UserCircle2,
  },
  {
    title: "Calendar",
    url: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar({ className }: { className?: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  console.log("[AppSidebar] Rendering with location:", location.pathname);

  return (
    <Sidebar className={cn("h-full", className)}>
      <SidebarHeader className="p-4 pb-0 border-b-0">
        <h1 className="text-xl font-semibold text-[#071A52] dark:text-white px-2">LinkUp</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-lg font-semibold text-[#071A52] dark:text-white">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                console.log(`[AppSidebar] Menu item ${item.title} - isActive:`, isActive);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`w-full rounded-lg p-3 transition-colors hover:bg-[#A7FF83]/20 hover:text-[#071A52] dark:hover:text-white ${
                        isActive ? "bg-[#A7FF83] text-[#071A52] dark:bg-[#A7FF83]/60 dark:text-white" : "text-[#071A52] dark:text-white"
                      }`}
                    >
                      <RouterLink to={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span className="ml-3">{item.title}</span>
                      </RouterLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full rounded-lg p-3 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
