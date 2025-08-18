import { Outlet, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import RequireAuth from "@/core/auth/RequireAuth";
import RequirePOSAuth from "@/features/pos/auth/RequirePOSAuth";
import { ProfessionalHeader } from "@/components/layout/ProfessionalHeader";

// ===== CRITICAL ROUTES (Non-lazy, loaded immediately) =====
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import AuthLanding from "@/pages/AuthLanding";
import NotFoundPage from "@/pages/NotFoundPage";
import POSLoginSecurePage from "@/pages/POSLoginSecurePage";

// ===== CORE BUSINESS ROUTES (Lazy-loaded for performance) =====
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const SettingsHomePage = lazy(() => import("@/pages/SettingsHomePage"));
const ArrivalsPage = lazy(() => import("@/pages/ArrivalsPage"));
const DeparturesPage = lazy(() => import("@/pages/DeparturesPage"));
const RackPage = lazy(() => import("@/pages/RackPage"));
const ReservationsPage = lazy(() => import("@/pages/ReservationsPage"));

// ===== SETTINGS ROUTES =====
const HotelSettingsFormPage = lazy(() => import("@/pages/HotelSettingsFormPage"));
const RoomsSettingsPage = lazy(() => import("@/pages/RoomsSettingsPage"));
const ServicesSettingsPage = lazy(() => import("@/pages/ServicesSettingsPage"));
const TariffsSettingsPage = lazy(() => import("@/pages/TariffsSettingsPage"));
const UsersPage = lazy(() => import("@/features/users/UsersPage"));

// ===== ANALYTICS & REPORTING =====
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));

// ===== OPERATIONS =====
const OperationsPage = lazy(() => import("@/pages/OperationsPage"));
const MaintenancePage = lazy(() => import("@/pages/MaintenancePage"));
const HousekeepingPage = lazy(() => import("@/pages/HousekeepingPage"));

// ===== OTHER PAGES =====
const GuestsPage = lazy(() => import("@/pages/GuestsPage"));
const CustomerExperiencePage = lazy(() => import("@/pages/CustomerExperiencePage"));
const QuickReservationPage = lazy(() => import("@/pages/QuickReservationPage"));
const AdvancedReservationPage = lazy(() => import("@/pages/AdvancedReservationPage"));
const BillingPageWrapper = lazy(() => import("@/pages/BillingPageWrapper"));
const SubscriptionsPage = lazy(() => import("@/pages/SubscriptionsPage"));
const ModuleMarketplacePage = lazy(() => import("@/pages/ModuleMarketplacePage"));

// ===== LAZY-LOADED COMPONENTS FROM routes.lazy =====
// Import these as lazy components instead
const PaymentsPage = lazy(() => import("@/features/payments/PaymentsPage"));
const SettingsAnalyticsPage = lazy(() => import("@/features/settings/analytics/AnalyticsPage"));

import {
  SystemSettingsPage,
  SecurityPage,
  TemplatesPage,
  MonitoringDashboard,
  MonitoringIncidents,
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
  POSMobileServerPage,
  DailyReportsPage,
  AdvancedAnalytics,
  CardexPage,
  NightAuditPage,
  GroupsManagementPage,
  AllotmentsPage,
  ManagerDashboard,
  ReceptionistDashboard,
  ServerDashboard,
  UnifiedBIDashboard
} from "@/routes.lazy";

const POSAfricanPage = lazy(() => import("@/pages/POSAfricanPage"));
const DiscoveryPage = lazy(() => import("@/features/discovery/pages/DiscoveryPage").then(m => ({ default: m.DiscoveryPage })));

