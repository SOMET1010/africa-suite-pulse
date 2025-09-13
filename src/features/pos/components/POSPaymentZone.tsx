import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { POSFloorPlan } from './POSFloorPlan';
import { 
  CreditCard, Smartphone, DollarSign, Calculator, 
  Percent, Home, MapPin, Trash2, Settings,
  Grid3X3, History, Clock, Maximize2, Minimize2
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
  onSelectTable: (table: any) => void;
  onClearOrder: () => void;
  onApplyDiscount: (type: 'percentage' | 'amount', value: number) => void;
  onShowBillPreview: () => void;
  onSendToKitchen: () => void;
  showFloorPlan: boolean;
  onToggleFloorPlan: () => void;
  showFloorPlanFullScreen: boolean;
  onToggleFloorPlanFullScreen: () => void;
}

export const POSPaymentZone: React.FC<POSPaymentZoneProps> = ({
  totals,
  cartItems,
  selectedTable,
  onSelectTable,
  onClearOrder,
  onApplyDiscount,
  onShowBillPreview,
  onSendToKitchen,
  showFloorPlan,
  onToggleFloorPlan,
  showFloorPlanFullScreen,
  onToggleFloorPlanFullScreen
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
      {showFloorPlan && !showFloorPlanFullScreen && (
        <div className="border-b bg-card">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold">TABLES</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFloorPlanFullScreen}
                className="h-6 w-6 p-0"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
            <POSFloorPlan 
              selectedTable={selectedTable}
              onSelectTable={onSelectTable}
              isFullScreen={false}
            />
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
            className="w-full tap-target press-feedback"
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
            className="text-center text-lg font-mono tap-target"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-2 touch-spacing">
          {numpadButtons.flat().map((btn) => (
            <Button
              key={btn}
              variant="outline"
              size="sm"
              onClick={() => handleNumpadClick(btn)}
              className="tap-target font-mono press-feedback transition-elegant"
            >
              {btn === '←' ? '⌫' : btn}
            </Button>
          ))}
        </div>
      </div>

      {/* Moyens de paiement */}
      <div className="flex-1 p-4 bg-card">
        <h4 className="text-sm font-bold mb-3 text-center">PAIEMENT</h4>
        
        <div className="space-y-3 touch-spacing">
          <Button
            onClick={onShowBillPreview}
            disabled={cartItems.length === 0 || !selectedTable}
            className="w-full tap-target bg-success hover:bg-success/90 text-success-foreground press-feedback"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            ESPÈCES
          </Button>
          
          <Button
            onClick={onShowBillPreview}
            disabled={cartItems.length === 0 || !selectedTable}
            className="w-full tap-target bg-info hover:bg-info/90 text-info-foreground press-feedback"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            CARTE
          </Button>
          
          <Button
            onClick={onShowBillPreview}
            disabled={cartItems.length === 0 || !selectedTable}
            className="w-full tap-target bg-warning hover:bg-warning/90 text-warning-foreground press-feedback"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            MOBILE MONEY
          </Button>
        </div>
      </div>

      {/* Raccourcis en bas */}
      <div className="p-4 border-t bg-muted/30">
        <div className="grid grid-cols-2 gap-3 touch-spacing">
          <Button variant="outline" size="sm" className="tap-target press-feedback">
            <History className="h-4 w-4 mr-2" />
            Historique
          </Button>
          <Button variant="outline" size="sm" className="tap-target press-feedback">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>
    </div>
  );
};