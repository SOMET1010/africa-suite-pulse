import { Outlet, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import CheckinExpressPage from "@/features/arrivals/CheckinExpressPage";
import DeparturesPage from "@/features/departures/DeparturesPage";
import RackGrid from "@/features/rack/RackGrid";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/AuthPage";
import AuthLanding from "@/pages/AuthLanding";
import RequireAuth from "@/core/auth/RequireAuth";
import { SettingsHome, HotelSettingsForm, TariffsPage } from "@/features/settings";
import RoomsPage from "@/features/settings/rooms/RoomsPage";
import ServicesPage from "@/features/settings/services/ServicesPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import BillingPage from "@/features/billing/BillingPage";
import UsersPage from "@/features/users/UsersPage";
import ReservationsPage from "@/features/reservations/ReservationsPage";
import QuickReservationPage from "@/features/reservations/QuickReservationPage";
import AdvancedReservationPage from "@/features/reservations/AdvancedReservationPage";
import GroupsManagementPage from "@/features/reservations/GroupsManagementPage";
import AllotmentsPage from "@/features/reservations/AllotmentsPage";
import GuestsPage from "@/features/guests/GuestsPage";
import SystemSettingsPage from "@/features/settings/system/SystemSettingsPage";
import TemplatesPage from "@/features/settings/templates/TemplatesPage";
import AnalyticsPage from "@/features/settings/analytics/AnalyticsPage";
import CardexPage from "@/features/cardex/CardexPage";
import AnalyticsDashboard from "@/features/analytics/AnalyticsDashboard";
import AdvancedAnalytics from "@/features/analytics/AdvancedAnalytics";
import ReportsManagement from "@/features/reports/ReportsManagement";
import DailyReportsPage from "@/features/reports/daily/DailyReportsPage";
import SecurityPage from "@/features/settings/security/SecurityPage";
import MaintenancePage from "@/features/maintenance/MaintenancePage";
import { HousekeepingPage } from "@/features/housekeeping";
import { NightAuditPage } from "@/features/night-audit";
import POSPage from "@/features/pos/POSPage";
import POSLoginPage from "@/features/pos/auth/POSLoginPage";
import RequirePOSAuth from "@/features/pos/auth/RequirePOSAuth";
import POSTerminalPage from "@/pages/POSTerminalPage";
import POSInventoryPage from "@/pages/POSInventoryPage";
import POSSessionsPage from "@/pages/POSSessionsPage";
import POSUsersPage from "@/pages/POSUsersPage";
import POSSettingsPage from "@/pages/POSSettingsPage";
import POSMaitreHotelPage from "@/pages/POSMaitreHotelPage";
import POSServerPage from "@/pages/POSServerPage";
import POSKitchen from "@/pages/POSKitchen";
import POSReports from "@/pages/POSReports";
import { ProfessionalHeader } from "@/components/layout/ProfessionalHeader";
import DemoPage from "@/pages/DemoPage";
import PricingPage from "@/pages/PricingPage";
import UXFoundationsDemo from "@/pages/UXFoundationsDemo";
import { ReceptionistDashboard, ServerDashboard, ManagerDashboard } from "@/features/dashboards";

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
      <Route path="/welcome" element={<AuthLanding />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/pos/login" element={<POSLoginPage />} />
      {/* Special pages that need direct auth without Layout wrapper */}
      <Route path="ux-demo" element={<RequireAuth><UXFoundationsDemo /></RequireAuth>} />
      <Route index element={<RequireAuth><Index /></RequireAuth>} />
      
      {/* Critical Business Pages - Migrated to UnifiedLayout */}
      <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="settings" element={<RequireAuth><SettingsHome /></RequireAuth>} />
      <Route path="settings/hotel" element={<RequireAuth><HotelSettingsForm /></RequireAuth>} />
      <Route path="settings/rooms" element={<RequireAuth><RoomsPage /></RequireAuth>} />
      <Route path="settings/services" element={<RequireAuth><ServicesPage /></RequireAuth>} />
      <Route path="settings/tariffs" element={<RequireAuth><TariffsPage /></RequireAuth>} />
      <Route path="settings/payments" element={<RequireAuth><PaymentsPage /></RequireAuth>} />
      <Route path="settings/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
      <Route path="settings/system" element={<RequireAuth><SystemSettingsPage /></RequireAuth>} />
      <Route path="settings/templates" element={<RequireAuth><TemplatesPage /></RequireAuth>} />
      <Route path="settings/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
      <Route path="settings/security" element={<RequireAuth><SecurityPage /></RequireAuth>} />
      
      {/* Legacy redirects */}
      <Route path="settings/room-types" element={<RequireAuth><RoomsPage /></RequireAuth>} />
      <Route path="settings/rooms-catalog" element={<RequireAuth><RoomsPage /></RequireAuth>} />
      
      {/* Phase 2 - Reservation Features migrated to UnifiedLayout */}
      <Route path="departures" element={<RequireAuth><DeparturesPage /></RequireAuth>} />
      <Route path="reservations" element={<RequireAuth><ReservationsPage /></RequireAuth>} />
      <Route path="reservations/new/quick" element={<RequireAuth><QuickReservationPage /></RequireAuth>} />
      <Route path="reservations/rack" element={<RequireAuth><RackGrid /></RequireAuth>} />
      
      {/* Still in Legacy Layout - To be migrated in next phases */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="arrivals" element={<CheckinExpressPage />} />
        <Route path="reservations/new/advanced" element={<AdvancedReservationPage />} />
        <Route path="reservations/groups" element={<GroupsManagementPage />} />
        <Route path="reservations/allotments" element={<AllotmentsPage />} />
        <Route path="guests" element={<GuestsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="cardex" element={<CardexPage />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="analytics/advanced" element={<AdvancedAnalytics />} />
        <Route path="reports" element={<ReportsManagement />} />
        <Route path="reports/daily" element={<DailyReportsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="housekeeping" element={<HousekeepingPage />} />
        <Route path="night-audit" element={<NightAuditPage />} />
        <Route path="pos" element={<RequirePOSAuth><POSPage /></RequirePOSAuth>} />
        <Route path="pos/maitre-hotel" element={<RequirePOSAuth requiredRole="pos_hostess"><POSMaitreHotelPage /></RequirePOSAuth>} />
        <Route path="pos/server" element={<RequirePOSAuth requiredRole="pos_server"><POSServerPage /></RequirePOSAuth>} />
        <Route path="pos/terminal" element={<RequirePOSAuth><POSTerminalPage /></RequirePOSAuth>} />
        <Route path="pos/inventory" element={<RequirePOSAuth requiredRole="pos_cashier"><POSInventoryPage /></RequirePOSAuth>} />
        <Route path="pos/sessions" element={<RequirePOSAuth requiredRole="pos_cashier"><POSSessionsPage /></RequirePOSAuth>} />
        <Route path="pos/users" element={<RequirePOSAuth requiredRole="pos_manager"><POSUsersPage /></RequirePOSAuth>} />
        <Route path="pos/settings" element={<RequirePOSAuth requiredRole="pos_manager"><POSSettingsPage /></RequirePOSAuth>} />
        <Route path="pos/kitchen" element={<RequirePOSAuth requiredRole="pos_server"><POSKitchen /></RequirePOSAuth>} />
        <Route path="pos/reports" element={<RequirePOSAuth requiredRole="pos_manager"><POSReports /></RequirePOSAuth>} />
        <Route path="demo" element={<DemoPage />} />
        <Route path="pricing" element={<PricingPage />} />
        {/* Role-based dashboards */}
        <Route path="dashboard/receptionist" element={<ReceptionistDashboard />} />
        <Route path="dashboard/server" element={<ServerDashboard />} />
        <Route path="dashboard/manager" element={<ManagerDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
