import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  Users,
  Send,
  CreditCard,
  Split,
  ArrowRight,
  Copy,
  Ban,
  Edit
} from "lucide-react";
import type { CartItem, POSTable } from "../types";

interface ModernTicketPanelProps {
  items: CartItem[];
  selectedTable: POSTable | null;
  customerCount: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onDuplicateItem: (productId: string) => void;
  onTransferItem: (productId: string) => void;
  onCancelItem: (productId: string, reason: string) => void;
  onSendToKitchen: () => void;
  onCheckout: () => void;
  onSplitBill: () => void;
  onTransferTable: () => void;
  totals: {
    subtotal: number;
    serviceCharge: number;
    taxAmount: number;
    total: number;
  };
}

export function ModernTicketPanel({
  items,
  selectedTable,
  customerCount,
  onUpdateQuantity,
  onRemoveItem,
  onDuplicateItem,
  onTransferItem,
  onCancelItem,
  onSendToKitchen,
  onCheckout,
  onSplitBill,
  onTransferTable,
  totals
}: ModernTicketPanelProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Group items by fire round (vague d'envoi)
  const groupedItems = items.reduce((acc, item) => {
    const round = (item as any).fireRound || 1;
    if (!acc[round]) acc[round] = [];
    acc[round].push(item);
    return acc;
  }, {} as Record<number, CartItem[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'served': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header - Table/Chambre */}
        <div className="p-6 border-b bg-gradient-to-r from-card to-muted/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold font-luxury">Ticket courant</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {selectedTable ? (
                    <span>Table {selectedTable.number}</span>
                  ) : (
                    <span>Aucune table</span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {customerCount} pers.
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="glass-card border-0 bg-gradient-to-r from-primary/10 to-accent/10">
              Nouveau
            </Badge>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center glass-card rounded-3xl p-12 max-w-sm shadow-elevate">
            <ShoppingCart className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3 font-luxury">
              Ticket vide
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sélectionnez des produits dans le catalogue pour commencer une nouvelle commande
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Table/Chambre */}
      <div className="p-6 border-b bg-gradient-to-r from-card to-muted/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold font-luxury">Ticket courant</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {selectedTable ? (
                  <span>Table {selectedTable.number}</span>
                ) : (
                  <span>Aucune table</span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {customerCount} couverts
                </span>
                <Badge variant="outline" className="glass-card border-0 bg-green-100 text-green-800">
                  En cours
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-0">
              {items.length} {items.length !== 1 ? 'articles' : 'article'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Items grouped by fire round */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <div className="p-6 space-y-6">
          {Object.entries(groupedItems).map(([round, roundItems]) => (
            <div key={round} className="space-y-3">
              {/* Round header */}
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <div className="h-px flex-1 bg-border"></div>
                <span className="px-3 py-1 bg-muted rounded-full">
                  Vague {round}
                </span>
                <div className="h-px flex-1 bg-border"></div>
              </div>

              {/* Round items */}
              {roundItems.map((item) => (
                <Card key={item.id} className="overflow-hidden glass-card border-0 shadow-soft rounded-xl transition-elegant hover:scale-[1.01]">
                  <div className="p-4">
                    {/* Product Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base leading-tight font-luxury truncate">
                          {item.product_name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground font-medium">
                            {item.unit_price.toLocaleString()} F/unité
                          </span>
                          {item.product.preparation_time && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{item.product.preparation_time}min</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item actions */}
                      <div className="flex items-center gap-1 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDuplicateItem(item.product_id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary rounded-lg"
                          title="Dupliquer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTransferItem(item.product_id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600 rounded-lg"
                          title="Transférer"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancelItem(item.product_id, "Demande client")}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive rounded-lg"
                          title="Annuler"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.product_id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {item.special_instructions && (
                      <div className="mb-3 p-2.5 glass-card rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex items-start gap-2">
                          <Edit className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-800 font-medium">
                            {item.special_instructions}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Quantity Controls & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 glass-card rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                            className="h-8 w-8 p-0 hover:bg-background/80 rounded-md transition-elegant"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          
                          <span className="w-10 text-center text-lg font-bold font-luxury">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                            className="h-8 w-8 p-0 hover:bg-background/80 rounded-md transition-elegant"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-1 border ${getStatusColor(item.status)}`}
                        >
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-bold text-primary font-luxury">
                          {item.total_price.toLocaleString()} F
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="p-6 border-t bg-gradient-to-br from-card to-primary/5">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Sous-total</span>
            <span className="font-medium">{totals.subtotal.toLocaleString()} FCFA</span>
          </div>
          {totals.serviceCharge > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Service (10%)</span>
              <span className="font-medium">{totals.serviceCharge.toLocaleString()} FCFA</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>TVA (18%)</span>
            <span className="font-medium">{totals.taxAmount.toLocaleString()} FCFA</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold font-luxury">Total TTC</span>
              <span className="text-2xl font-bold text-primary font-luxury">
                {totals.total.toLocaleString()} F
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onSendToKitchen}
            disabled={items.length === 0}
            className="w-full h-12 text-base font-semibold shadow-soft transition-elegant hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            Envoyer en cuisine
          </Button>
          
          <Button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full h-12 text-base font-semibold shadow-soft transition-elegant hover:scale-[1.02] bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Demander l'addition
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onSplitBill}
              disabled={items.length === 0}
              className="h-10 glass-card transition-elegant hover:scale-[1.02]"
            >
              <Split className="h-4 w-4 mr-2" />
              Split
            </Button>
            <Button
              variant="outline"
              onClick={onTransferTable}
              disabled={items.length === 0}
              className="h-10 glass-card transition-elegant hover:scale-[1.02]"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Transférer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}