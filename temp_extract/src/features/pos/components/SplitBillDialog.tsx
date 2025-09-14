import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCreateSplitBill, SplitBillItem } from '../hooks/useSplitBill';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface SplitBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderItems: OrderItem[];
  orderTotal: number;
}

export function SplitBillDialog({ 
  open, 
  onOpenChange, 
  orderId, 
  orderItems, 
  orderTotal 
}: SplitBillDialogProps) {
  const [splitType, setSplitType] = useState<'by_amount' | 'by_items' | 'even'>('even');
  const [numberOfSplits, setNumberOfSplits] = useState(2);
  const [customAmounts, setCustomAmounts] = useState<number[]>([]);
  const [itemSplits, setItemSplits] = useState<{ [splitIndex: number]: SplitBillItem[] }>({});

  const createSplitBill = useCreateSplitBill();

  const initializeEvenSplit = () => {
    const amounts = Array(numberOfSplits).fill(orderTotal / numberOfSplits);
    setCustomAmounts(amounts);
  };

  const initializeItemSplits = () => {
    const splits: { [key: number]: SplitBillItem[] } = {};
    for (let i = 0; i < numberOfSplits; i++) {
      splits[i] = [];
    }
    setItemSplits(splits);
  };

  const handleSplitTypeChange = (value: string) => {
    setSplitType(value as typeof splitType);
    if (value === 'even') {
      initializeEvenSplit();
    } else if (value === 'by_items') {
      initializeItemSplits();
    } else if (value === 'by_amount') {
      setCustomAmounts(Array(numberOfSplits).fill(0));
    }
  };

  const addItemToSplit = (splitIndex: number, item: OrderItem, quantity: number) => {
    const splitItem: SplitBillItem = {
      itemId: item.id,
      quantity,
      unitPrice: item.unit_price
    };

    setItemSplits(prev => ({
      ...prev,
      [splitIndex]: [
        ...(prev[splitIndex] || []).filter(si => si.itemId !== item.id),
        splitItem
      ]
    }));
  };

  const calculateSplitTotal = (splitIndex: number) => {
    if (splitType === 'by_amount') {
      return customAmounts[splitIndex] || 0;
    } else if (splitType === 'by_items') {
      return (itemSplits[splitIndex] || []).reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice), 
        0
      );
    } else {
      return orderTotal / numberOfSplits;
    }
  };

  const handleSubmit = () => {
    const splits = Array.from({ length: numberOfSplits }, (_, index) => {
      if (splitType === 'by_amount') {
        return { amount: customAmounts[index] };
      } else if (splitType === 'by_items') {
        return { items: itemSplits[index] || [] };
      } else {
        return { amount: orderTotal / numberOfSplits };
      }
    });

    createSplitBill.mutate({
      orderId,
      splitType,
      totalSplits: numberOfSplits,
      splits
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const isValidSplit = () => {
    if (splitType === 'by_amount') {
      const total = customAmounts.reduce((sum, amount) => sum + (amount || 0), 0);
      return Math.abs(total - orderTotal) < 0.01;
    } else if (splitType === 'by_items') {
      // Check that all items are distributed
      const distributedItems = new Set();
      Object.values(itemSplits).forEach(items => {
        items.forEach(item => distributedItems.add(item.itemId));
      });
      return distributedItems.size === orderItems.length;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Diviser la Facture</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Split Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="splits">Nombre de divisions</Label>
              <Input
                id="splits"
                type="number"
                min="2"
                max="10"
                value={numberOfSplits}
                onChange={(e) => setNumberOfSplits(parseInt(e.target.value) || 2)}
                className="w-24"
              />
            </div>

            <div>
              <Label>Type de division</Label>
              <RadioGroup value={splitType} onValueChange={handleSplitTypeChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="even" id="even" />
                  <Label htmlFor="even">Division égale</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="by_amount" id="by_amount" />
                  <Label htmlFor="by_amount">Montants personnalisés</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="by_items" id="by_items" />
                  <Label htmlFor="by_items">Par articles</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Split Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Détails de la Division</h3>
            
            {splitType === 'by_amount' && (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: numberOfSplits }, (_, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <Label htmlFor={`amount-${index}`}>
                        Division {index + 1}
                      </Label>
                      <Input
                        id={`amount-${index}`}
                        type="number"
                        step="0.01"
                        value={customAmounts[index] || ''}
                        onChange={(e) => {
                          const newAmounts = [...customAmounts];
                          newAmounts[index] = parseFloat(e.target.value) || 0;
                          setCustomAmounts(newAmounts);
                        }}
                        className="mt-1"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {splitType === 'by_items' && (
              <div className="space-y-4">
                {Array.from({ length: numberOfSplits }, (_, splitIndex) => (
                  <Card key={splitIndex}>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">Division {splitIndex + 1}</h4>
                      <div className="space-y-2">
                        {orderItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span className="text-sm">{item.product_name}</span>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const currentItem = itemSplits[splitIndex]?.find(si => si.itemId === item.id);
                                  const currentQty = currentItem?.quantity || 0;
                                  if (currentQty > 0) {
                                    addItemToSplit(splitIndex, item, currentQty - 1);
                                  }
                                }}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">
                                {itemSplits[splitIndex]?.find(si => si.itemId === item.id)?.quantity || 0}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const currentItem = itemSplits[splitIndex]?.find(si => si.itemId === item.id);
                                  const currentQty = currentItem?.quantity || 0;
                                  if (currentQty < item.quantity) {
                                    addItemToSplit(splitIndex, item, currentQty + 1);
                                  }
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>{calculateSplitTotal(splitIndex).toFixed(2)} €</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {splitType === 'even' && (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: numberOfSplits }, (_, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-medium">Division {index + 1}</div>
                        <div className="text-2xl font-bold text-primary">
                          {(orderTotal / numberOfSplits).toFixed(2)} €
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">Total original</div>
              <div className="text-lg font-bold">{orderTotal.toFixed(2)} €</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total des divisions</div>
              <div className="text-lg font-bold">
                {Array.from({ length: numberOfSplits }, (_, i) => calculateSplitTotal(i))
                  .reduce((sum, amount) => sum + amount, 0)
                  .toFixed(2)} €
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isValidSplit() || createSplitBill.isPending}
            >
              {createSplitBill.isPending ? 'Création...' : 'Créer les Divisions'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}