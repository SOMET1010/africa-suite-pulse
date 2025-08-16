import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TButton } from "@/core/ui/TButton";
import { ModernPOSHeader } from "./ModernPOSHeader";
import { ModernTicketPanel } from "./ModernTicketPanel";
import { ModernProductCatalog } from "./ModernProductCatalog";
import { ModernActionsPanel } from "./ModernActionsPanel";
import { TableSelector } from "./TableSelector";
import { ModernPaymentDialog } from "./ModernPaymentDialog";
import { SplitBillDialog } from "./SplitBillDialog";
import { TableTransferDialog } from "./TableTransferDialog";
import { ModernOutletSelector } from "./ModernOutletSelector";
import { ServiceModeSelector } from "./ServiceModeSelector";
import { StaffSelector } from "./StaffSelector";
import { DirectSaleInterface } from "./DirectSaleInterface";
import { BusinessTypeSelector } from "./BusinessTypeSelector";
import { CollectivitesPOSInterface } from "./CollectivitesPOSInterface";
import { usePOSOutlets, useCurrentPOSSession, useOpenPOSSession } from "../hooks/usePOSData";
import { usePOSOrderState } from "../hooks/usePOSOrderState";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useToast } from "@/hooks/use-toast";
import type { POSOutlet, POSTable } from "../types";

interface Staff {
  id: string;
  name: string;
  role: 'cashier' | 'server';
  initials: string;
}

