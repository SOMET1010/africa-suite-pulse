import { Outlet, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import CheckinExpressPage from "@/features/arrivals/CheckinExpressPage";
import RackGrid from "@/features/rack/RackGrid";
import NotFound from "@/pages/NotFound";
import { Link } from "react-router-dom";
import AuthPage from "@/pages/AuthPage";
import RequireAuth from "@/core/auth/RequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { SettingsHome, HotelSettingsForm } from "@/features/settings";
import RoomsPage from "@/features/settings/rooms/RoomsPage";
import ServicesPage from "@/features/settings/services/ServicesPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import UsersPage from "@/features/users/UsersPage";
import SystemSettingsPage from "@/features/settings/system/SystemSettingsPage";
import TemplatesPage from "@/features/settings/templates/TemplatesPage";
import AnalyticsPage from "@/features/settings/analytics/AnalyticsPage";
import SecurityPage from "@/features/settings/security/SecurityPage";

function Layout() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 py-2 flex items-center gap-3">
          <Link to="/" className="text-sm font-semibold">AfricaSuite PMS</Link>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/arrivals" className="text-sm text-muted-foreground hover:underline">Arrivées</Link>
            <Link to="/reservations/rack" className="text-sm text-muted-foreground hover:underline">Rack</Link>
            <Link to="/settings" className="text-sm text-muted-foreground hover:underline">Paramètres</Link>
            <button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground hover:underline">Logout</button>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="arrivals" element={<CheckinExpressPage />} />
        <Route path="reservations/rack" element={<RackGrid />} />
        <Route path="settings" element={<SettingsHome />} />
        <Route path="settings/hotel" element={<HotelSettingsForm />} />
        <Route path="settings/rooms" element={<RoomsPage />} />
        {/* Legacy redirects */}
        <Route path="settings/room-types" element={<RoomsPage />} />
        <Route path="settings/rooms-catalog" element={<RoomsPage />} />
        <Route path="settings/services" element={<ServicesPage />} />
        <Route path="settings/payments" element={<PaymentsPage />} />
        <Route path="settings/users" element={<UsersPage />} />
        <Route path="settings/system" element={<SystemSettingsPage />} />
        <Route path="settings/templates" element={<TemplatesPage />} />
        <Route path="settings/analytics" element={<AnalyticsPage />} />
        <Route path="settings/security" element={<SecurityPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
