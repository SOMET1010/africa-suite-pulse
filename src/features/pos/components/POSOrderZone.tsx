import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, Users, Plus, Minus, Trash2, 
  ChefHat, Receipt, Clock, Send 
} from 'lucide-react';

import { CartItem } from '../types';

interface POSOrderZoneProps {
  cartItems: CartItem[];
  selectedTable: any;
  customerCount: number;
  totals: {
    subtotal: number;
    serviceCharge: number;
    taxAmount: number;
    total: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onSendToKitchen: () => void;
  onShowBillPreview: () => void;
  onCustomerCountChange: (count: number) => void;
}

export const POSOrderZone: React.FC<POSOrderZoneProps> = ({
  cartItems,
  selectedTable,
  customerCount,
  totals,
  onUpdateQuantity,
  onRemoveFromCart,
  onSendToKitchen,
  onShowBillPreview,
  onCustomerCountChange
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'served': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'sent': return 'Envoyé';
      case 'served': return 'Servi';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">COMMANDE EN COURS</h2>
            </div>
            <Badge variant="outline">Nouveau ticket</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {selectedTable ? (
              <span>Table {selectedTable.table_number}</span>
            ) : (
              <span>Aucune table sélectionnée</span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {customerCount} couverts
            </span>
          </div>
        </div>

        {/* État vide */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Commande vide</h3>
            <p className="text-muted-foreground">
              Sélectionnez des produits pour commencer
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header avec infos table */}
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">COMMANDE EN COURS</h2>
          </div>
          <Badge variant="secondary">
            {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4 text-sm">
            {selectedTable ? (
              <span className="font-medium">Table {selectedTable.table_number}</span>
            ) : (
              <span className="text-muted-foreground">Aucune table</span>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="tap-target h-11 w-11 p-0 press-feedback"
                onClick={() => onCustomerCountChange(Math.max(1, customerCount - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex items-center gap-1 px-3 py-2 min-w-[60px] justify-center">
                <Users className="h-4 w-4" />
                {customerCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="tap-target h-11 w-11 p-0 press-feedback"
                onClick={() => onCustomerCountChange(customerCount + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-bold text-primary">
              {totals.total.toLocaleString()} F
            </div>
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cartItems.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-base">{item.product?.name || item.product_name}</h4>
                  <div className="text-sm text-muted-foreground">
                    {item.unit_price.toLocaleString()} F/unité
                  </div>
                </div>
                
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(item.status || 'pending')}`}
                >
                  {getStatusLabel(item.status || 'pending')}
                </Badge>
              </div>

              {item.special_instructions && (
                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <span className="text-sm text-blue-800">
                    📝 {item.special_instructions}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 touch-spacing">
                <Button
                  variant="outline"
                  size="sm"
                  className="tap-target h-11 w-11 p-0 press-feedback"
                  onClick={() => onUpdateQuantity(item.product_id || item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="min-w-[48px] text-center text-lg font-bold tap-target flex items-center justify-center">
                  {item.quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="tap-target h-11 w-11 p-0 press-feedback"
                  onClick={() => onUpdateQuantity(item.product_id || item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="tap-target h-11 w-11 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 press-feedback"
                  onClick={() => onRemoveFromCart(item.product_id || item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-primary">
                    {(item.total_price || (item.unit_price * item.quantity)).toLocaleString()} F
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Totaux */}
      <div className="p-4 border-t bg-card">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Sous-total</span>
            <span className="font-medium">{totals.subtotal.toLocaleString()} F</span>
          </div>
          {totals.serviceCharge > 0 && (
            <div className="flex justify-between text-sm">
              <span>Service (10%)</span>
              <span className="font-medium">{totals.serviceCharge.toLocaleString()} F</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>TVA (18%)</span>
            <span className="font-medium">{totals.taxAmount.toLocaleString()} F</span>
          </div>
          <div className="border-t pt-2 bg-soft-primary/20 rounded-lg p-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total TTC</span>
              <span className="text-xl font-bold text-primary">
                {totals.total.toLocaleString()} F
              </span>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3 touch-spacing">
          <Button
            onClick={onSendToKitchen}
            disabled={cartItems.length === 0 || !selectedTable}
            className="w-full tap-target bg-info hover:bg-info/90 text-info-foreground press-feedback"
          >
            <Send className="h-4 w-4 mr-2" />
            Envoyer en cuisine (F3)
          </Button>
          
          <Button
            onClick={onShowBillPreview}
            disabled={cartItems.length === 0 || !selectedTable}
            className="w-full tap-target bg-warning hover:bg-warning/90 text-warning-foreground press-feedback"
            variant="secondary"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Addition (F2)
          </Button>
        </div>
      </div>
    </div>
  );
};