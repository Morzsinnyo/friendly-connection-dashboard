
import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import { GoogleCalendar } from "./components/calendar/GoogleCalendar";
import { ContactProfile } from "./components/contacts/ContactProfile";
import { CreateContact } from "./components/contacts/CreateContact";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
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
  },
  {
    path: "/auth",
    element: <Auth />,
  },
]);
