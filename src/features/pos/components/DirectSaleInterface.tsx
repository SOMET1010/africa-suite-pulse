import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModernProductCatalog } from './ModernProductCatalog';
import { ModernPaymentDialog } from './ModernPaymentDialog';
import { Receipt, ArrowLeft, ShoppingCart } from 'lucide-react';
import { usePOSOrderState } from '../hooks/usePOSOrderState';
import { usePOSOutlets, useCurrentPOSSession } from '../hooks/usePOSData';
import type { CartItem } from '../types';

interface Staff {
  id: string;
  name: string;
  role: 'cashier' | 'server';
  initials: string;
}

interface DirectSaleInterfaceProps {
  staff: Staff;
  onBack: () => void;
}

export function DirectSaleInterface({ staff, onBack }: DirectSaleInterfaceProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [ticketNumber, setTicketNumber] = useState(1);
  
  // Use a mock outlet and table for direct sales
  const mockOutlet = { 
    id: 'direct-outlet', 
    name: 'Vente Directe', 
    org_id: 'mock',
    code: 'DIRECT',
    outlet_type: 'restaurant' as const,
    settings: {},
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const mockTable = { 
    id: 'direct-table', 
    name: `Ticket #${ticketNumber}`, 
    capacity: 1,
    org_id: 'mock',
    outlet_id: 'direct-outlet',
    table_number: ticketNumber.toString(),
    status: 'available' as const,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: outlets } = usePOSOutlets();
  const selectedOutlet = outlets?.[0] || mockOutlet;
  
  const { data: session } = useCurrentPOSSession(selectedOutlet.id);
  
  const orderState = usePOSOrderState({ 
    selectedOutlet, 
    selectedTable: mockTable 
  });

  // Initialize order for direct sale
  useEffect(() => {
    if (!orderState.currentOrder && !orderState.isLoading && session) {
      orderState.actions.createOrder(1);
    }
  }, [orderState.currentOrder, orderState.isLoading, session, selectedOutlet.id, staff, ticketNumber]);

  const calculateTotals = () => {
    const subtotal = orderState.cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxRate = 0.18; // 18% VAT
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      total,
      serviceCharge: 0
    };
  };

  const totals = calculateTotals();

  const handleCheckout = () => {
    if (orderState.cartItems.length === 0) return;
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentDialog(false);
    orderState.actions.clearOrder();
    // Generate next ticket number for continuous service
    setTicketNumber(prev => prev + 1);
    // Automatically create new order for next sale (same staff context)
    setTimeout(() => {
      orderState.actions.createOrder(1);
      // Focus back on quick add for immediate next sale
      const focusQuickAdd = () => {
        const el = document.getElementById('quick-add-input');
        if (el) (el as HTMLInputElement).focus();
      };
      focusQuickAdd();
    }, 100);
  };

  if (orderState.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Initialisation de la vente directe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Vente Directe</h1>
              <p className="text-muted-foreground">
                Vendeur: {staff.name} • Ticket #{ticketNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{totals.total.toFixed(0)} FCFA</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Catalog */}
          <div className="lg:col-span-2">
            <ModernProductCatalog
              outletId={selectedOutlet.id}
              searchQuery=""
              onAddToCart={(product, quantity = 1) => {
                orderState.actions.addItem(product, quantity);
              }}
            />
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Commande Actuelle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderState.cartItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun article dans la commande
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {orderState.cartItems.map((item: CartItem) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × {item.unit_price.toFixed(0)} FCFA
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.total_price.toFixed(0)} FCFA</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sous-total:</span>
                        <span>{totals.subtotal.toFixed(0)} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>TVA (18%):</span>
                        <span>{totals.taxAmount.toFixed(0)} FCFA</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{totals.total.toFixed(0)} FCFA</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      className="w-full"
                      size="lg"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Encaisser
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      {showPaymentDialog && orderState.currentOrder && (
        <ModernPaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          order={orderState.currentOrder}
          cartItems={orderState.cartItems}
          totals={totals}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}