import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePersonalizedMenu } from '../hooks/usePersonalizedMenu';
import { Sparkles, TrendingUp, Clock, Star, RefreshCw } from 'lucide-react';

interface PersonalizedMenuRecommendationsProps {
  guestId?: string;
  orgId: string;
  currentMenu?: any[];
  onAddToCart?: (item: any) => void;
  className?: string;
}

export const PersonalizedMenuRecommendations: React.FC<PersonalizedMenuRecommendationsProps> = ({
  guestId,
  orgId,
  currentMenu = [],
  onAddToCart,
  className = ""
}) => {
  const {
    recommendations,
    insights,
    personalizationScore,
    isLoading,
    isError,
    hasPersonalization,
    refreshRecommendations
  } = usePersonalizedMenu({
    guestId,
    orgId,
    currentMenu,
    enabled: !!guestId
  });

  if (!guestId) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Connectez-vous pour des recommandations personnalisées</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !hasPersonalization) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Commandez quelques fois pour débloquer vos recommandations personnalisées !</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-success/10 text-success border-success/20';
    if (confidence >= 0.6) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-muted/50 text-muted-foreground border-border';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <Star className="h-3 w-3" />;
    if (confidence >= 0.6) return <TrendingUp className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommandations Personnalisées
            </CardTitle>
            <CardDescription>
              Basées sur vos {insights.visitFrequency} visites précédentes
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Score: {Math.round(personalizationScore * 100)}%
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshRecommendations}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucune recommandation disponible pour le moment</p>
          </div>
        ) : (
          recommendations.map((recommendation, index) => (
            <div 
              key={recommendation.id || index}
              className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{recommendation.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getConfidenceColor(recommendation.confidence)}`}
                    >
                      {getConfidenceIcon(recommendation.confidence)}
                      {Math.round(recommendation.confidence * 100)}%
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {recommendation.reason}
                  </p>
                </div>

                {onAddToCart && (
                  <Button
                    size="sm"
                    onClick={() => onAddToCart(recommendation)}
                    className="shrink-0"
                  >
                    Ajouter
                  </Button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Insights rapides */}
        {Object.keys(insights.preferredCategories).length > 0 && (
          <div className="pt-4 border-t">
            <h5 className="text-sm font-medium mb-2">Vos préférences</h5>
            <div className="flex flex-wrap gap-1">
              {Object.entries(insights.preferredCategories)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([category, count]) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category} ({count})
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};