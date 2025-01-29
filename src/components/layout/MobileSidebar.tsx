import { UserCircle2, Settings, Calendar, LogOut } from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Contacts",
    url: "/",
    icon: UserCircle2,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/settings",
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
    <div className="flex flex-col h-full">
      <nav className="flex-1 px-2 pb-4 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <RouterLink
              key={item.title}
              to={item.url}
              onClick={onClose}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
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
          className="flex w-full items-center px-4 py-3 text-sm font-medium rounded-md text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}