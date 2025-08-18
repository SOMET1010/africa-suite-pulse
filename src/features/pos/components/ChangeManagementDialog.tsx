import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Banknote, Coins } from 'lucide-react';
import { formatCurrencyValue } from '@/data/bceao-currency';

interface ChangeManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmChange: () => void;
  amountReceived: number;
  totalAmount: number;
  changeAmount: number;
}

const BCEAO_DENOMINATIONS = {
  banknotes: [10000, 5000, 2000, 1000, 500],
  coins: [250, 200, 100, 50, 25, 10, 5]
};

export function ChangeManagementDialog({
  isOpen,
  onClose,
  onConfirmChange,
  amountReceived,
  totalAmount,
  changeAmount
}: ChangeManagementDialogProps) {
  const [changeCounts, setChangeCounts] = useState<Record<number, number>>({});

  // Calculate optimal change breakdown
  const calculateOptimalChange = (amount: number) => {
    const breakdown: Record<number, number> = {};
    let remaining = amount;

    // Process banknotes first
    for (const denomination of BCEAO_DENOMINATIONS.banknotes) {
      if (remaining >= denomination) {
        const count = Math.floor(remaining / denomination);
        breakdown[denomination] = count;
        remaining -= count * denomination;
      }
    }

    // Process coins
    for (const denomination of BCEAO_DENOMINATIONS.coins) {
      if (remaining >= denomination) {
        const count = Math.floor(remaining / denomination);
        breakdown[denomination] = count;
        remaining -= count * denomination;
      }
    }

    return breakdown;
  };

  const optimalBreakdown = calculateOptimalChange(changeAmount);

  const handleConfirm = () => {
    onConfirmChange();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Gestion de la Monnaie
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Total à payer:</span>
              <span className="font-semibold">{formatCurrencyValue(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Montant reçu:</span>
              <span className="font-semibold text-green-600">{formatCurrencyValue(amountReceived)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Monnaie à rendre:</span>
                <span className="text-orange-600">{formatCurrencyValue(changeAmount)}</span>
              </div>
            </div>
          </div>

          {/* Optimal Change Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Décomposition suggérée:
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(optimalBreakdown).map(([denomination, count]) => {
                const denom = parseInt(denomination);
                const isBanknote = denom >= 500;
                
                return (
                  <div key={denomination} className="flex justify-between bg-accent p-2 rounded">
                    <span className="flex items-center gap-1">
                      {isBanknote ? <Banknote className="h-3 w-3" /> : <Coins className="h-3 w-3" />}
                      {formatCurrencyValue(denom)}
                    </span>
                    <span className="font-medium">×{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleConfirm}
            >
              Monnaie Rendue
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Confirmez après avoir rendu la monnaie au client
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}