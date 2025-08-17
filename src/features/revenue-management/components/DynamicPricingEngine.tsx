import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Calendar, Users, Percent, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DynamicPricingEngineProps {
  orgId: string;
  strategy: 'aggressive' | 'moderate' | 'conservative';
}

export function DynamicPricingEngine({ orgId, strategy }: DynamicPricingEngineProps) {
  const [autoPricingEnabled, setAutoPricingEnabled] = useState(false);
  const [priceFloor, setPriceFloor] = useState([30000]);
  const [priceCeiling, setPriceCeiling] = useState([150000]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');

  const { data: roomTypes } = useQuery({
    queryKey: ['room-types', orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from('room_types')
        .select('*')
        .eq('org_id', orgId);
      return data || [];
    }
  });

  const { data: pricingData } = useQuery({
    queryKey: ['dynamic-pricing', orgId, selectedRoomType],
    queryFn: async () => {
      // Simulate dynamic pricing calculations
      const today = new Date();
      const next30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        return date;
      });

      const pricingRecommendations = next30Days.map(date => {
        // Simulate occupancy prediction and pricing
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHighSeason = date.getMonth() >= 11 || date.getMonth() <= 2; // Dec-Feb

        let baseOccupancy = 0.7;
        if (isWeekend) baseOccupancy += 0.15;
        if (isHighSeason) baseOccupancy += 0.1;

        // Add some randomness
        const occupancyPrediction = Math.min(0.95, Math.max(0.3, baseOccupancy + (Math.random() - 0.5) * 0.2));

        let priceMultiplier = 1;
        if (strategy === 'aggressive') {
          if (occupancyPrediction > 0.8) priceMultiplier = 1.4;
          else if (occupancyPrediction > 0.6) priceMultiplier = 1.2;
          else priceMultiplier = 0.9;
        } else if (strategy === 'moderate') {
          if (occupancyPrediction > 0.8) priceMultiplier = 1.2;
          else if (occupancyPrediction > 0.6) priceMultiplier = 1.1;
          else priceMultiplier = 0.95;
        } else { // conservative
          if (occupancyPrediction > 0.8) priceMultiplier = 1.1;
          else if (occupancyPrediction > 0.6) priceMultiplier = 1.05;
          else priceMultiplier = 0.98;
        }

        const recommendedPrice = Math.round(50000 * priceMultiplier);
        const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

        return {
          date: date.toISOString().split('T')[0],
          occupancyPrediction: occupancyPrediction * 100,
          recommendedPrice,
          priceChange: ((priceMultiplier - 1) * 100),
          confidence: confidence * 100,
          status: occupancyPrediction > 0.8 ? 'high-demand' : occupancyPrediction > 0.6 ? 'normal' : 'low-demand'
        };
      });

      return pricingRecommendations;
    },
    refetchInterval: 300000 // 5 minutes
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high-demand': return 'text-destructive';
      case 'normal': return 'text-success';
      case 'low-demand': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high-demand': return <AlertTriangle className="h-4 w-4" />;
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'low-demand': return <Target className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Configuration de la Tarification Dynamique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch
                  checked={autoPricingEnabled}
                  onCheckedChange={setAutoPricingEnabled}
                />
                Tarification automatique
              </Label>
              <p className="text-sm text-muted-foreground">
                Active les ajustements de prix automatiques
              </p>
            </div>

            <div className="space-y-2">
              <Label>Type de chambre</Label>
              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {roomTypes?.map(type => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prix plancher: {formatCurrency(priceFloor[0])}</Label>
              <Slider
                value={priceFloor}
                onValueChange={setPriceFloor}
                max={100000}
                min={20000}
                step={5000}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Prix plafond: {formatCurrency(priceCeiling[0])}</Label>
              <Slider
                value={priceCeiling}
                onValueChange={setPriceCeiling}
                max={200000}
                min={50000}
                step={5000}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Stratégie: {strategy}
            </Badge>
            {autoPricingEnabled && (
              <Badge variant="outline" className="border-success text-success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Actif
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Calendar */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendrier des Prix Recommandés (30 prochains jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingData?.slice(0, 21).map((day, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short', 
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <div className={`flex items-center gap-1 ${getStatusColor(day.status)}`}>
                    {getStatusIcon(day.status)}
                    <Badge variant="outline" className={`text-xs ${getStatusColor(day.status)}`}>
                      {day.occupancyPrediction.toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(day.recommendedPrice)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {day.priceChange >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-destructive rotate-180" />
                    )}
                    <span className={day.priceChange >= 0 ? 'text-success' : 'text-destructive'}>
                      {day.priceChange >= 0 ? '+' : ''}{day.priceChange.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Confiance: {day.confidence.toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="outline">
              Voir tous les 30 jours
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-success/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus Potentiels (+7j)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              +{formatCurrency(245000)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs tarifs statiques
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ajustements Moyens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              +8.5%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              sur le tarif de base
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Précision Prédictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              87%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              taux de succès historique
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}