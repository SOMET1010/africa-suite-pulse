import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TButton } from "@/core/ui/TButton";
import { RestaurantPOSHeader } from "./RestaurantPOSHeader";
import { RestaurantOrderPanel } from "./RestaurantOrderPanel";
import { RestaurantActionBar } from "./RestaurantActionBar";
import { RestaurantPaymentFlow } from "./RestaurantPaymentFlow";
import { MarketTilesCatalog } from "./MarketTilesCatalog";
import { StockAlertsPanel } from "./StockAlertsPanel";
import { TableSelector } from "./TableSelector";
import { ModernOutletSelector } from "./ModernOutletSelector";
import { ServiceModeSelector } from "./ServiceModeSelector";
import { StaffSelector } from "./StaffSelector";
import { DirectSaleInterface } from "./DirectSaleInterface";
import { BusinessTypeSelector } from "./BusinessTypeSelector";
import { CollectivitesPOSInterface } from "./CollectivitesPOSInterface";
import { BusinessProvider } from "./BusinessProvider";
import { usePOSOutlets, useCurrentPOSSession, useOpenPOSSession } from "../hooks/usePOSData";
import { useRestaurantPOSLogic } from "../hooks/useRestaurantPOSLogic";
import type { POSOutlet, POSTable } from "../types";

interface Staff {
  id: string;
  name: string;
  role: 'cashier' | 'server';
  initials: string;
}

