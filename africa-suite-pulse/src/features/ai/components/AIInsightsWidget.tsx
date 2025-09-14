import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { useAIInsights } from '../hooks/useAIInsights';
import { useEffect } from 'react';

interface AIInsightsWidgetProps {
  analyticsData?: any;
  className?: string;
}

export function AIInsightsWidget({ analyticsData, className }: AIInsightsWidgetProps) {
  const { insights, isLoading, error, generateInsights } = useAIInsights();

  useEffect(() => {
    if (analyticsData && !insights) {
      generateInsights(analyticsData);
    }
  }, [analyticsData]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue': return TrendingUp;
      case 'operations': return AlertTriangle;
      default: return Lightbulb;
    }
  };

  if (isLoading) {
    return (
      <Card className={`glass-card border-0 shadow-soft p-4 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Génération d'insights IA...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`glass-card border-0 shadow-soft p-4 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => analyticsData && generateInsights(analyticsData)}
          >
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className={`glass-card border-0 shadow-soft p-4 ${className}`}>
        <div className="text-center">
          <Brain className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucun insight disponible</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => analyticsData && generateInsights(analyticsData)}
          >
            Générer des insights
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`glass-card border-0 shadow-soft ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Insights IA</h3>
            <Badge variant="secondary" className="text-xs">
              {insights.provider}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => analyticsData && generateInsights(analyticsData)}
            className="text-xs"
          >
            Actualiser
          </Button>
        </div>

        {/* Résumé */}
        <div className="mb-4 p-3 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">{insights.summary}</p>
        </div>

        {/* Insights principaux */}
        <div className="space-y-3 mb-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Insights Principaux
          </h4>
          {insights.insights.slice(0, 3).map((insight, index) => {
            const Icon = getTypeIcon(insight.type);
            return (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/10">
                <Icon className={`h-4 w-4 mt-0.5 ${getImpactColor(insight.impact)}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-medium">{insight.title}</h5>
                    <Badge 
                      variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {insight.impact}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  <p className="text-xs font-medium text-primary mt-1">{insight.metric}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommandations */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Recommandations
          </h4>
          {insights.recommendations.slice(0, 2).map((rec, index) => (
            <div key={index} className="p-2 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-l-2 border-primary">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-medium">{rec.title}</h5>
                <Badge 
                  variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {rec.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="text-green-600">Impact: {rec.expectedImpact}</span>
                <span className="text-muted-foreground">Délai: {rec.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}