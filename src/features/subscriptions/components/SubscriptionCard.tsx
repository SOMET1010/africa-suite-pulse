import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/subscriptions';
import { calculateSubscriptionPrice } from '../api/subscriptions.api';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

export function SubscriptionCard({ 
  plan, 
  billingCycle, 
  isCurrentPlan, 
  isPopular, 
  onSelect,
  disabled 
}: SubscriptionCardProps) {
  const price = calculateSubscriptionPrice(plan, billingCycle);
  const monthlyPrice = billingCycle === 'yearly' ? price / 12 : price;
  const savings = billingCycle === 'yearly' && plan.price_yearly ? 
    Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100) : 0;

  const getPlanIcon = () => {
    switch (plan.slug) {
      case 'starter': return <Zap className="h-5 w-5" />;
      case 'business': return <Star className="h-5 w-5" />;
      case 'enterprise': return <Crown className="h-5 w-5" />;
      default: return <Check className="h-5 w-5" />;
    }
  };

  const getFeaturesList = () => {
    const features = [];
    if (plan.features.pms) features.push('PMS Complet');
    if (plan.features.pos) features.push('Point de Vente');
    if (plan.features.advanced_reports) features.push('Rapports Avancés');
    else if (plan.features.basic_reports) features.push('Rapports de Base');
    if (plan.features.inventory) features.push('Gestion Stock');
    if (plan.features.api_access) features.push('Accès API');
    if (plan.features.multi_property) features.push('Multi-Propriétés');
    if (plan.features.priority_support) features.push('Support Prioritaire');
    else if (plan.features.phone_support) features.push('Support Téléphonique');
    else if (plan.features.email_support) features.push('Support Email');
    
    return features;
  };

  return (
    <Card className={`relative ${isPopular ? 'border-primary ring-2 ring-primary/20' : ''} ${isCurrentPlan ? 'border-accent' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="bg-primary text-primary-foreground">
            Plus Populaire
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-2">
          {getPlanIcon()}
          <CardTitle className="ml-2 text-xl">{plan.name}</CardTitle>
        </div>
        
        <div className="space-y-1">
          <div className="text-3xl font-bold">
            {price.toLocaleString('fr-FR')}€
            {billingCycle === 'yearly' && (
              <span className="text-base font-normal text-muted-foreground ml-1">
                /an
              </span>
            )}
            {billingCycle === 'monthly' && (
              <span className="text-base font-normal text-muted-foreground ml-1">
                /mois
              </span>
            )}
          </div>
          
          {billingCycle === 'yearly' && savings > 0 && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                {monthlyPrice.toFixed(0)}€/mois facturé annuellement
              </div>
              <Badge variant="secondary" className="text-xs">
                Économisez {savings}%
              </Badge>
            </div>
          )}
        </div>
        
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Limits */}
        {(plan.max_rooms || plan.max_users) && (
          <div className="space-y-2">
            {plan.max_rooms && (
              <div className="flex justify-between text-sm">
                <span>Chambres max</span>
                <span className="font-medium">{plan.max_rooms}</span>
              </div>
            )}
            {plan.max_users && (
              <div className="flex justify-between text-sm">
                <span>Utilisateurs max</span>
                <span className="font-medium">{plan.max_users}</span>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Fonctionnalités incluses :</h4>
          <ul className="space-y-1">
            {getFeaturesList().map((feature) => (
              <li key={feature} className="flex items-center text-sm">
                <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={onSelect}
          disabled={disabled || isCurrentPlan}
          variant={isCurrentPlan ? "secondary" : isPopular ? "default" : "outline"}
          className="w-full"
        >
          {isCurrentPlan ? 'Plan Actuel' : 'Choisir ce Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
}