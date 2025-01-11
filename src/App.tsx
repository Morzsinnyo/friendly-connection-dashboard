import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CalendarPage from "./pages/Calendar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Index />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;