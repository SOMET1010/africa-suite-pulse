import { ModernPOSHeader } from "./ModernPOSHeader";
import type { POSOutlet, POSTable } from "../types";

interface Staff {
  id: string;
  name: string;
  role: 'cashier' | 'server';
  initials: string;
}

interface RestaurantPOSHeaderProps {
  selectedOutlet: POSOutlet;
  currentSession: any;
  selectedTable: POSTable | null;
  customerCount: number;
  serviceMode: 'direct' | 'table' | null;
  selectedStaff: Staff | null;
  searchQuery: string;
  onCustomerCountChange: (count: number) => void;
  onChangeOutlet: () => void;
  onQuickChangeMode: () => void;
  onQuickChangeStaff: () => void;
  onQuickChangeTable: () => void;
  onSearchChange: (query: string) => void;
}

export function RestaurantPOSHeader({
  selectedOutlet,
  currentSession,
  selectedTable,
  customerCount,
  serviceMode,
  selectedStaff,
  searchQuery,
  onCustomerCountChange,
  onChangeOutlet,
  onQuickChangeMode,
  onQuickChangeStaff,
  onQuickChangeTable,
  onSearchChange
}: RestaurantPOSHeaderProps) {
  return (
    <ModernPOSHeader
      selectedOutlet={selectedOutlet}
      currentSession={currentSession}
      selectedTable={selectedTable}
      customerCount={customerCount}
      onCustomerCountChange={onCustomerCountChange}
      onChangeOutlet={onChangeOutlet}
      onQuickChangeMode={onQuickChangeMode}
      onQuickChangeStaff={onQuickChangeStaff}
      onQuickChangeTable={onQuickChangeTable}
      serviceMode={serviceMode}
      selectedStaff={selectedStaff}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
    />
  );
}