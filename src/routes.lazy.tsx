import { lazy } from 'react';

// ============= LAZY LOADED COMPONENTS =============
// Critical performance optimization: Split heavy components into separate chunks

// POS System - Heavy components with complex state management
export const POSPage = lazy(() => import('@/features/pos/POSPage'));
export const POSKitchenPage = lazy(() => import('@/features/pos/pages/POSKitchenPage').then(m => ({ default: m.default })));
export const RestaurantPOSLayout = lazy(() => import('@/features/pos/components/RestaurantPOSLayout').then(m => ({ default: m.RestaurantPOSLayout })));
export const MobileServerInterface = lazy(() => import('@/features/pos/components/MobileServerInterface').then(m => ({ default: m.MobileServerInterface })));
export const POSReportsPage = lazy(() => import('@/features/pos/components/POSReportsPage').then(m => ({ default: m.POSReportsPage })));

// Dashboard Modules - Data-heavy components with charts
export const ManagerDashboard = lazy(() => import('@/features/dashboards/ManagerDashboard').then(m => ({ default: m.ManagerDashboard })));
export const ReceptionistDashboard = lazy(() => import('@/features/dashboards/ReceptionistDashboard').then(m => ({ default: m.ReceptionistDashboard })));
export const ServerDashboard = lazy(() => import('@/features/dashboards/ServerDashboard').then(m => ({ default: m.ServerDashboard })));

// Reports - Heavy data processing and export functionality
export const DailyReportsPage = lazy(() => import('@/features/reports/daily/DailyReportsPage'));
export const AdvancedAnalytics = lazy(() => import('@/features/analytics/AdvancedAnalytics'));

// Settings Modules - Large forms and configuration panels
export const SystemSettingsPage = lazy(() => import('@/features/settings/system/SystemSettingsPage'));
export const SecurityPage = lazy(() => import('@/features/settings/security/SecurityPage'));
export const TemplatesPage = lazy(() => import('@/features/templates/components/TemplatesPage'));

// Monitoring System - Real-time data processing (using existing exports)
export const MonitoringDashboard = lazy(() => import('@/features/monitoring').then(m => ({ default: m.MonitoringDashboard })));
export const MonitoringIncidents = lazy(() => import('@/features/monitoring').then(m => ({ default: m.MonitoringIncidents })));

// Specialty Features
export const CardexPage = lazy(() => import('@/features/cardex/CardexPage'));
export const NightAuditPage = lazy(() => import('@/features/night-audit').then(m => ({ default: m.NightAuditPage })));
export const GroupsManagementPage = lazy(() => import('@/features/reservations/GroupsManagementPage'));
export const AllotmentsPage = lazy(() => import('@/features/reservations/AllotmentsPage'));

// Page Wrappers - These import the lazy components above
export const POSTerminalPage = lazy(() => import('@/pages/POSTerminalPage'));
export const POSInventoryPage = lazy(() => import('@/pages/POSInventoryPage'));
export const POSSessionsPage = lazy(() => import('@/pages/POSSessionsPage'));
export const POSUsersPage = lazy(() => import('@/pages/POSUsersPage'));
export const POSSettingsPage = lazy(() => import('@/pages/POSSettingsPage'));
export const POSMaitreHotelPage = lazy(() => import('@/pages/POSMaitreHotelPage'));
export const POSServerPage = lazy(() => import('@/pages/POSServerPage'));
export const POSCustomersPage = lazy(() => import('@/pages/POSCustomersPage'));
export const POSKitchen = lazy(() => import('@/pages/POSKitchen'));
export const POSReports = lazy(() => import('@/pages/POSReports'));
export const POSMobileServerPage = lazy(() => import('@/pages/POSMobileServerPage'));