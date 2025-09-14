import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Crown, 
  XCircle,
  DollarSign,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import { usePredictiveAnalytics } from '../hooks/usePredictiveAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function PredictiveInsights() {
  const { data: insights, isLoading, error } = usePredictiveAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !insights) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
          <p className="text-muted-foreground">Impossible de charger les prédictions</p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Occupancy Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prévision d'Occupation (7 jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.occupancyForecast.slice(0, 7).map((forecast, index) => (
              <div key={forecast.date} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium min-w-0">
                    {format(new Date(forecast.date), 'EEEE dd MMM', { locale: fr })}
                  </span>
                  {getTrendIcon(forecast.trend)}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {Math.round(forecast.predictedOccupancy * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Confiance: {Math.round(forecast.confidence * 100)}%
                    </p>
                  </div>
                  <Progress 
                    value={forecast.predictedOccupancy * 100} 
                    className="w-20" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recommandations Tarifaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ADR Actuel</span>
                <span className="font-medium">{insights.revenueRecommendations.currentADR.toLocaleString()} XOF</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ADR Suggéré</span>
                <span className="font-medium text-success">
                  {insights.revenueRecommendations.suggestedADR.toLocaleString()} XOF
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Augmentation Potentielle</span>
                <Badge variant="outline" className="text-success border-success/50">
                  +{insights.revenueRecommendations.potentialIncrease.toLocaleString()} XOF
                </Badge>
              </div>
              <Progress value={insights.revenueRecommendations.confidence * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground text-center">
                Confiance: {Math.round(insights.revenueRecommendations.confidence * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* VIP Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Clients VIP Détectés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.vipDetection.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun client VIP détecté récemment
                </p>
              ) : (
                insights.vipDetection.slice(0, 3).map((vip, index) => (
                  <div key={vip.guestId} className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-yellow-500/5 to-yellow-500/10">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{vip.guestName}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vip.reasons.slice(0, 2).map((reason, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-700">
                        {Math.round(vip.score)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* No-Show Prediction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Risque No-Show
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.noShowPrediction.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun risque de no-show détecté
                </p>
              ) : (
                insights.noShowPrediction.slice(0, 3).map((prediction, index) => (
                  <div key={prediction.reservationId} className="flex items-center justify-between p-3 rounded-lg border bg-destructive/5">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{prediction.guestName}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prediction.factors.slice(0, 2).map((factor, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={prediction.riskScore > 70 ? 'destructive' : 'outline'}
                        className={prediction.riskScore > 70 ? '' : 'border-warning/50 text-warning'}
                      >
                        {prediction.riskScore}%
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendances Saisonnières
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.seasonalPatterns.slice(-3).map((pattern, index) => (
                <div key={pattern.month} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                  <div>
                    <p className="font-medium text-sm">
                      {format(new Date(pattern.month + '-01'), 'MMMM yyyy', { locale: fr })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ADR: {pattern.avgADR.toLocaleString()} XOF
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {Math.round(pattern.avgOccupancy * 100)}%
                      </span>
                      <Badge 
                        variant={pattern.trend === 'high' ? 'default' : 
                                pattern.trend === 'medium' ? 'secondary' : 'outline'}
                        className={
                          pattern.trend === 'high' ? 'bg-success text-success-foreground' :
                          pattern.trend === 'medium' ? 'bg-warning text-warning-foreground' : ''
                        }
                      >
                        {pattern.trend}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}