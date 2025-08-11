import { Outlet, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import CheckinExpressPage from "@/features/arrivals/CheckinExpressPage";
import RackGrid from "@/features/rack/RackGrid";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/AuthPage";
import RequireAuth from "@/core/auth/RequireAuth";
import { SettingsHome, HotelSettingsForm } from "@/features/settings";
import RoomsPage from "@/features/settings/rooms/RoomsPage";
import ServicesPage from "@/features/settings/services/ServicesPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import UsersPage from "@/features/users/UsersPage";
import SystemSettingsPage from "@/features/settings/system/SystemSettingsPage";
import TemplatesPage from "@/features/settings/templates/TemplatesPage";
import AnalyticsPage from "@/features/settings/analytics/AnalyticsPage";
import SecurityPage from "@/features/settings/security/SecurityPage";
import { ProfessionalHeader } from "@/components/layout/ProfessionalHeader";

function Layout() {
  return (
    <div className="min-h-screen bg-pearl">
      <ProfessionalHeader />
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
