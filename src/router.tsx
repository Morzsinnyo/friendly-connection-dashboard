
import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import ThankYou from "./pages/ThankYou";
import { GoogleCalendar } from "./components/calendar/GoogleCalendar";
import { ContactProfile } from "./components/contacts/ContactProfile";
import { CreateContact } from "./components/contacts/CreateContact";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthRedirect } from "./components/auth/AuthRedirect";
import { OnboardingGuard } from "./components/auth/OnboardingGuard";
import Onboarding from "./pages/onboarding/Onboarding";
import { OnboardingContactCreate } from "./pages/onboarding/steps/OnboardingContactCreate";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/thank-you",
    element: <ThankYou />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/auth/callback",
    element: <Auth />,
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboarding/contact/create",
    element: (
      <ProtectedRoute>
        <OnboardingContactCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <DashboardLayout />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Index />,
      },
      {
        path: "calendar",
        element: <GoogleCalendar />,
      },
      {
        path: "contact/create",
        element: <CreateContact />,
      },
      {
        path: "contact/:id",
        element: <ContactProfile />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
    errorElement: <Navigate to="/dashboard" replace />,
  },
  // Make 404 handling explicit and simple
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
