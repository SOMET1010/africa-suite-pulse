import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Check, Edit2, AlertCircle, Calendar, Euro } from 'lucide-react';
import { useReservationServices } from '@/features/billing/hooks/useReservationServices';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ArrivalServicesControlProps {
  reservationId: string;
  onServicesValidated?: () => void;
}

export default function ArrivalServicesControl({
  reservationId,
  onServicesValidated
}: ArrivalServicesControlProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ quantity: number; unitPrice: number }>({
    quantity: 1,
    unitPrice: 0
  });

  const { 
    data: reservationServices, 
    updateService, 
    applyServices,
    isLoading 
  } = useReservationServices(reservationId);

  const pendingServices = reservationServices?.filter(rs => !rs.is_applied) || [];
  const appliedServices = reservationServices?.filter(rs => rs.is_applied) || [];

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices(prev => [...prev, serviceId]);
    } else {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
    }
  };

  const handleEditService = (service: any) => {
    setEditingService(service.id);
    setEditValues({
      quantity: service.quantity,
      unitPrice: service.unit_price
    });
  };

  const handleSaveEdit = async (serviceId: string) => {
    await updateService(serviceId, {
      quantity: editValues.quantity,
      unit_price: editValues.unitPrice
    });
    setEditingService(null);
  };

  const handleApplySelected = async () => {
    if (selectedServices.length === 0) return;
    
    await applyServices(selectedServices);
    setSelectedServices([]);
    onServicesValidated?.();
  };

  const getBillingConditionLabel = (condition: string) => {
    switch (condition) {
      case 'daily': return 'Quotidien';
      case 'stay': return 'Séjour';
      case 'weekly': return 'Hebdomadaire';
      case 'monthly': return 'Mensuel';
      default: return condition;
    }
  };

  const getFolioLabel = (number: number) => {
    switch (number) {
      case 1: return 'Principal';
      case 2: return 'Extras';
      case 3: return 'Téléphone';
      case 4: return 'Mini-bar';
      case 5: return 'Blanchisserie';
      case 6: return 'Divers';
      default: return `F${number}`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Contrôle des prestations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Prestations en attente */}
      {pendingServices.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                Prestations à valider ({pendingServices.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={handleApplySelected}
                disabled={selectedServices.length === 0}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Appliquer ({selectedServices.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <Checkbox
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={(checked) => 
                    handleServiceToggle(service.id, checked as boolean)
                  }
                />
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.service?.code}</span>
                    <span className="text-sm text-muted-foreground">
                      {service.service?.label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getFolioLabel(service.folio_number)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(service.valid_from), 'dd/MM', { locale: fr })} - 
                      {format(new Date(service.valid_until), 'dd/MM', { locale: fr })}
                    </span>
                    <span>{getBillingConditionLabel(service.billing_condition)}</span>
                  </div>

                  {editingService === service.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editValues.quantity}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          quantity: Number(e.target.value)
                        }))}
                        className="w-20 h-8"
                        step="0.1"
                        min="0"
                      />
                      <span className="text-xs">×</span>
                      <Input
                        type="number"
                        value={editValues.unitPrice}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          unitPrice: Number(e.target.value)
                        }))}
                        className="w-24 h-8"
                        step="0.01"
                        min="0"
                      />
                      <span className="text-xs">€ =</span>
                      <span className="font-medium">
                        {(editValues.quantity * editValues.unitPrice).toFixed(2)}€
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveEdit(service.id)}
                        className="h-8 px-2"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-sm">
                        <Euro className="h-3 w-3" />
                        {service.quantity} × {service.unit_price}€ = 
                        <span className="font-medium">{service.total_price}€</span>
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditService(service)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Prestations appliquées */}
      {appliedServices.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              Prestations validées ({appliedServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {appliedServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50"
              >
                <Check className="h-4 w-4 text-success" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.service?.code}</span>
                    <span className="text-sm text-muted-foreground">
                      {service.service?.label}
                    </span>
                    <Badge variant="default" className="text-xs">
                      {getFolioLabel(service.folio_number)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      {service.quantity} × {service.unit_price}€ = {service.total_price}€
                    </span>
                    <span>{getBillingConditionLabel(service.billing_condition)}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Aucune prestation */}
      {reservationServices?.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Prestations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-4">
              Aucune prestation configurée pour cette réservation
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}