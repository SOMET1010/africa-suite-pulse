import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, Smartphone, DollarSign, Calculator, 
  Percent, Home, MapPin, Trash2, Settings,
  Grid3X3, History, Clock
} from 'lucide-react';

interface POSPaymentZoneProps {
  totals: {
    subtotal: number;
    serviceCharge: number;
    taxAmount: number;
    total: number;
  };
  cartItems: any[];
  selectedTable: any;
  onClearOrder: () => void;
  onApplyDiscount: (type: 'percentage' | 'amount', value: number) => void;
  onShowBillPreview: () => void;
  onSendToKitchen: () => void;
  showFloorPlan: boolean;
  onToggleFloorPlan: () => void;
  FloorPlanComponent: React.ComponentType;
}

export const POSPaymentZone: React.FC<POSPaymentZoneProps> = ({
  totals,
  cartItems,
  selectedTable,
  onClearOrder,
  onApplyDiscount,
  onShowBillPreview,
  onSendToKitchen,
  showFloorPlan,
  onToggleFloorPlan,
  FloorPlanComponent
}) => {
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');

  const numpadButtons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['C', '0', '←']
  ];

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setCalculatorDisplay('0');
    } else if (value === '←') {
      setCalculatorDisplay(prev => 
        prev.length > 1 ? prev.slice(0, -1) : '0'
      );
    } else if (value === '0' && calculatorDisplay === '0') {
      return;
    } else {
      setCalculatorDisplay(prev => 
        prev === '0' ? value : prev + value
      );
    }
  };

  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue);
    if (!isNaN(value) && value > 0) {
      onApplyDiscount(discountType, value);
      setDiscountValue('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-muted/10">
      {/* Header Actions */}
      <div className="p-4 border-b bg-background">
        <h3 className="text-lg font-bold mb-3 text-center">ACTIONS RAPIDES</h3>
        
        <div className="space-y-2">
          <Button
            onClick={onToggleFloorPlan}
            variant={showFloorPlan ? "default" : "outline"}
            className="w-full h-10"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Plan de salle (F4)
          </Button>
          
          <Button
            onClick={onClearOrder}
            variant="outline"
            className="w-full h-10 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Nouveau ticket (F1)
          </Button>
        </div>
      </div>

      {/* Plan de salle miniature */}
      {showFloorPlan && (
        <div className="border-b bg-card">
          <div className="p-3">
            <h4 className="text-sm font-bold mb-2 text-center">TABLES</h4>
            <FloorPlanComponent />
          </div>
        </div>
      )}

      {/* Remises */}
      <div className="p-4 border-b bg-card">
        <h4 className="text-sm font-bold mb-3 text-center">REMISES</h4>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={discountType === 'percentage' ? "default" : "outline"}
              size="sm"
              onClick={() => setDiscountType('percentage')}
              className="flex-1"
            >
              <Percent className="h-3 w-3 mr-1" />
              %
            </Button>
            <Button
              variant={discountType === 'amount' ? "default" : "outline"}
              size="sm"
              onClick={() => setDiscountType('amount')}
              className="flex-1"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              F
            </Button>
          </div>
          
          <Input
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'percentage' ? "Ex: 10" : "Ex: 1000"}
            className="text-center"
          />
          
          <Button
            onClick={handleApplyDiscount}
            disabled={!discountValue || cartItems.length === 0}
            className="w-full h-8"
            size="sm"
          >
            Appliquer remise
          </Button>
        </div>
      </div>

      {/* Calculatrice */}
      <div className="p-4 border-b bg-background">
        <h4 className="text-sm font-bold mb-3 text-center flex items-center justify-center gap-2">
          <Calculator className="h-4 w-4" />
          CALCULATRICE
        </h4>
        
        <div className="mb-3">
          <Input
            value={calculatorDisplay}
            readOnly
            className="text-center text-lg font-mono h-10"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          {numpadButtons.flat().map((btn) => (
            <Button
              key={btn}
              variant="outline"
              size="sm"
              onClick={() => handleNumpadClick(btn)}
              className="h-10 font-mono"
            >
              {btn === '←' ? '⌫' : btn}
            </Button>
          ))}
        </div>
      </div>

      {/* Moyens de paiement */}
      <div className="flex-1 p-4 bg-card">
        <h4 className="text-sm font-bold mb-3 text-center">PAIEMENT</h4>
        
        <div className="space-y-3">
          <Button
            onClick={onShowBillPreview}
            disabled={cartItems.length === 0 || !selectedTable}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            ESPÈCES
          </Button>
          
          <Button
            onClick={onShowBillPreview}
            disabled={cartItems.length === 0 || !selectedTable}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            CARTE
          </Button>
          
          <Button
            onClick={onShowBillPreview}
            disabled={cartItems.length === 0 || !selectedTable}
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            MOBILE MONEY
          </Button>
        </div>
      </div>

      {/* Raccourcis en bas */}
      <div className="p-4 border-t bg-muted/30">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <History className="h-3 w-3 mr-1" />
            Historique
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Settings className="h-3 w-3 mr-1" />
            Paramètres
          </Button>
        </div>
      </div>
    </div>
  );
};