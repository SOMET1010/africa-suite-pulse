import { Outlet, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import ArrivalsPage from "@/pages/ArrivalsPage";
import DeparturesPage from "@/pages/DeparturesPage";
import RackPage from "@/pages/RackPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AuthPage from "@/pages/AuthPage";
import AuthLanding from "@/pages/AuthLanding";
import AfricanAuthPage from "@/pages/AfricanAuthPage";
import RequireAuth from "@/core/auth/RequireAuth";
import SettingsHomePage from "@/pages/SettingsHomePage";
import HotelSettingsFormPage from "@/pages/HotelSettingsFormPage";
import RoomsSettingsPage from "@/pages/RoomsSettingsPage";
import ServicesSettingsPage from "@/pages/ServicesSettingsPage";
import TariffsSettingsPage from "@/pages/TariffsSettingsPage";
import PaymentsPage from "@/features/payments/PaymentsPage";
import BillingPageWrapper from "@/pages/BillingPageWrapper";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import ModuleMarketplacePage from "@/pages/ModuleMarketplacePage";
import UsersPage from "@/features/users/UsersPage";
import ReservationsPage from "@/pages/ReservationsPage";
import QuickReservationPage from "@/pages/QuickReservationPage";
import AdvancedReservationPage from "@/pages/AdvancedReservationPage";
// Groups and allotments now lazy loaded
import GuestsPage from "@/pages/GuestsPage";
import CustomerExperiencePage from "@/pages/CustomerExperiencePage";
import SettingsAnalyticsPage from "@/features/settings/analytics/AnalyticsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ReportsPage from "@/pages/ReportsPage";
import OperationsPage from "@/pages/OperationsPage";
import MaintenancePage from "@/pages/MaintenancePage";
import HousekeepingPage from "@/pages/HousekeepingPage";
// Night audit now lazy loaded
import POSLoginSecurePage from "@/pages/POSLoginSecurePage";
import RequirePOSAuth from "@/features/pos/auth/RequirePOSAuth";
import POSAfricanPage from '@/pages/POSAfricanPage';
import HiddenFeaturesTestPage from '@/pages/HiddenFeaturesTestPage';
import AyaAIDemoPage from '@/pages/AyaAIDemoPage';
import FinTechTestPageSimple from '@/pages/FinTechTestPageSimple';
// Import lazy-loaded components for performance
import {
  POSPage,
  POSTerminalPage,
  POSInventoryPage,
  POSSessionsPage,
  POSUsersPage,
  POSSettingsPage,
  POSMaitreHotelPage,
  POSServerPage,
  POSCustomersPage,
  POSKitchen,
  POSReports,
  // POSMobileServerPage removed - consolidated
  DailyReportsPage,
  AdvancedAnalytics,
  SystemSettingsPage,
  SecurityPage,
  TemplatesPage,
  MonitoringDashboard,
  MonitoringIncidents,
  CardexPage,
  NightAuditPage,
  GroupsManagementPage,
  AllotmentsPage,
  ManagerDashboard,
  ReceptionistDashboard,
  ServerDashboard,
  UnifiedBIDashboard
} from "@/routes.lazy";
import { ProfessionalHeader } from "@/components/layout/ProfessionalHeader";

// Dashboards now lazy loaded
// Other monitoring components now lazy loaded
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
  // Use optimized routes
  const OptimizedRoutes = lazy(() => import("@/routes-optimized").then(m => ({ default: m.AppRoutes })));
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-pearl flex items-center justify-center">Chargement...</div>}>
      <OptimizedRoutes />
    </Suspense>
  );
}

export function AppRoutesLegacy() {
  return (
    <Routes>
      <Route path="/welcome" element={<AuthLanding />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/pos/login" element={<POSLoginSecurePage />} />
      {/* Special pages that need direct auth without Layout wrapper */}
      <Route index element={<RequireAuth><Index /></RequireAuth>} />
      
      {/* Critical Business Pages - Migrated to UnifiedLayout */}
      <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="business-intelligence" element={<RequireAuth><Suspense fallback={<div>Loading...</div>}><UnifiedBIDashboard /></Suspense></RequireAuth>} />
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
      <Route path="subscriptions" element={<RequireAuth><SubscriptionsPage /></RequireAuth>} />
      <Route path="modules" element={<RequireAuth><ModuleMarketplacePage /></RequireAuth>} />
      
      <Route path="arrivals" element={<RequireAuth><ArrivalsPage /></RequireAuth>} />
      <Route path="guests" element={<RequireAuth><GuestsPage /></RequireAuth>} />
      <Route path="customer-experience" element={<RequireAuth><CustomerExperiencePage /></RequireAuth>} />
      <Route path="analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
      <Route path="reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
      <Route path="operations" element={<RequireAuth><OperationsPage /></RequireAuth>} />
      
      {/* Routes publiques */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth-landing" element={<AuthLanding />} />
      <Route path="/login" element={<AfricanAuthPage />} />
      <Route path="/african-auth" element={<AfricanAuthPage />} />
      <Route path="/pos-login" element={<POSLoginSecurePage />} />
      
      {/* Routes de test publiques */}
      <Route path="/hidden-features-test" element={<HiddenFeaturesTestPage />} />
      <Route path="/aya-demo" element={<AyaAIDemoPage />} />
      <Route path="/fintech-test" element={<FinTechTestPageSimple />} />      
      {/* Still in Legacy Layout - To be migrated    <Routes>
      {/* Routes publiques */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth-landing" element={<AuthLanding />} />
      <Route path="/login" element={<AfricanAuthPage />} />
      <Route path="/african-auth" element={<AfricanAuthPage />} />
      <Route path="/pos-login" element={<POSLoginSecurePage />} />
      
      {/* Routes de test publiques */}
      <Route path="/hidden-features-test" element={<HiddenFeaturesTestPage />} />
      <Route path="/aya-demo" element={<AyaAIDemoPage />} />
      <Route path="/fintech-test" element={<FinTechTestPageSimple />} />

      {/* Routes protégées avec authentification */}
      <Route element={<RequireAuth><UnifiedLayout /></RequireAuth>}>
        <Route path="reservations/groups" element={
          <Suspense fallback={<div>Loading groups...</div>}>
            <GroupsManagementPage />
          </Suspense>
        } />
        <Route path="reservations/allotments" element={
          <Suspense fallback={<div>Loading allotments...</div>}>
            <AllotmentsPage />
          </Suspense>
        } />
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
        {/* Route pos/mobile-server removed - consolidated into main POS layout */}
        <Route path="pos/african" element={<RequirePOSAuth requiredRole="pos_server"><POSAfricanPage /></RequirePOSAuth>} />
        {/* Role-based dashboards */}
        <Route path="dashboard/receptionist" element={
          <Suspense fallback={<div>Loading...</div>}>
            <ReceptionistDashboard />
          </Suspense>
        } />
        <Route path="dashboard/server" element={
          <Suspense fallback={<div>Loading...</div>}>
            <ServerDashboard />
          </Suspense>
        } />
        <Route path="dashboard/manager" element={
          <Suspense fallback={<div>Loading...</div>}>
            <ManagerDashboard />
          </Suspense>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