export function RestaurantPOSLayout() {
  const [businessType, setBusinessType] = useState<string | null>(() => 
    sessionStorage.getItem('pos_business_type')
  );
  const [selectedOutlet, setSelectedOutlet] = useState<POSOutlet | null>(null);
  const [selectedTable, setSelectedTable] = useState<POSTable | null>(null);
  const [customerCount, setCustomerCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Workflow management with localStorage persistence
  const [serviceMode, setServiceMode] = useState<'direct' | 'table' | null>(() => {
    return localStorage.getItem('pos-service-mode') as 'direct' | 'table' | null;
  });
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(() => {
    const stored = localStorage.getItem('pos-selected-staff');
    return stored ? JSON.parse(stored) : null;
  });
  const [currentStep, setCurrentStep] = useState<'mode' | 'staff' | 'pos'>(() => {
    if (serviceMode && selectedStaff) return 'pos';
    if (serviceMode) return 'staff';
    return 'mode';
  });

  const { data: outlets = [] } = usePOSOutlets();
  const { data: currentSession } = useCurrentPOSSession(selectedOutlet?.id);
  const openSession = useOpenPOSSession();

  // Restaurant POS Logic Hook
  const logic = useRestaurantPOSLogic({ selectedOutlet, selectedTable, customerCount });

  // Workflow handlers with localStorage persistence
  const handleModeSelect = (mode: 'direct' | 'table') => {
    setServiceMode(mode);
    localStorage.setItem('pos-service-mode', mode);
    setCurrentStep('staff');
  };

  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff);
    localStorage.setItem('pos-selected-staff', JSON.stringify(staff));
    setCurrentStep('pos');
  };

  const handleBackToMode = () => {
    setServiceMode(null);
    setSelectedStaff(null);
    localStorage.removeItem('pos-service-mode');
    localStorage.removeItem('pos-selected-staff');
    setCurrentStep('mode');
  };

  const handleBackToStaff = () => {
    setSelectedStaff(null);
    localStorage.removeItem('pos-selected-staff');
    setCurrentStep('staff');
  };

  // Quick change handlers for continuous service
  const handleQuickChangeMode = () => {
    setCurrentStep('mode');
  };

  const handleQuickChangeStaff = () => {
    setCurrentStep('staff');
  };

  const handleQuickChangeTable = () => {
    setSelectedTable(null);
  };

  // Reset state when switching outlets
  useEffect(() => {
    if (selectedOutlet) {
      setSelectedTable(null);
      setCustomerCount(1);
      setSearchQuery('');
      // Only reset workflow when changing outlet, not when continuing service
      if (!serviceMode || !selectedStaff) {
        setServiceMode(null);
        setSelectedStaff(null);
        localStorage.removeItem('pos-service-mode');
        localStorage.removeItem('pos-selected-staff');
        setCurrentStep('mode');
      }
    }
  }, [selectedOutlet]);

  // Enhanced payment complete handler
  const handlePaymentComplete = () => {
    logic.setIsPaymentOpen(false);
    logic.clearOrderOnly();
    // Keep table selected for continuous service
    setTimeout(() => {
      if (selectedTable) {
        logic.handleNewOrder();
      }
    }, 100);
  };

  // Business type selection first
  if (!businessType) {
    return <BusinessTypeSelector onBusinessTypeSelect={setBusinessType} />;
  }

  // Collectivités mode - direct interface
  if (businessType === 'collectivites') {
    return (
      <div className="p-6">
        <CollectivitesPOSInterface onBack={() => setBusinessType(null)} />
      </div>
    );
  }

  // Outlet selection
  if (!selectedOutlet) {
    return <ModernOutletSelector outlets={outlets} onSelectOutlet={setSelectedOutlet} />;
  }

  // Session check
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Session fermée</h2>
            <p className="text-muted-foreground mb-6">
              Aucune session POS n'est ouverte pour {selectedOutlet.name}
            </p>
            <div className="space-y-3">
              <TButton 
                onClick={() => openSession.mutate({ outletId: selectedOutlet.id, openingCash: 0 })}
                disabled={openSession.isPending}
                className="w-full"
              >
                {openSession.isPending ? "Ouverture..." : "Ouvrir une session"}
              </TButton>
              <TButton variant="default" onClick={() => setSelectedOutlet(null)} className="w-full">
                Changer de point de vente
              </TButton>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Workflow management - show appropriate step
  if (currentStep === 'mode') {
    return <ServiceModeSelector onModeSelect={handleModeSelect} />;
  }

  if (currentStep === 'staff') {
    return (
      <StaffSelector 
        mode={serviceMode!}
        onStaffSelect={handleStaffSelect}
        onBack={handleBackToMode}
      />
    );
  }

  // Direct sale mode
  if (serviceMode === 'direct' && selectedStaff) {
    return (
      <DirectSaleInterface 
        staff={selectedStaff}
        onBack={handleBackToStaff}
      />
    );
  }

  // Table service mode - main restaurant POS interface
  const totals = logic.calculateTotals();

  return (
    <BusinessProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
        {/* Header */}
        <RestaurantPOSHeader
          selectedOutlet={selectedOutlet}
          currentSession={currentSession}
          selectedTable={selectedTable}
          customerCount={customerCount}
          serviceMode={serviceMode}
          selectedStaff={selectedStaff}
          searchQuery={searchQuery}
          onCustomerCountChange={setCustomerCount}
          onChangeOutlet={handleBackToStaff}
          onQuickChangeMode={handleQuickChangeMode}
          onQuickChangeStaff={handleQuickChangeStaff}
          onQuickChangeTable={handleQuickChangeTable}
          onSearchChange={setSearchQuery}
        />

        {/* Layout 3 colonnes optimisé restauration */}
        <div className="grid grid-cols-12 min-h-[calc(100vh-7rem)] gap-4 p-4">
          {/* Colonne gauche - Ticket (35%) */}
          <div className="col-span-4">
            <RestaurantOrderPanel
              items={logic.orderState.cartItems}
              selectedTable={selectedTable}
              customerCount={customerCount}
              totals={totals}
              onUpdateQuantity={logic.handleUpdateQuantity}
              onRemoveFromCart={logic.handleRemoveFromCart}
              onAddToCart={logic.handleAddToCart}
              onSendToKitchen={logic.handleSendToKitchen}
              onCheckout={logic.handleCheckout}
              onSplitBill={logic.handleSplitBill}
              onTransferTable={logic.handleTransferTable}
            />
          </div>

          {/* Colonne centrale - Catalogue produits (45%) */}
          <div className="col-span-5">
            <div className="h-full flex flex-col glass-card rounded-2xl shadow-elevate overflow-hidden">
              {/* Sélecteur de table */}
              <div className="p-6 border-b bg-gradient-to-r from-card/50 to-muted/10">
                <TableSelector
                  outletId={selectedOutlet.id}
                  selectedTable={selectedTable}
                  onSelectTable={setSelectedTable}
                />
              </div>

              {/* Catalogue produits */}
              <div className="flex-1 p-6 overflow-hidden">
                <MarketTilesCatalog
                  outletId={selectedOutlet.id}
                  searchQuery={searchQuery}
                  onAddToCart={logic.handleAddToCart}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </div>
          </div>

          {/* Colonne droite - Actions rapides (20%) */}
          <div className="col-span-3 space-y-4">
            <RestaurantActionBar
              onApplyDiscount={logic.handleApplyDiscount}
              onRoomCharge={logic.handleRoomCharge}
              onSelectPrinter={logic.handleSelectPrinter}
            />
            <StockAlertsPanel outletId={selectedOutlet.id} />
          </div>
        </div>

        {/* Payment Flow Dialogs */}
        <RestaurantPaymentFlow
          isBillPreviewOpen={logic.isBillPreviewOpen}
          onCloseBillPreview={() => logic.setIsBillPreviewOpen(false)}
          onProceedToPayment={logic.handleProceedToPayment}
          isPaymentOpen={logic.isPaymentOpen}
          onClosePayment={() => logic.setIsPaymentOpen(false)}
          currentOrder={logic.orderState.currentOrder}
          cartItems={logic.orderState.cartItems}
          totals={totals}
          onPaymentComplete={handlePaymentComplete}
          isSplitBillOpen={logic.isSplitBillOpen}
          onCloseSplitBill={() => logic.setIsSplitBillOpen(false)}
          isTableTransferOpen={logic.isTableTransferOpen}
          onCloseTableTransfer={() => logic.setIsTableTransferOpen(false)}
          selectedTable={selectedTable}
          selectedOutlet={selectedOutlet}
        />

        {/* Loading indicator */}
        {logic.orderState.isLoading && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
            Synchronisation...
          </div>
        )}
      </div>
    </BusinessProvider>
  );
}
