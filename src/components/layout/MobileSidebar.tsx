
import { UserCircle2, Settings, Calendar, LogOut } from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
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

export function MobileSidebar({ onClose }: { onClose: () => void }) {
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

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-left duration-300">
      <nav className="flex-1 px-2 pb-4 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <RouterLink
              key={item.title}
              to={item.url}
              onClick={onClose}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                "transform hover:scale-[1.02] active:scale-[0.98]",
                isActive
                  ? "bg-[#A7FF83] text-[#071A52] shadow-sm"
                  : "hover:bg-[#A7FF83]/20 text-[#071A52] hover:text-[#071A52]"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.title}
            </RouterLink>
          );
        })}
      </nav>
      <div className="px-2 pb-4">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center px-4 py-3 text-sm font-medium rounded-md",
            "transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
            "text-destructive hover:bg-destructive hover:text-destructive-foreground"
          )}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
