import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, Percent, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/Badge';
import { useRateWindows } from '../hooks/useRateWindows';
import { useTariffs } from '../hooks/useTariffs';
import { useRoomTypes } from '../../rooms/useRoomTypes';
import { useOrgId } from '@/core/auth/useOrg';
import { RateCalculationResult } from '../types/rateWindows';

export function RateCalculatorPreview() {
  const { orgId } = useOrgId();
  const { calculateRateWithWindows } = useRateWindows(orgId || '');
  const { tariffs, getTariffForRoom } = useTariffs(orgId || '');
  const { roomTypes } = useRoomTypes(orgId || '');
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [selectedClientType, setSelectedClientType] = useState('individual');
  const [nightsCount, setNightsCount] = useState(1);
  const [calculationResult, setCalculationResult] = useState<RateCalculationResult | null>(null);

  useEffect(() => {
    if (selectedRoomType && selectedDate) {
      // Get base tariff
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + nightsCount);
      
      const baseTariff = getTariffForRoom(
        selectedRoomType, 
        selectedDate, 
        endDate.toISOString().split('T')[0]
      );
      
      if (baseTariff) {
        const result = calculateRateWithWindows({
          date: selectedDate,
          roomType: selectedRoomType,
          clientType: selectedClientType,
          nightsCount,
          baseTariff: baseTariff.base_rate
        });
        
        setCalculationResult(result);
      } else {
        setCalculationResult(null);
      }
    }
  }, [selectedDate, selectedRoomType, selectedClientType, nightsCount, getTariffForRoom, calculateRateWithWindows]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulateur de Tarification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calc-date">Date d'arrivée</Label>
            <Input
              id="calc-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="calc-nights">Nombre de nuits</Label>
            <Input
              id="calc-nights"
              type="number"
              value={nightsCount}
              onChange={(e) => setNightsCount(parseInt(e.target.value) || 1)}
              min="1"
              max="365"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calc-room-type">Type de chambre</Label>
            <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes?.map((roomType) => (
                  <SelectItem key={roomType.id} value={roomType.code}>
                    {roomType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="calc-client-type">Type de clientèle</Label>
            <Select value={selectedClientType} onValueChange={setSelectedClientType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individuel</SelectItem>
                <SelectItem value="corporate">Entreprise</SelectItem>
                <SelectItem value="group">Groupe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calculation Results */}
        {calculationResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Tarif de base</div>
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(calculationResult.baseTariff)}
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Ajustements</div>
                <div className="flex items-center gap-2">
                  {calculationResult.totalSurcharge > 0 && (
                    <div className="text-sm text-success flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{formatCurrency(calculationResult.totalSurcharge)}
                    </div>
                  )}
                  {calculationResult.totalDiscount > 0 && (
                    <div className="text-sm text-destructive flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      -{formatCurrency(calculationResult.totalDiscount)}
                    </div>
                  )}
                  {calculationResult.adjustments.length === 0 && (
                    <div className="text-sm text-muted-foreground">Aucun</div>
                  )}
                </div>
              </Card>
              
              <Card className="p-4 border-accent-gold">
                <div className="text-sm text-muted-foreground">Tarif final</div>
                <div className="text-xl font-bold accent-gold">
                  {formatCurrency(calculationResult.finalRate)}
                </div>
              </Card>
            </div>

            {/* Detailed Adjustments */}
            {calculationResult.adjustments.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Détail des ajustements appliqués :</h4>
                <div className="space-y-2">
                  {calculationResult.adjustments.map((adjustment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {adjustment.type === 'percentage' ? (
                            <Percent className="h-3 w-3" />
                          ) : (
                            <DollarSign className="h-3 w-3" />
                          )}
                          Priorité {adjustment.priority}
                        </Badge>
                        <span className="font-medium">{adjustment.windowName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {adjustment.type === 'percentage' 
                            ? `${adjustment.value > 0 ? '+' : ''}${adjustment.value}%`
                            : `${adjustment.value > 0 ? '+' : ''}${formatCurrency(Math.abs(adjustment.value))}`
                          }
                        </span>
                        <span className={`font-medium ${adjustment.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {adjustment.amount >= 0 ? '+' : ''}{formatCurrency(adjustment.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total for stay */}
            <Card className="p-4 bg-primary/5 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total pour {nightsCount} nuit{nightsCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(calculationResult.finalRate * nightsCount)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Économie/Supplément</div>
                  <div className={`font-medium ${
                    (calculationResult.totalSurcharge - calculationResult.totalDiscount) >= 0 
                      ? 'text-success' 
                      : 'text-destructive'
                  }`}>
                    {(calculationResult.totalSurcharge - calculationResult.totalDiscount) >= 0 ? '+' : ''}
                    {formatCurrency((calculationResult.totalSurcharge - calculationResult.totalDiscount) * nightsCount)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {!calculationResult && selectedRoomType && (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun tarif trouvé pour cette configuration</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}