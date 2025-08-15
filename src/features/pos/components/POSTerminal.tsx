import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TButton } from "@/core/ui/TButton";
import { ModernPOSHeader } from "./ModernPOSHeader";
import { ModernTicketPanel } from "./ModernTicketPanel";
import { ModernProductCatalog } from "./ModernProductCatalog";
import { ModernActionsPanel } from "./ModernActionsPanel";
import { TableSelector } from "./TableSelector";
import { ComprehensivePaymentDialog } from "./ComprehensivePaymentDialog";
import { SplitBillDialog } from "./SplitBillDialog";
import { TableTransferDialog } from "./TableTransferDialog";
import { ModernOutletSelector } from "./ModernOutletSelector";
import { usePOSOutlets, useCurrentPOSSession, useCreatePOSOrder, useOpenPOSSession } from "../hooks/usePOSData";
import { useToast } from "@/hooks/use-toast";
import type { POSOutlet, POSTable, CartItem } from "../types";

export function POSTerminal() {
  const [selectedOutlet, setSelectedOutlet] = useState<POSOutlet | null>(null);
  const [selectedTable, setSelectedTable] = useState<POSTable | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerCount, setCustomerCount] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [isTableTransferOpen, setIsTableTransferOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [discountApplied, setDiscountApplied] = useState({ type: 'none', value: 0 });

  const { data: outlets = [] } = usePOSOutlets();
  const { data: currentSession } = useCurrentPOSSession(selectedOutlet?.id);
  const createOrder = useCreatePOSOrder();
  const openSession = useOpenPOSSession();
  const { toast } = useToast();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case 'F2':
          e.preventDefault();
          handleSendToKitchen();
          break;
        case 'F4':
          e.preventDefault();
          handleTransferTable();
          break;
        case 'F6':
          e.preventDefault();
          handleSplitBill();
          break;
        case 'F10':
          e.preventDefault();
          handleCheckout();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems.length]);

  const handleAddToCart = (product: any, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + quantity, total_price: (item.quantity + quantity) * item.unit_price }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        order_id: '',
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity,
        unit_price: product.base_price,
        total_price: product.base_price * quantity,
        status: 'pending',
        created_at: new Date().toISOString(),
        product,
        fireRound: 1, // Default to first round
      };
      setCartItems([...cartItems, newItem]);
    }
    
    // Touch feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product_id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    setCartItems(cartItems.map(item =>
      item.product_id === productId
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    ));
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxRate = 18; // Default tax rate
    const serviceChargeRate = 10; // Default service charge
    
    let adjustedSubtotal = subtotal;
    
    // Apply discount
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

  // New handler functions for modern interface
  const handleDuplicateItem = (productId: string) => {
    const item = cartItems.find(item => item.product_id === productId);
    if (item) {
      handleAddToCart(item.product, 1);
      toast({
        title: "Article dupliqué",
        description: `${item.product_name} ajouté au panier`,
      });
    }
  };

  const handleTransferItem = (productId: string) => {
    // Implementation for transferring item to another table/order
    toast({
      title: "Transfert d'article",
      description: "Fonctionnalité à implémenter",
    });
  };

  const handleCancelItem = (productId: string, reason: string) => {
    const item = cartItems.find(item => item.product_id === productId);
    if (item) {
      setCartItems(cartItems.map(item =>
        item.product_id === productId 
          ? { ...item, status: 'cancelled', special_instructions: `Annulé: ${reason}` }
          : item
      ));
      toast({
        title: "Article annulé",
        description: `${item.product_name} - ${reason}`,
        variant: "destructive",
      });
    }
  };

  const handleSendToKitchen = () => {
    if (cartItems.length === 0) return;
    
    setCartItems(cartItems.map(item => ({ ...item, status: 'sent' })));
    toast({
      title: "Commande envoyée",
      description: "La commande a été envoyée en cuisine",
    });
  };

  const handleSplitBill = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des articles avant de séparer l'addition",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedTable) {
      toast({
        title: "Table requise",
        description: "Sélectionnez une table avant de séparer l'addition",
        variant: "destructive"
      });
      return;
    }

    setIsSplitBillOpen(true);
  };

  const handleTransferTable = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des articles avant de transférer",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTable) {
      toast({
        title: "Table requise",
        description: "Sélectionnez une table avant le transfert",
        variant: "destructive"
      });
      return;
    }

    setIsTableTransferOpen(true);
  };

  const handleApplyDiscount = (type: 'percentage' | 'amount', value: number) => {
    setDiscountApplied({ type, value });
    toast({
      title: "Remise appliquée",
      description: type === 'percentage' ? `${value}% de remise` : `${value} FCFA de remise`,
    });
  };

  const handleRoomCharge = (roomId: string) => {
    if (cartItems.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des articles avant de facturer à la chambre",
        variant: "destructive"
      });
      return;
    }
    setIsPaymentOpen(true);
    toast({
      title: "Room Charge",
      description: `Mode facturation chambre ${roomId} activé`,
    });
  };

  const handleSelectPrinter = (stationType: 'hot' | 'cold' | 'bar') => {
    toast({
      title: "Station sélectionnée",
      description: `Station ${stationType} active`,
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setIsPaymentOpen(true);
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedTable(null);
    setCustomerCount(1);
    setDiscountApplied({ type: 'none', value: 0 });
    setSearchQuery("");
  };

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

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      {/* Modern Header */}
      <ModernPOSHeader
        selectedOutlet={selectedOutlet}
        currentSession={currentSession}
        selectedTable={selectedTable}
        customerCount={customerCount}
        onCustomerCountChange={setCustomerCount}
        onChangeOutlet={() => setSelectedOutlet(null)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Modern 3-Column Layout: 35% - 45% - 20% */}
      <div className="grid grid-cols-12 min-h-[calc(100vh-7rem)] gap-4 p-4">
        {/* Left Column - Ticket Panel (35%) */}
        <div className="col-span-4">
          <div className="h-full glass-card rounded-2xl shadow-elevate overflow-hidden">
            <ModernTicketPanel
              items={cartItems}
              selectedTable={selectedTable}
              customerCount={customerCount}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveFromCart}
              onDuplicateItem={handleDuplicateItem}
              onTransferItem={handleTransferItem}
              onCancelItem={handleCancelItem}
              onSendToKitchen={handleSendToKitchen}
              onCheckout={handleCheckout}
              onSplitBill={handleSplitBill}
              onTransferTable={handleTransferTable}
              totals={totals}
            />
          </div>
        </div>

        {/* Center Column - Product Navigator (45%) */}
        <div className="col-span-5">
          <div className="h-full flex flex-col glass-card rounded-2xl shadow-elevate overflow-hidden">
            {/* Table Selector */}
            <div className="p-6 border-b bg-gradient-to-r from-card/50 to-muted/10">
              <TableSelector
                outletId={selectedOutlet.id}
                selectedTable={selectedTable}
                onSelectTable={setSelectedTable}
              />
            </div>

            {/* Product Catalog */}
            <div className="flex-1 p-6 overflow-hidden">
              <ModernProductCatalog
                outletId={selectedOutlet.id}
                searchQuery={searchQuery}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Actions Panel (20%) */}
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

      <ComprehensivePaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cartItems={cartItems}
        subtotal={totals.subtotal}
        serviceCharge={totals.serviceCharge}
        taxAmount={totals.taxAmount}
        total={totals.total}
        onPaymentComplete={clearCart}
        tableNumber={selectedTable?.table_number}
        customerCount={customerCount}
      />

      <SplitBillDialog
        open={isSplitBillOpen}
        onOpenChange={setIsSplitBillOpen}
        orderId={currentOrderId}
        orderItems={cartItems.map(item => ({
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
        orderId={currentOrderId}
        currentTableId={selectedTable?.id}
        outletId={selectedOutlet.id}
      />
    </div>
  );
}