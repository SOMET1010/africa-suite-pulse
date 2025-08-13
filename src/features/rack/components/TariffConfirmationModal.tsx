import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, Calendar, ArrowRight, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TariffConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservation: {
    id: string;
    reference: string;
    guest_name: string;
    date_arrival: string;
    date_departure: string;
    adults: number;
    children: number;
    rate_total: number;
  };
  currentRoom: {
    number: string;
    type: string;
  };
  targetRoom: {
    number: string;
    type: string;
  };
  orgId: string;
}

interface TariffCalculation {
  baseRate: number;
  totalRate: number;
  nights: number;
  averagePerNight: number;
  breakdown: Array<{
    date: string;
    rate: number;
    rateType: string;
    specialRate?: boolean;
    reason?: string;
  }>;
  appliedTariff?: {
    id: string;
    code: string;
    label: string;
    baseRate: number;
  };
}

export function TariffConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  currentRoom,
  targetRoom,
  orgId
}: TariffConfirmationModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentCalculation, setCurrentCalculation] = useState<TariffCalculation | null>(null);
  const [newCalculation, setNewCalculation] = useState<TariffCalculation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      calculateTariffs();
    }
  }, [isOpen, currentRoom, targetRoom, reservation]);

  const calculateTariffs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate tariff for current room type
      const currentResult = await supabase.functions.invoke('calculate-tariff', {
        body: {
          orgId,
          roomType: currentRoom.type,
          dateArrival: reservation.date_arrival,
          dateDeparture: reservation.date_departure,
          adults: reservation.adults,
          children: reservation.children
        }
      });

      // Calculate tariff for target room type
      const newResult = await supabase.functions.invoke('calculate-tariff', {
        body: {
          orgId,
          roomType: targetRoom.type,
          dateArrival: reservation.date_arrival,
          dateDeparture: reservation.date_departure,
          adults: reservation.adults,
          children: reservation.children
        }
      });

      if (currentResult.error) throw new Error(currentResult.error);
      if (newResult.error) throw new Error(newResult.error);

      if (!currentResult.data?.success) throw new Error('Échec du calcul du tarif actuel');
      if (!newResult.data?.success) throw new Error('Échec du calcul du nouveau tarif');

      setCurrentCalculation(currentResult.data.calculation);
      setNewCalculation(newResult.data.calculation);
    } catch (err: any) {
      console.error('Error calculating tariffs:', err);
      setError(err.message || 'Erreur lors du calcul des tarifs');
      toast({
        title: "Erreur de calcul",
        description: "Impossible de calculer les nouveaux tarifs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  const priceDifference = newCalculation && currentCalculation 
    ? newCalculation.totalRate - currentCalculation.totalRate 
    : 0;

  const isIncreasing = priceDifference > 0;
  const isDecreasing = priceDifference < 0;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Confirmation du Changement de Tarif
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Calcul des tarifs en cours...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={calculateTariffs} className="mt-4">
                Réessayer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Reservation Info */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Information de la Réservation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Référence:</span>
                    <div className="font-medium">{reservation.reference}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Client:</span>
                    <div className="font-medium">{reservation.guest_name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Arrivée:</span>
                    <div className="font-medium">{new Date(reservation.date_arrival).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Départ:</span>
                    <div className="font-medium">{new Date(reservation.date_departure).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Change Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Changement de Chambre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Chambre Actuelle</div>
                    <div className="font-semibold text-lg">{currentRoom.number}</div>
                    <Badge variant="outline">{currentRoom.type}</Badge>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Nouvelle Chambre</div>
                    <div className="font-semibold text-lg">{targetRoom.number}</div>
                    <Badge variant="outline">{targetRoom.type}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Comparison */}
            {currentCalculation && newCalculation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Tariff */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Tarif Actuel
                      <Badge variant="secondary">{currentRoom.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-muted-foreground">
                        {formatCurrency(currentCalculation.totalRate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {currentCalculation.nights} nuits · {formatCurrency(currentCalculation.averagePerNight)}/nuit
                      </div>
                    </div>
                    {currentCalculation.appliedTariff && (
                      <div className="text-center">
                        <Badge variant="outline">
                          {currentCalculation.appliedTariff.label}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* New Tariff */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Nouveau Tarif
                      <Badge variant="default">{targetRoom.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(newCalculation.totalRate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {newCalculation.nights} nuits · {formatCurrency(newCalculation.averagePerNight)}/nuit
                      </div>
                    </div>
                    {newCalculation.appliedTariff && (
                      <div className="text-center">
                        <Badge variant="outline">
                          {newCalculation.appliedTariff.label}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Price Impact */}
            {priceDifference !== 0 && (
              <Card className={`glass-card ${isIncreasing ? 'border-warning/50' : 'border-success/50'}`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isIncreasing ? (
                      <>
                        <TrendingUp className="h-5 w-5 text-warning" />
                        Impact Tarifaire - Augmentation
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-5 w-5 text-success" />
                        Impact Tarifaire - Réduction
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${isIncreasing ? 'text-warning' : 'text-success'}`}>
                      {isIncreasing ? '+' : ''}{formatCurrency(priceDifference)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {isIncreasing ? 'Supplément à percevoir' : 'Réduction accordée'}
                    </div>
                  </div>
                  
                  {Math.abs(priceDifference) > 0 && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Ancien total:</span>
                          <span>{formatCurrency(currentCalculation?.totalRate || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nouveau total:</span>
                          <span>{formatCurrency(newCalculation?.totalRate || 0)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Différence:</span>
                            <span className={isIncreasing ? 'text-warning' : 'text-success'}>
                              {isIncreasing ? '+' : ''}{formatCurrency(priceDifference)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Daily Breakdown */}
            {newCalculation?.breakdown && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Détail par Nuit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {newCalculation.breakdown.map((day, index) => (
                      <div key={index} className="flex justify-between items-center py-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{new Date(day.date).toLocaleDateString('fr-FR')}</span>
                          {day.specialRate && (
                            <Badge variant="secondary" className="text-xs">
                              {day.rateType}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatCurrency(day.rate)}</span>
                          {day.reason && (
                            <div className="text-xs text-muted-foreground">{day.reason}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || !!error}
            className={isIncreasing ? 'bg-warning hover:bg-warning/90' : undefined}
          >
            {isIncreasing && Math.abs(priceDifference) > 0 
              ? `Confirmer (+${formatCurrency(priceDifference)})` 
              : 'Confirmer le Changement'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}