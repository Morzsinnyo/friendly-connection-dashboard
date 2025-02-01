import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import { GoogleCalendar } from "./components/calendar/GoogleCalendar";
import { ContactProfile } from "./components/contacts/ContactProfile";
import { CreateContact } from "./components/contacts/CreateContact";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
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