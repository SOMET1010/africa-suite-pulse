import { Outlet, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import ArrivalsPage from "@/pages/ArrivalsPage";
import DeparturesPage from "@/pages/DeparturesPage";
import RackPage from "@/pages/RackPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AuthPage from "@/pages/AuthPage";
import AuthLanding from "@/pages/AuthLanding";
import RequireAuth from "@/core/auth/RequireAuth";
import SettingsHomePage from "@/pages/SettingsHomePage";
import HotelSettingsFormPage from "@/pages/HotelSettingsFormPage";
import RoomsSettingsPage from "@/pages/RoomsSettingsPage";
import ServicesSettingsPage from "@/pages/ServicesSettingsPage";
import TariffsSettingsPage from "@/pages/TariffsSettingsPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import BillingPageWrapper from "@/pages/BillingPageWrapper";
import UsersPage from "@/features/users/UsersPage";
import ReservationsPage from "@/pages/ReservationsPage";
import QuickReservationPage from "@/pages/QuickReservationPage";
import AdvancedReservationPage from "@/pages/AdvancedReservationPage";
import GroupsManagementPage from "@/features/reservations/GroupsManagementPage";
import AllotmentsPage from "@/features/reservations/AllotmentsPage";
import GuestsPage from "@/pages/GuestsPage";
import SystemSettingsPage from "@/features/settings/system/SystemSettingsPage";
import TemplatesPage from "@/features/settings/templates/TemplatesPage";
import SettingsAnalyticsPage from "@/features/settings/analytics/AnalyticsPage";
import CardexPage from "@/features/cardex/CardexPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AdvancedAnalytics from "@/features/analytics/AdvancedAnalytics";
import ReportsPage from "@/pages/ReportsPage";
import DailyReportsPage from "@/features/reports/daily/DailyReportsPage";
import SecurityPage from "@/features/settings/security/SecurityPage";
import MaintenancePage from "@/pages/MaintenancePage";
import HousekeepingPage from "@/pages/HousekeepingPage";
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
import POSCustomersPage from "@/pages/POSCustomersPage";
import POSKitchen from "@/pages/POSKitchen";
import POSReports from "@/pages/POSReports";
import { ProfessionalHeader } from "@/components/layout/ProfessionalHeader";
import DemoPage from "@/pages/DemoPage";
import PricingPage from "@/pages/PricingPage";
import UXFoundationsDemo from "@/pages/UXFoundationsDemo";
import { ReceptionistDashboard, ServerDashboard, ManagerDashboard } from "@/features/dashboards";
import { 
  MonitoringDashboard, 
  MonitoringIncidents, 
  MonitoringAlerts, 
  NetworkMonitoring, 
  MonitoringSettings 
} from "@/features/monitoring";
import TestingPage from "@/pages/TestingPage";
import TestModulePage from "@/pages/TestModulePage";
import { DiscoveryPage } from "@/features/discovery/pages/DiscoveryPage";

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
      <Route path="settings" element={<RequireAuth><SettingsHomePage /></RequireAuth>} />
      <Route path="settings/hotel" element={<RequireAuth><HotelSettingsFormPage /></RequireAuth>} />
      <Route path="settings/rooms" element={<RequireAuth><RoomsSettingsPage /></RequireAuth>} />
      <Route path="settings/services" element={<RequireAuth><ServicesSettingsPage /></RequireAuth>} />
      <Route path="settings/tariffs" element={<RequireAuth><TariffsSettingsPage /></RequireAuth>} />
      <Route path="settings/payments" element={<RequireAuth><PaymentsPage /></RequireAuth>} />
      <Route path="settings/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
      <Route path="settings/system" element={<RequireAuth><SystemSettingsPage /></RequireAuth>} />
      <Route path="settings/templates" element={<RequireAuth><TemplatesPage /></RequireAuth>} />
      <Route path="settings/analytics" element={<RequireAuth><SettingsAnalyticsPage /></RequireAuth>} />
      <Route path="settings/security" element={<RequireAuth><SecurityPage /></RequireAuth>} />
      
      {/* Monitoring Routes */}
      <Route path="monitoring" element={<RequireAuth><MonitoringDashboard /></RequireAuth>} />
      <Route path="monitoring/incidents" element={<RequireAuth><MonitoringIncidents /></RequireAuth>} />
      <Route path="monitoring/alerts" element={<RequireAuth><MonitoringAlerts /></RequireAuth>} />
      <Route path="monitoring/network" element={<RequireAuth><NetworkMonitoring /></RequireAuth>} />
      <Route path="monitoring/settings" element={<RequireAuth><MonitoringSettings /></RequireAuth>} />
      
      {/* Testing Routes */}
      <Route path="testing" element={<RequireAuth><TestingPage /></RequireAuth>} />
      <Route path="testing/module/:moduleId" element={<RequireAuth><TestModulePage /></RequireAuth>} />
      
      {/* Discovery Guide Route */}
      <Route path="guide" element={<RequireAuth><DiscoveryPage /></RequireAuth>} />
      
      {/* Legacy redirects */}
      <Route path="settings/room-types" element={<RequireAuth><RoomsSettingsPage /></RequireAuth>} />
      <Route path="settings/rooms-catalog" element={<RequireAuth><RoomsSettingsPage /></RequireAuth>} />
      
      {/* Phase 2 - Reservation Features migrated to UnifiedLayout */}
      <Route path="departures" element={<RequireAuth><DeparturesPage /></RequireAuth>} />
      <Route path="reservations" element={<RequireAuth><ReservationsPage /></RequireAuth>} />
      <Route path="reservations/new/quick" element={<RequireAuth><QuickReservationPage /></RequireAuth>} />
      <Route path="reservations/new/advanced" element={<RequireAuth><AdvancedReservationPage /></RequireAuth>} />
      <Route path="reservations/rack" element={<RequireAuth><RackPage /></RequireAuth>} />
      <Route path="rack" element={<RequireAuth><RackPage /></RequireAuth>} />
      
      <Route path="billing" element={<RequireAuth><BillingPageWrapper /></RequireAuth>} />
      
      <Route path="arrivals" element={<RequireAuth><ArrivalsPage /></RequireAuth>} />
      <Route path="guests" element={<RequireAuth><GuestsPage /></RequireAuth>} />
      <Route path="analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
      <Route path="reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
      <Route path="maintenance" element={<RequireAuth><MaintenancePage /></RequireAuth>} />
      <Route path="housekeeping" element={<RequireAuth><HousekeepingPage /></RequireAuth>} />
      
      {/* Still in Legacy Layout - To be migrated in next phases */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="reservations/groups" element={<GroupsManagementPage />} />
        <Route path="reservations/allotments" element={<AllotmentsPage />} />
        <Route path="cardex" element={<CardexPage />} />
        <Route path="analytics/advanced" element={<AdvancedAnalytics />} />
        <Route path="reports/daily" element={<DailyReportsPage />} />
        <Route path="night-audit" element={<NightAuditPage />} />
        <Route path="pos" element={<RequirePOSAuth><POSPage /></RequirePOSAuth>} />
        <Route path="pos/maitre-hotel" element={<RequirePOSAuth requiredRole="pos_hostess"><POSMaitreHotelPage /></RequirePOSAuth>} />
        <Route path="pos/server" element={<RequirePOSAuth requiredRole="pos_server"><POSServerPage /></RequirePOSAuth>} />
        <Route path="pos/terminal" element={<RequirePOSAuth><POSTerminalPage /></RequirePOSAuth>} />
        <Route path="pos/customers" element={<RequirePOSAuth requiredRole="pos_server"><POSCustomersPage /></RequirePOSAuth>} />
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
