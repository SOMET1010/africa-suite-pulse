import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Banknote, Coins, Plus, Minus } from "lucide-react";
import { BCEAO_DENOMINATIONS, calculateOptimalChange, formatCurrencyValue, type CurrencyDenomination } from "@/data/bceao-currency";
import { cn } from "@/lib/utils";

interface CashCount {
  [key: number]: number;
}

interface CashVisualizerProps {
  totalAmount: number;
  onChange: (receivedAmount: number) => void;
  showChangeCalculation?: boolean;
  className?: string;
}

export function CashVisualizer({ 
  totalAmount, 
  onChange, 
  showChangeCalculation = true,
  className 
}: CashVisualizerProps) {
  const [cashCount, setCashCount] = useState<CashCount>({});

  // Calculate total received amount
  const receivedAmount = Object.entries(cashCount).reduce(
    (total, [value, count]) => total + (parseInt(value) * count),
    0
  );

  // Calculate change
  const changeAmount = receivedAmount - totalAmount;
  const optimalChange = changeAmount > 0 ? calculateOptimalChange(changeAmount) : [];

  // Update parent component when received amount changes
  const updateCashCount = (denomination: number, newCount: number) => {
    const updatedCount = { ...cashCount };
    if (newCount <= 0) {
      delete updatedCount[denomination];
    } else {
      updatedCount[denomination] = newCount;
    }
    setCashCount(updatedCount);
    
    const newReceivedAmount = Object.entries(updatedCount).reduce(
      (total, [value, count]) => total + (parseInt(value) * count),
      0
    );
    onChange(newReceivedAmount);
  };

  const incrementCount = (denomination: number) => {
    const currentCount = cashCount[denomination] || 0;
    updateCashCount(denomination, currentCount + 1);
  };

  const decrementCount = (denomination: number) => {
    const currentCount = cashCount[denomination] || 0;
    if (currentCount > 0) {
      updateCashCount(denomination, currentCount - 1);
    }
  };

  const resetCounts = () => {
    setCashCount({});
    onChange(0);
  };

  const setExactAmount = () => {
    // Calculate exact change using optimal denominations
    const exactChange = calculateOptimalChange(totalAmount);
    const newCashCount: CashCount = {};
    
    exactChange.forEach(({ denomination, count }) => {
      newCashCount[denomination.value] = count;
    });
    
    setCashCount(newCashCount);
    onChange(totalAmount);
  };

  const banknotes = BCEAO_DENOMINATIONS.filter(d => d.type === 'banknote');
  const coins = BCEAO_DENOMINATIONS.filter(d => d.type === 'coin');

  return (
    <div className={cn("space-y-6", className)}>
      {/* Banknotes Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Billets</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {banknotes.map((denomination) => {
            const count = cashCount[denomination.value] || 0;
            return (
              <div
                key={denomination.value}
                className="border rounded-lg p-3 space-y-2 bg-local-warm/5 hover:bg-local-warm/10 transition-colors"
              >
                <div 
                  className="h-16 rounded border-2 border-dashed flex items-center justify-center text-xs font-medium"
                  style={{ 
                    backgroundColor: `${denomination.color}20`,
                    borderColor: `${denomination.color}40`,
                    color: denomination.color 
                  }}
                >
                  {formatCurrencyValue(denomination.value)}
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => decrementCount(denomination.value)}
                    disabled={count === 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Badge variant={count > 0 ? "default" : "secondary"} className="min-w-8">
                    {count}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => incrementCount(denomination.value)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coins Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Pièces</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {coins.map((denomination) => {
            const count = cashCount[denomination.value] || 0;
            return (
              <div
                key={denomination.value}
                className="border rounded-lg p-2 space-y-2 bg-local-warm/5 hover:bg-local-warm/10 transition-colors"
              >
                <div 
                  className="h-8 w-8 mx-auto rounded-full border-2 flex items-center justify-center text-xs font-medium"
                  style={{ 
                    backgroundColor: `${denomination.color}20`,
                    borderColor: `${denomination.color}40`,
                    color: denomination.color 
                  }}
                >
                  {denomination.value}
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => decrementCount(denomination.value)}
                    disabled={count === 0}
                  >
                    <Minus className="h-2 w-2" />
                  </Button>
                  <Badge variant={count > 0 ? "default" : "secondary"} className="text-xs min-w-6">
                    {count}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => incrementCount(denomination.value)}
                  >
                    <Plus className="h-2 w-2" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={setExactAmount}
          className="flex-1"
        >
          Montant exact
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetCounts}
          className="flex-1"
          disabled={receivedAmount === 0}
        >
          Effacer
        </Button>
      </div>

      {/* Summary */}
      <div className="bg-muted p-3 rounded-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Montant reçu:</span>
          <Badge variant="outline" className="text-sm">
            {receivedAmount.toLocaleString()} FCFA
          </Badge>
        </div>
        
        {showChangeCalculation && receivedAmount > 0 && (
          <>
            <Separator />
            {changeAmount >= 0 ? (
              <div className="flex justify-between items-center">
                <span className="text-sm">Monnaie à rendre:</span>
                <Badge variant="secondary" className="text-sm">
                  {changeAmount.toLocaleString()} FCFA
                </Badge>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-sm text-destructive">Montant manquant:</span>
                <Badge variant="destructive" className="text-sm">
                  {Math.abs(changeAmount).toLocaleString()} FCFA
                </Badge>
              </div>
            )}
            
            {/* Optimal change breakdown */}
            {changeAmount > 0 && optimalChange.length > 0 && (
              <div className="mt-3 p-2 bg-background rounded border">
                <p className="text-xs text-muted-foreground mb-2">Rendu optimal:</p>
                <div className="flex flex-wrap gap-1">
                  {optimalChange.map(({ denomination, count }, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {count}× {formatCurrencyValue(denomination.value)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}