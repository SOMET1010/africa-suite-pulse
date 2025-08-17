import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Zap, DollarSign, Users, Calendar } from 'lucide-react';

interface PricingRecommendationsProps {
  orgId: string;
  strategy: 'aggressive' | 'moderate' | 'conservative';
}

export function PricingRecommendations({ orgId, strategy }: PricingRecommendationsProps) {
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);

  // Mock AI recommendations based on strategy
  const generateRecommendations = () => {
    const baseRecommendations = [
      {
        id: '1',
        type: 'price-increase',
        title: 'Augmenter les prix pour le week-end',
        description: 'Forte demande prévue pour les 2 prochains week-ends. Opportunité d\'augmenter les tarifs de 15-20%.',
        impact: 'high',
        confidence: 89,
        expectedRevenue: 450000,
        timeframe: '2-3 jours',
        priority: 1,
        roomTypes: ['Chambre Standard', 'Suite'],
        dates: ['2024-01-20', '2024-01-21', '2024-01-27', '2024-01-28'],
        currentPrice: 50000,
        recommendedPrice: 58000,
        reasoning: 'Occupation prévue à 92%, concurrent principal à +20% de nos tarifs'
      },
      {
        id: '2',
        type: 'dynamic-adjustment',
        title: 'Ajustement dynamique midweek',
        description: 'Demande plus faible en milieu de semaine. Réduire légèrement pour stimuler les réservations.',
        impact: 'medium',
        confidence: 76,
        expectedRevenue: -85000,
        timeframe: '5 jours',
        priority: 2,
        roomTypes: ['Chambre Standard'],
        dates: ['2024-01-23', '2024-01-24', '2024-01-25'],
        currentPrice: 50000,
        recommendedPrice: 47000,
        reasoning: 'Occupation prévue à 58%, concurrents agressifs sur ces dates'
      },
      {
        id: '3',
        type: 'yield-optimization',
        title: 'Optimisation yield pour les suites',
        description: 'Suites sous-exploitées. Créer des packages attractifs ou réduire les prix.',
        impact: 'medium',
        confidence: 82,
        expectedRevenue: 280000,
        timeframe: '7 jours',
        priority: 3,
        roomTypes: ['Suite Deluxe', 'Suite Présidentielle'],
        dates: ['2024-01-19', '2024-01-20', '2024-01-21'],
        currentPrice: 120000,
        recommendedPrice: 105000,
        reasoning: 'Taux d\'occupation des suites à 45%, potentiel de conversion élevé'
      },
      {
        id: '4',
        type: 'competitive-response',
        title: 'Réponse à la concurrence',
        description: 'Concurrent principal a baissé ses prix. Rester compétitif tout en préservant la marge.',
        impact: 'high',
        confidence: 91,
        expectedRevenue: 125000,
        timeframe: '1-2 jours',
        priority: 1,
        roomTypes: ['Chambre Standard'],
        dates: ['2024-01-19', '2024-01-20'],
        currentPrice: 50000,
        recommendedPrice: 48500,
        reasoning: 'Hôtel Riviera a baissé de 8%, risque de perte de parts de marché'
      }
    ];

    // Adjust recommendations based on strategy
    return baseRecommendations.map(rec => {
      let adjustedRec = { ...rec };
      
      if (strategy === 'aggressive') {
        if (rec.type === 'price-increase') {
          adjustedRec.recommendedPrice = Math.round(rec.recommendedPrice * 1.1);
          adjustedRec.expectedRevenue = Math.round(rec.expectedRevenue * 1.2);
        }
      } else if (strategy === 'conservative') {
        if (rec.type === 'price-increase') {
          adjustedRec.recommendedPrice = Math.round(rec.recommendedPrice * 0.95);
          adjustedRec.expectedRevenue = Math.round(rec.expectedRevenue * 0.8);
        }
      }
      
      return adjustedRec;
    }).sort((a, b) => a.priority - b.priority);
  };

  const recommendations = generateRecommendations();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-destructive border-destructive bg-destructive/10';
      case 'medium': return 'text-warning border-warning bg-warning/10';
      case 'low': return 'text-success border-success bg-success/10';
      default: return 'text-muted-foreground border-muted-foreground bg-muted/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price-increase': return <TrendingUp className="h-4 w-4" />;
      case 'dynamic-adjustment': return <Target className="h-4 w-4" />;
      case 'yield-optimization': return <DollarSign className="h-4 w-4" />;
      case 'competitive-response': return <Users className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const applyRecommendation = (recId: string) => {
    console.log('Applying recommendation:', recId);
    // In a real app, this would make an API call to update prices
  };

  const dismissRecommendation = (recId: string) => {
    console.log('Dismissing recommendation:', recId);
    // In a real app, this would remove the recommendation
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Recommandations IA - Stratégie {strategy}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-apply"
                  checked={autoApplyEnabled}
                  onCheckedChange={setAutoApplyEnabled}
                />
                <Label htmlFor="auto-apply">Application automatique des recommandations</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Les recommandations avec plus de 85% de confiance seront appliquées automatiquement
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {recommendations.length} recommandations actives
              </Badge>
              {autoApplyEnabled && (
                <Badge variant="outline" className="border-success text-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Auto-apply actif
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="glass-card border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(recommendation.type)}
                    <h3 className="text-lg font-semibold">{recommendation.title}</h3>
                    <Badge variant="outline" className={getImpactColor(recommendation.impact)}>
                      Impact {recommendation.impact}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{recommendation.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getConfidenceColor(recommendation.confidence)} border-current`}>
                    {recommendation.confidence}% confiance
                  </Badge>
                  <Badge variant="outline">
                    Priorité {recommendation.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Prix actuel</div>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(recommendation.currentPrice)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Prix recommandé</div>
                  <div className="text-lg font-bold text-success">
                    {formatCurrency(recommendation.recommendedPrice)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Impact revenus</div>
                  <div className={`text-lg font-bold ${recommendation.expectedRevenue >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {recommendation.expectedRevenue >= 0 ? '+' : ''}{formatCurrency(recommendation.expectedRevenue)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Délai</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-lg font-bold">{recommendation.timeframe}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Types de chambres concernées:</div>
                <div className="flex gap-2 flex-wrap">
                  {recommendation.roomTypes.map((roomType, index) => (
                    <Badge key={index} variant="secondary">
                      {roomType}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Dates concernées:</div>
                <div className="flex gap-2 flex-wrap">
                  {recommendation.dates.map((date, index) => (
                    <Badge key={index} variant="outline">
                      {new Date(date).toLocaleDateString('fr-FR')}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium mb-1">Justification IA:</div>
                <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => applyRecommendation(recommendation.id)}
                  className="flex items-center gap-2"
                  disabled={autoApplyEnabled && recommendation.confidence >= 85}
                >
                  <CheckCircle className="h-4 w-4" />
                  {autoApplyEnabled && recommendation.confidence >= 85 ? 'Appliqué automatiquement' : 'Appliquer'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => dismissRecommendation(recommendation.id)}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Ignorer
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Généré il y a 5 minutes par l'IA Revenue Management
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance des Recommandations IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border border-border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-success">94%</div>
              <div className="text-sm text-muted-foreground">Taux de succès</div>
            </div>
            
            <div className="text-center p-4 border border-border rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">
                +{formatCurrency(1250000)}
              </div>
              <div className="text-sm text-muted-foreground">Revenus supplémentaires (30j)</div>
            </div>
            
            <div className="text-center p-4 border border-border rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-info" />
              <div className="text-2xl font-bold text-info">87%</div>
              <div className="text-sm text-muted-foreground">Confiance moyenne</div>
            </div>
            
            <div className="text-center p-4 border border-border rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold text-warning">156</div>
              <div className="text-sm text-muted-foreground">Recommandations appliquées</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}