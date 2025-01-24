import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import { ContactProfile } from "./components/contacts/ContactProfile";
import { CreateContact } from "./components/contacts/CreateContact";
import PlannedActivities from "./pages/PlannedActivities";
import { CreateActivity } from "./components/activities/CreateActivity";
import { GoogleCalendar } from "./components/calendar/GoogleCalendar";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { LoadingState } from "@/components/common/LoadingState";
import { ThemeProvider } from "./components/theme/ThemeProvider";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState({
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    console.log("[ProtectedRoute] Initializing session check...");
    
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("[ProtectedRoute] Fetching session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          console.log("[ProtectedRoute] Session state:", session ? "Authenticated" : "Not authenticated");
          setState({
            isLoading: false,
            isAuthenticated: !!session,
          });
        }
      } catch (error) {
        console.error("[ProtectedRoute] Session check error:", error);
        if (mounted) {
          setState({
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    };

    checkSession();

    console.log("[ProtectedRoute] Setting up auth state listener...");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[ProtectedRoute] Auth state changed:", event);
      if (mounted) {
        setState({
          isLoading: false,
          isAuthenticated: !!session,
        });
      }
    });

    return () => {
      console.log("[ProtectedRoute] Cleaning up auth state listener...");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (state.isLoading) {
    return <LoadingState message="Checking authentication..." />;
  }

  return state.isAuthenticated ? children : <Navigate to="/auth" />;
};

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="app-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Index />} />
              <Route path="contact/create" element={<CreateContact />} />
              <Route path="contact/:id" element={<ContactProfile />} />
              <Route path="activities" element={<PlannedActivities />} />
              <Route path="activities/create" element={<CreateActivity />} />
              <Route path="activities/edit/:id" element={<CreateActivity />} />
              <Route path="calendar" element={<GoogleCalendar />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;