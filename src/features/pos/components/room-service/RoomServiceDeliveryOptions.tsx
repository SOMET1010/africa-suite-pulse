import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Truck, 
  Utensils,
  MessageSquare,
  CheckCircle,
  Loader2
} from "lucide-react";

export interface DeliveryOptions {
  priority: 'normal' | 'urgent';
  specialInstructions: string;
  deliveryTime: 'asap' | '30min' | '1hour' | 'custom';
  customTime?: string;
}

interface RoomServiceDeliveryOptionsProps {
  options: DeliveryOptions;
  onUpdateOptions: (options: Partial<DeliveryOptions>) => void;
  onConfirmOrder: () => void;
  isProcessing: boolean;
  canConfirm: boolean;
}

const deliveryTimeOptions = [
  { value: 'asap', label: 'Dès que possible', estimated: '15-20 min', icon: Clock },
  { value: '30min', label: 'Dans 30 minutes', estimated: '30 min', icon: Clock },
  { value: '1hour', label: 'Dans 1 heure', estimated: '60 min', icon: Clock }
];

const priorityOptions = [
  { 
    value: 'normal', 
    label: 'Normal', 
    description: 'Livraison standard',
    fee: 0,
    icon: Truck
  },
  { 
    value: 'urgent', 
    label: 'Prioritaire', 
    description: 'Livraison rapide',
    fee: 2000,
    icon: Truck
  }
];

export function RoomServiceDeliveryOptions({
  options,
  onUpdateOptions,
  onConfirmOrder,
  isProcessing,
  canConfirm
}: RoomServiceDeliveryOptionsProps) {

  return (
    <div className="space-y-4">
      {/* Delivery Time */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Heure de livraison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup 
            value={options.deliveryTime} 
            onValueChange={(value) => onUpdateOptions({ deliveryTime: value as any })}
          >
            {deliveryTimeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label 
                  htmlFor={option.value} 
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{option.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {option.estimated}
                    </Badge>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Priority */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Priorité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup 
            value={options.priority} 
            onValueChange={(value) => onUpdateOptions({ priority: value as any })}
          >
            {priorityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`priority-${option.value}`} />
                <Label 
                  htmlFor={`priority-${option.value}`} 
                  className="flex-1 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{option.label}</span>
                      {option.fee > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{option.fee.toLocaleString()} F
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Instructions spéciales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Allergies, préférences, instructions de livraison..."
            value={options.specialInstructions}
            onChange={(e) => onUpdateOptions({ specialInstructions: e.target.value })}
            className="min-h-[80px] text-sm"
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button 
          onClick={onConfirmOrder}
          disabled={!canConfirm || isProcessing}
          className="w-full gap-2 bg-orange-600 hover:bg-orange-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Confirmer la commande
            </>
          )}
        </Button>
        
        {/* Service Info */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Utensils className="h-3 w-3" />
            Service Room Service
          </div>
          <p className="text-xs text-muted-foreground">
            Disponible 24h/24 • Livraison directe en chambre
          </p>
        </div>
      </div>
    </div>
  );
}