export function RestaurantPOSTerminal() {
  const [businessType, setBusinessType] = useState<string | null>(() => 
    sessionStorage.getItem('pos_business_type')
  );
  const [selectedOutlet, setSelectedOutlet] = useState<POSOutlet | null>(null);
  const [selectedTable, setSelectedTable] = useState<POSTable | null>(null);
  const [customerCount, setCustomerCount] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [isTableTransferOpen, setIsTableTransferOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discountApplied, setDiscountApplied] = useState({ type: 'none', value: 0 });
  
  // New state for workflow management with localStorage persistence
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
  const { toast } = useToast();

  // État centralisé des commandes
  const orderState = usePOSOrderState({ selectedOutlet, selectedTable });

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
      setDiscountApplied({ type: 'none', value: 0 });
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

  // Gestionnaires d'actions restauration
  const handleNewOrder = () => {
    if (!selectedTable) {
      toast({
        title: "Table requise",
        description: "Sélectionnez une table pour créer une commande",
        variant: "destructive"
      });
      return;
    }

    if (orderState.cartItems.length > 0) {
      toast({
        title: "Commande en cours",
        description: "Une commande est déjà en cours sur cette table",
        variant: "destructive"
      });
      return;
    }

    orderState.actions.createOrder(customerCount);
  };

  const handleAddToCart = (product: any, quantity: number = 1) => {
    // Créer automatiquement une commande si nécessaire
    if (!orderState.currentOrder) {
      if (!selectedTable) {
        toast({
          title: "Table requise",
          description: "Sélectionnez une table avant d'ajouter des articles",
          variant: "destructive"
        });
        return;
      }
      
      // Créer la commande d'abord
      orderState.actions.createOrder(customerCount);
      
      // L'ajout de l'article se fera via un effet après la création
      setTimeout(() => {
        orderState.actions.addItem(product, quantity);
      }, 100);
    } else {
      orderState.actions.addItem(product, quantity);
    }

    // Retour haptique sur mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const item = orderState.cartItems.find(item => item.product_id === productId);
    if (item) {
      orderState.actions.updateQuantity(item.id, quantity, item.unit_price);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    const item = orderState.cartItems.find(item => item.product_id === productId);
    if (item) {
      orderState.actions.removeItem(item.id);
    }
  };

  const handleSendToKitchen = () => {
    if (orderState.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Ajoutez des articles avant d'envoyer en cuisine",
        variant: "destructive"
      });
      return;
    }

    // Vérifier qu'il y a des articles en attente
    const pendingItems = orderState.cartItems.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) {
      toast({
        title: "Aucun nouvel article",
        description: "Tous les articles ont déjà été envoyés",
        variant: "destructive"
      });
      return;
    }

    orderState.actions.sendToKitchen();
  };

  const handleSplitBill = () => {
    if (orderState.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à séparer",
        variant: "destructive"
      });
      return;
    }
    
    setIsSplitBillOpen(true);
  };

  const handleTransferTable = () => {
    if (orderState.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à transférer",
        variant: "destructive"
      });
      return;
    }

    setIsTableTransferOpen(true);
  };

  const handleCheckout = () => {
    if (orderState.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à encaisser",
        variant: "destructive"
      });
      return;
    }
    
    setIsPaymentOpen(true);
  };

  const handleCancel = () => {
    // Logique d'annulation contextuelle
    if (isPaymentOpen) {
      setIsPaymentOpen(false);
    } else if (isSplitBillOpen) {
      setIsSplitBillOpen(false);
    } else if (isTableTransferOpen) {
      setIsTableTransferOpen(false);
    } else {
      // Annuler la commande courante
      if (orderState.cartItems.length > 0) {
        const confirmCancel = window.confirm("Annuler la commande en cours ?");
        if (confirmCancel) {
          orderState.actions.clearOrder();
          setSelectedTable(null);
        }
      }
    }
  };

  const handleApplyDiscount = (type: 'percentage' | 'amount', value: number) => {
    setDiscountApplied({ type, value });
    toast({
      title: "Remise appliquée",
      description: type === 'percentage' ? `${value}% de remise` : `${value} FCFA de remise`,
    });
  };

  const handleRoomCharge = (roomId: string) => {
    if (orderState.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à facturer",
        variant: "destructive"
      });
      return;
    }
    
    // Ouvrir le dialogue de paiement avec mode room charge
    setIsPaymentOpen(true);
    toast({
      title: "Room Charge activé",
      description: `Facturation sur chambre ${roomId}`,
    });
  };

  const handleSelectPrinter = (stationType: 'hot' | 'cold' | 'bar') => {
    toast({
      title: "Station sélectionnée",
      description: `Station ${stationType} active pour les prochains envois`,
    });
  };

  const calculateTotals = () => {
    const subtotal = orderState.cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxRate = 18; // TVA
    const serviceChargeRate = 10; // Service
    
    let adjustedSubtotal = subtotal;
    
    // Appliquer les remises
    if (discountApplied.type === 'percentage') {
      adjustedSubtotal = subtotal * (1 - discountApplied.value / 100);
    } else if (discountApplied.type === 'amount') {
      adjustedSubtotal = Math.max(0, subtotal - discountApplied.value);
    }
    
    const serviceCharge = adjustedSubtotal * (serviceChargeRate / 100);
    const taxAmount = (adjustedSubtotal + serviceCharge) * (taxRate / 100);
    
    return {
      subtotal: adjustedSubtotal,
      serviceCharge,
      taxAmount,
      total: adjustedSubtotal + serviceCharge + taxAmount,
      discount: subtotal - adjustedSubtotal,
    };
  };

  // ✅ REMOVED clearAll function - never force reset context
  // Individual clear functions for specific cases only
  const clearOrderOnly = () => {
    orderState.actions.clearOrder();
    setDiscountApplied({ type: 'none', value: 0 });
  };

  // ✅ Modern keyboard shortcuts with unified hook (after handlers are declared)
  useKeyboardShortcuts({
    onSendToKitchen: handleSendToKitchen,
    onCheckout: handleCheckout,
    onChangeTable: serviceMode === 'table' ? handleQuickChangeTable : undefined,
    onChangeMode: !orderState.cartItems.length ? handleQuickChangeMode : undefined,
    onChangeStaff: !orderState.cartItems.length ? handleQuickChangeStaff : undefined,
    onNewOrder: handleNewOrder,
    onSplitBill: handleSplitBill,
    onTransferTable: handleTransferTable,
    disabled: false
  });

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

  // Rendu conditionnel
  if (!selectedOutlet) {
    return <ModernOutletSelector outlets={outlets} onSelectOutlet={setSelectedOutlet} />;
  }

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

  // Table service mode - existing restaurant POS interface
  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      {/* Header avec informations contextuelles */}
      <ModernPOSHeader
        selectedOutlet={selectedOutlet}
        currentSession={currentSession}
        selectedTable={selectedTable}
        customerCount={customerCount}
        onCustomerCountChange={setCustomerCount}
        onChangeOutlet={handleBackToStaff}
        onQuickChangeMode={handleQuickChangeMode}
        onQuickChangeStaff={handleQuickChangeStaff}
        onQuickChangeTable={handleQuickChangeTable}
        serviceMode={serviceMode}
        selectedStaff={selectedStaff}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Layout 3 colonnes optimisé restauration */}
      <div className="grid grid-cols-12 min-h-[calc(100vh-7rem)] gap-4 p-4">
        {/* Colonne gauche - Ticket (35%) */}
        <div className="col-span-4">
          <div className="h-full glass-card rounded-2xl shadow-elevate overflow-hidden">
            <ModernTicketPanel
              items={orderState.cartItems}
              selectedTable={selectedTable}
              customerCount={customerCount}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveFromCart}
              onDuplicateItem={(productId) => {
                const item = orderState.cartItems.find(i => i.product_id === productId);
                if (item) handleAddToCart(item.product, 1);
              }}
              onTransferItem={(productId) => {
                toast({
                  title: "Transfert d'article",
                  description: "Sélectionnez la destination via F4",
                });
              }}
              onCancelItem={(productId) => {
                const item = orderState.cartItems.find(i => i.product_id === productId);
                if (item) handleRemoveFromCart(productId);
              }}
              onSendToKitchen={handleSendToKitchen}
              onCheckout={handleCheckout}
              onSplitBill={handleSplitBill}
              onTransferTable={handleTransferTable}
              totals={totals}
            />
          </div>
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
              <ModernProductCatalog
                outletId={selectedOutlet.id}
                searchQuery={searchQuery}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>

        {/* Colonne droite - Actions rapides (20%) */}
        <div className="col-span-3">
          <div className="h-full glass-card rounded-2xl shadow-elevate overflow-hidden">
            <ModernActionsPanel
              onApplyDiscount={handleApplyDiscount}
              onRoomCharge={handleRoomCharge}
              onSelectPrinter={handleSelectPrinter}
            />
          </div>
        </div>
      </div>

      {/* Dialogues */}
      {orderState.currentOrder && (
        <ModernPaymentDialog
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          order={orderState.currentOrder}
          cartItems={orderState.cartItems}
          totals={totals}
          onPaymentComplete={() => {
            setIsPaymentOpen(false);
            orderState.actions.clearOrder();
            // ✅ CRITICAL: Keep table selected for continuous service
            // Create new order on same table/same server immediately
            setTimeout(() => {
              if (selectedTable) {
                orderState.actions.createOrder(customerCount);
              }
              // Focus back on quick add for immediate next order
              const focusQuickAdd = () => {
                const el = document.getElementById('quick-add-input');
                if (el) (el as HTMLInputElement).focus();
              };
              focusQuickAdd();
            }, 100);
          }}
        />
      )}

      <SplitBillDialog
        open={isSplitBillOpen}
        onOpenChange={setIsSplitBillOpen}
        orderId={orderState.currentOrder?.id || ""}
        orderItems={orderState.cartItems.map(item => ({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))}
        orderTotal={totals.total}
      />

      <TableTransferDialog
        open={isTableTransferOpen}
        onOpenChange={setIsTableTransferOpen}
        orderId={orderState.currentOrder?.id || ""}
        currentTableId={selectedTable?.id}
        outletId={selectedOutlet?.id || ""}
      />

      {/* Indicateur de chargement */}
      {orderState.isLoading && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          Synchronisation...
        </div>
      )}
    </div>
  );
}
