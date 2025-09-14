import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerSegment } from "../types/advanced";
import { Users, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

interface SegmentationPanelProps {
  data: CustomerSegment[];
  isLoading: boolean;
}

export function SegmentationPanel({ data, isLoading }: SegmentationPanelProps) {
  const getLoyaltyColor = (loyalty: string) => {
    switch (loyalty) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'destructive';
      default: return 'secondary';
    }
  };

  const getLoyaltyLabel = (loyalty: string) => {
    switch (loyalty) {
      case 'high': return 'Fidèle';
      case 'medium': return 'Modéré';
      case 'low': return 'Occasionnel';
      default: return loyalty;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Segmentation Clientèle Automatique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-lg"></div>
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
          <CardTitle>Segmentation Clientèle Automatique</CardTitle>
          <CardDescription>
            Analyse intelligente des profils clients et comportements d'achat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((segment) => (
              <Card key={segment.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">{segment.name}</h4>
                    </div>
                    <Badge variant={getLoyaltyColor(segment.loyalty) as any}>
                      {getLoyaltyLabel(segment.loyalty)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Taille du segment</span>
                      <div className="text-right">
                        <div className="font-medium">{segment.size.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{segment.percentage.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Dépense moyenne
                      </span>
                      <div className="font-medium">
                        {segment.averageSpend.toLocaleString('fr-FR', { 
                          style: 'currency', 
                          currency: 'XOF',
                          minimumFractionDigits: 0 
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Séjour moyen
                      </span>
                      <div className="font-medium">
                        {segment.averageStayLength.toFixed(1)} nuits
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Croissance</span>
                      <div className="flex items-center gap-1">
                        {segment.trends.growth > 0 ? (
                          <TrendingUp className="h-3 w-3 text-success" />
                        ) : segment.trends.growth < 0 ? (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        ) : null}
                        <span className={`text-sm font-medium ${
                          segment.trends.growth > 0 ? 'text-success' : 
                          segment.trends.growth < 0 ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          {segment.trends.growth > 0 ? '+' : ''}{segment.trends.growth.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Segment Criteria */}
                  <div className="pt-3 border-t">
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Critères du segment</h5>
                    <div className="space-y-1">
                      {segment.criteria.bookingSource && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Sources: </span>
                          {segment.criteria.bookingSource.join(', ')}
                        </div>
                      )}
                      {segment.criteria.stayLength && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Durée: </span>
                          {segment.criteria.stayLength.min}-{segment.criteria.stayLength.max} nuits
                        </div>
                      )}
                      {segment.criteria.frequency && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Fréquence: </span>
                          {segment.criteria.frequency}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seasonality */}
                  {segment.trends.seasonality.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">Saisonnalité</h5>
                      <div className="flex flex-wrap gap-1">
                        {segment.trends.seasonality.map((season, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {season}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      Analyser ce segment
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}