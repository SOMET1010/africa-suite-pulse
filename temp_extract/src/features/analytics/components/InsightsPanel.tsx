import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BusinessInsight } from "../types/advanced";
import { Lightbulb, TrendingUp, DollarSign, Target, Brain, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface InsightsPanelProps {
  data: BusinessInsight[];
  isLoading: boolean;
}

export function InsightsPanel({ data, isLoading }: InsightsPanelProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'operations': return <Target className="h-4 w-4" />;
      case 'marketing': return <TrendingUp className="h-4 w-4" />;
      case 'strategy': return <Brain className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'success';
      case 'operations': return 'info';
      case 'marketing': return 'warning';
      case 'strategy': return 'primary';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEffortLabel = (effort: string) => {
    switch (effort) {
      case 'low': return 'Faible';
      case 'medium': return 'Moyen';
      case 'high': return 'Élevé';
      default: return effort;
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'low': return 'Faible';
      case 'medium': return 'Moyen';
      case 'high': return 'Fort';
      default: return impact;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Insights Intelligence Business</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Insights Intelligence Business
              </CardTitle>
              <CardDescription>
                Analyses automatiques et recommandations basées sur l'IA
              </CardDescription>
            </div>
            <Button className="gap-2">
              <Brain className="h-4 w-4" />
              Générer de nouvelles insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.length > 0 ? (
              data.map((insight) => (
                <Card key={insight.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`
                          p-2 rounded-lg
                          ${insight.category === 'revenue' ? 'bg-success/10 text-success' : ''}
                          ${insight.category === 'operations' ? 'bg-info/10 text-info' : ''}
                          ${insight.category === 'marketing' ? 'bg-warning/10 text-warning' : ''}
                          ${insight.category === 'strategy' ? 'bg-primary/10 text-primary' : ''}
                        `}>
                          {getCategoryIcon(insight.category)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{insight.title}</h3>
                            <Badge variant={getPriorityColor(insight.priority) as any}>
                              Priorité {insight.priority}
                            </Badge>
                            <Badge variant={getCategoryColor(insight.category) as any}>
                              {insight.category}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{insight.summary}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {format(insight.generatedAt, 'dd MMM yyyy', { locale: fr })}
                        </div>
                        {insight.isActionable && (
                          <Badge variant="outline" className="mt-1">
                            Actionnable
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none">
                      <p>{insight.details}</p>
                    </div>

                    {/* Data Points */}
                    {insight.dataPoints.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                        {insight.dataPoints.map((point, index) => (
                          <div key={index} className="text-center">
                            <div className="text-2xl font-bold">{point.value.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">{point.metric}</div>
                            {point.comparison && (
                              <div className="text-xs text-muted-foreground">
                                vs {point.comparison.period}: {point.comparison.change > 0 ? '+' : ''}{point.comparison.change.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Potential Impact */}
                    {insight.potentialImpact && (
                      <div className="flex items-center gap-6 p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Impact potentiel:</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          {insight.potentialImpact.revenue && (
                            <div>
                              <span className="text-muted-foreground">Revenus: </span>
                              <span className="font-medium text-success">
                                +{insight.potentialImpact.revenue.toLocaleString('fr-FR', { 
                                  style: 'currency', 
                                  currency: 'XOF',
                                  minimumFractionDigits: 0 
                                })}
                              </span>
                            </div>
                          )}
                          {insight.potentialImpact.occupancy && (
                            <div>
                              <span className="text-muted-foreground">Occupation: </span>
                              <span className="font-medium text-info">
                                +{insight.potentialImpact.occupancy.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {insight.potentialImpact.efficiency && (
                            <div>
                              <span className="text-muted-foreground">Efficacité: </span>
                              <span className="font-medium">{insight.potentialImpact.efficiency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {insight.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold">Recommandations:</h4>
                        <div className="space-y-3">
                          {insight.recommendations.map((rec) => (
                            <Card key={rec.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium">{rec.title}</h5>
                                    <Badge variant={getPriorityColor(rec.priority) as any} className="text-xs">
                                      {rec.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span>
                                      <span className="text-muted-foreground">Effort: </span>
                                      {getEffortLabel(rec.effort)}
                                    </span>
                                    <span>
                                      <span className="text-muted-foreground">Impact: </span>
                                      {getImpactLabel(rec.impact)}
                                    </span>
                                    <span>
                                      <span className="text-muted-foreground">Délai: </span>
                                      {rec.timeframe}
                                    </span>
                                    {rec.estimatedROI && (
                                      <span>
                                        <span className="text-muted-foreground">ROI: </span>
                                        <span className="text-success">+{rec.estimatedROI}%</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  Implémenter
                                </Button>
                              </div>
                              
                              {rec.actionSteps.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <h6 className="text-xs font-medium mb-2">Étapes d'action:</h6>
                                  <ol className="text-xs space-y-1">
                                    {rec.actionSteps.map((step, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <span className="text-muted-foreground">{index + 1}.</span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4" />
                <p>Aucune insight disponible</p>
                <p className="text-sm">L'IA analyse vos données pour générer de nouveaux insights</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}