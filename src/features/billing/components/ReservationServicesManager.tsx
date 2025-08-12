import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Calendar, Euro, Settings } from 'lucide-react';
import { useServices } from '@/features/settings/services/useServices';
import { useReservationServices } from '../hooks/useReservationServices';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReservationServicesManagerProps {
  reservationId: string;
  dateArrival: string;
  dateDeparture: string;
  orgId: string;
}

export default function ReservationServicesManager({
  reservationId,
  dateArrival,
  dateDeparture,
  orgId
}: ReservationServicesManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [folioNumber, setFolioNumber] = useState(1);
  const [billingCondition, setBillingCondition] = useState('daily');
  const [validFrom, setValidFrom] = useState(dateArrival);
  const [validUntil, setValidUntil] = useState(dateDeparture);

  const { services } = useServices(orgId);
  const { 
    data: reservationServices, 
    addService, 
    updateService, 
    removeService,
    isLoading 
  } = useReservationServices(reservationId);

  const handleAddService = async () => {
    const selectedService = services?.find(s => s.id === selectedServiceId);
    if (!selectedService) return;

    await addService({
      service_id: selectedServiceId,
      quantity,
      unit_price: unitPrice || selectedService.price || 0,
      folio_number: folioNumber,
      billing_condition: billingCondition,
      valid_from: validFrom,
      valid_until: validUntil
    });

    // Reset form
    setSelectedServiceId('');
    setQuantity(1);
    setUnitPrice(0);
    setFolioNumber(1);
    setBillingCondition('daily');
    setValidFrom(dateArrival);
    setValidUntil(dateDeparture);
    setIsAddDialogOpen(false);
  };

  const handleServiceSelect = (serviceId: string) => {
    const service = services?.find(s => s.id === serviceId);
    if (service) {
      setSelectedServiceId(serviceId);
      setUnitPrice(service.price || 0);
    }
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
      default: return `Folio ${number}`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Prestations à facturer</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter une prestation</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service">Service</Label>
                  <Select value={selectedServiceId} onValueChange={handleServiceSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.code} - {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit_price">Prix unitaire</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="folio">Folio</Label>
                  <Select value={folioNumber.toString()} onValueChange={(v) => setFolioNumber(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} - {getFolioLabel(num)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="billing_condition">Condition de facturation</Label>
                <Select value={billingCondition} onValueChange={setBillingCondition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="stay">Séjour complet</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Du</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Au</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddService} disabled={!selectedServiceId}>
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Chargement...</div>
        ) : reservationServices?.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Aucune prestation configurée pour cette réservation
          </div>
        ) : (
          reservationServices?.map((rs) => (
            <div
              key={rs.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rs.service?.code}</span>
                  <span className="text-sm text-muted-foreground">{rs.service?.label}</span>
                  <Badge variant={rs.is_applied ? "default" : "secondary"} className="text-xs">
                    {rs.is_applied ? "Appliqué" : "En attente"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(rs.valid_from), 'dd/MM', { locale: fr })} - 
                    {format(new Date(rs.valid_until), 'dd/MM', { locale: fr })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Euro className="h-3 w-3" />
                    {rs.quantity} × {rs.unit_price}€ = {rs.total_price}€
                  </span>
                  <span className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    F{rs.folio_number} - {getBillingConditionLabel(rs.billing_condition)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeService(rs.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}