// ===== FALLBACK COMPONENTS =====
const DashboardSkeleton = () => <PageSkeleton title="Chargement du tableau de bord..." showHeader showStats showContent />;
const SettingsSkeleton = () => <PageSkeleton title="Chargement des paramètres..." showHeader showContent />;
const DataSkeleton = () => <PageSkeleton title="Chargement des données..." showHeader showContent />;

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
      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/welcome" element={<AuthLanding />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/pos/login" element={<POSLoginSecurePage />} />
      <Route path="/pos/login-secure" element={<POSLoginSecurePage />} />
      
      {/* ===== ENTRY POINT ===== */}
      <Route index element={<RequireAuth><Index /></RequireAuth>} />
      
      {/* ===== CORE BUSINESS ROUTES ===== */}
      <Route path="dashboard" element={
        <RequireAuth>
          <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="business-intelligence" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <UnifiedBIDashboard />
          </Suspense>
        </RequireAuth>
      } />
      
      {/* ===== ROLE-BASED DASHBOARDS ===== */}
      <Route path="dashboard/receptionist" element={
        <RequireAuth>
          <Suspense fallback={<DashboardSkeleton />}>
            <ReceptionistDashboard />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="dashboard/server" element={
        <RequireAuth>
          <Suspense fallback={<DashboardSkeleton />}>
            <ServerDashboard />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="dashboard/manager" element={
        <RequireAuth>
          <Suspense fallback={<DashboardSkeleton />}>
            <ManagerDashboard />
          </Suspense>
        </RequireAuth>
      } />
      
      {/* ===== RACK & RESERVATIONS ===== */}
      <Route path="reservations" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <ReservationsPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="reservations/new/quick" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <QuickReservationPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="reservations/new/advanced" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <AdvancedReservationPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="reservations/rack" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <RackPage />
          </Suspense>
        </RequireAuth>
      } />
      <Route path="rack" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <RackPage />
          </Suspense>
        </RequireAuth>
      } />
      
      {/* ===== ARRIVALS & DEPARTURES ===== */}
      <Route path="arrivals" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <ArrivalsPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="departures" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <DeparturesPage />
          </Suspense>
        </RequireAuth>
      } />
      
      {/* ===== SETTINGS ROUTES ===== */}
      <Route path="settings" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <SettingsHomePage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="settings/hotel" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <HotelSettingsFormPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="settings/rooms" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <RoomsSettingsPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="settings/services" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <ServicesSettingsPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="settings/tariffs" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <TariffsSettingsPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="settings/payments" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <PaymentsPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="settings/users" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <UsersPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="settings/system" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <SystemSettingsPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="settings/templates" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <TemplatesPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="settings/analytics" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <SettingsAnalyticsPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="settings/security" element={
        <RequireAuth>
          <Suspense fallback={<SettingsSkeleton />}>
            <SecurityPage />
          </Suspense>
        </RequireAuth>
      } />
      
      {/* ===== LEGACY LAYOUT ROUTES (To be migrated) ===== */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="reservations/groups" element={
          <Suspense fallback={<DataSkeleton />}>
            <GroupsManagementPage />
          </Suspense>
        } />
        
        <Route path="reservations/allotments" element={
          <Suspense fallback={<DataSkeleton />}>
            <AllotmentsPage />
          </Suspense>
        } />
        
        <Route path="cardex" element={
          <Suspense fallback={<DataSkeleton />}>
            <CardexPage />
          </Suspense>
        } />
        
        <Route path="night-audit" element={
          <Suspense fallback={<DataSkeleton />}>
            <NightAuditPage />
          </Suspense>
        } />
        
        {/* ===== POS ROUTES ===== */}
        <Route path="pos" element={
          <RequirePOSAuth>
            <Suspense fallback={<DataSkeleton />}>
              <POSPage />
            </Suspense>
          </RequirePOSAuth>
        } />
        
        <Route path="pos/terminal" element={
          <RequirePOSAuth>
            <Suspense fallback={<DataSkeleton />}>
              <POSTerminalPage />
            </Suspense>
          </RequirePOSAuth>
        } />
        
        <Route path="pos/african" element={
          <RequirePOSAuth requiredRole="pos_server">
            <Suspense fallback={<DataSkeleton />}>
              <POSAfricanPage />
            </Suspense>
          </RequirePOSAuth>
        } />
      </Route>
      
      {/* ===== OTHER ROUTES ===== */}
      <Route path="guests" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <GuestsPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="analytics" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <AnalyticsPage />
          </Suspense>
        </RequireAuth>
      } />
      
      <Route path="guide" element={
        <RequireAuth>
          <Suspense fallback={<DataSkeleton />}>
            <DiscoveryPage />
          </Suspense>
        </RequireAuth>
      } />
      
      {/* ===== CATCH ALL ===== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}