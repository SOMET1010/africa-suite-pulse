import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Plus } from 'lucide-react';

interface ComponentOption {
  id: string;
  name: string;
  extraPrice: number;
  isDefault: boolean;
}

interface MenuComposition {
  type: 'main' | 'side' | 'sauce' | 'garnish' | 'drink';
  name: string;
  options: ComponentOption[];
  isRequired: boolean;
  allowMultiple: boolean;
}

interface MenuCompositionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  compositions: MenuComposition[];
  onConfirm: (selections: Record<string, string[]>) => void;
}

export function MenuCompositionDialog({
  isOpen,
  onClose,
  productName,
  compositions,
  onConfirm
}: MenuCompositionDialogProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const handleOptionToggle = (type: string, optionId: string, allowMultiple: boolean) => {
    setSelections(prev => {
      const current = prev[type] || [];
      
      if (allowMultiple) {
        const newSelection = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [type]: newSelection };
      } else {
        return { ...prev, [type]: [optionId] };
      }
    });
  };

  const calculateTotalExtraPrice = () => {
    return compositions.reduce((total, comp) => {
      const selected = selections[comp.type] || [];
      return total + selected.reduce((compTotal, optionId) => {
        const option = comp.options.find(opt => opt.id === optionId);
        return compTotal + (option?.extraPrice || 0);
      }, 0);
    }, 0);
  };

  const isValid = () => {
    return compositions.every(comp => {
      if (!comp.isRequired) return true;
      const selected = selections[comp.type] || [];
      return selected.length > 0;
    });
  };

  const handleConfirm = () => {
    if (isValid()) {
      onConfirm(selections);
      onClose();
    }
  };

  // Initialize default selections
  React.useEffect(() => {
    const defaultSelections: Record<string, string[]> = {};
    compositions.forEach(comp => {
      const defaultOptions = comp.options.filter(opt => opt.isDefault);
      if (defaultOptions.length > 0) {
        defaultSelections[comp.type] = defaultOptions.map(opt => opt.id);
      }
    });
    setSelections(defaultSelections);
  }, [compositions]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Personnaliser : {productName}
            {calculateTotalExtraPrice() > 0 && (
              <Badge variant="secondary">
                +{calculateTotalExtraPrice()} FCFA
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={compositions[0]?.type} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {compositions.map(comp => (
              <TabsTrigger key={comp.type} value={comp.type} className="flex items-center gap-1">
                {comp.name}
                {comp.isRequired && <span className="text-destructive">*</span>}
              </TabsTrigger>
            ))}
          </TabsList>

          {compositions.map(comp => (
            <TabsContent key={comp.type} value={comp.type} className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {comp.isRequired ? 'Obligatoire' : 'Optionnel'} • 
                {comp.allowMultiple ? 'Plusieurs choix possibles' : 'Un seul choix'}
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {comp.options.map(option => {
                  const isSelected = (selections[comp.type] || []).includes(option.id);
                  return (
                    <Button
                      key={option.id}
                      variant={isSelected ? "default" : "outline"}
                      className="justify-between h-auto p-3"
                      onClick={() => handleOptionToggle(comp.type, option.id, comp.allowMultiple)}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected && <Check className="h-4 w-4" />}
                        <span>{option.name}</span>
                        {option.isDefault && <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">Par défaut</Badge>}
                      </div>
                      {option.extraPrice > 0 && (
                        <span className="text-sm font-medium">+{option.extraPrice} FCFA</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!isValid()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter
            {calculateTotalExtraPrice() > 0 && ` (+${calculateTotalExtraPrice()} FCFA)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}