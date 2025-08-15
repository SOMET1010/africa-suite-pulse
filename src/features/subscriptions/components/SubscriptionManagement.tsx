import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Calendar, CreditCard, Settings, TrendingUp, Users, Building } from 'lucide-react';
import { SubscriptionCard } from './SubscriptionCard';
import { useSubscriptionPlans, useOrganizationSubscription, useSubscriptionUsage, useUpdateSubscription } from '../hooks/useSubscription';
import { calculateSubscriptionPrice, hasFeature, isUsageLimitReached } from '../api/subscriptions.api';
import { toast } from 'sonner';

export function SubscriptionManagement() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: subscription, isLoading: subscriptionLoading } = useOrganizationSubscription();
  const { data: usage } = useSubscriptionUsage();
  const updateSubscription = useUpdateSubscription();

  const handlePlanChange = async (planId: string) => {
    if (!subscription) {
      toast.error('Aucun abonnement actif trouvé');
      return;
    }

    try {
      await updateSubscription.mutateAsync({
        subscriptionId: subscription.id,
        updates: { 
          plan_id: planId,
          billing_cycle: billingCycle
        }
      });
    } catch (error) {
      console.error('Erreur lors du changement de plan:', error);
    }
  };

  const handleBillingCycleChange = async (yearly: boolean) => {
    const newCycle = yearly ? 'yearly' : 'monthly';
    setBillingCycle(newCycle);
    
    if (subscription) {
      try {
        await updateSubscription.mutateAsync({
          subscriptionId: subscription.id,
          updates: { billing_cycle: newCycle }
        });
      } catch (error) {
        console.error('Erreur lors du changement de cycle de facturation:', error);
      }
    }
  };

  if (plansLoading || subscriptionLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Choisissez votre plan</h1>
          <p className="text-muted-foreground">
            Sélectionnez le plan qui correspond le mieux à vos besoins
          </p>
        </div>
        
        <PlanSelection 
          plans={plans || []}
          billingCycle={billingCycle}
          onBillingCycleChange={handleBillingCycleChange}
          onPlanSelect={handlePlanChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion de l'abonnement</h1>
          <p className="text-muted-foreground">
            Gérez votre plan et suivez votre utilisation
          </p>
        </div>
        <Badge 
          variant={subscription.status === 'active' ? 'default' : 'destructive'}
          className="capitalize"
        >
          {subscription.status}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="plans">Changer de plan</TabsTrigger>
          <TabsTrigger value="billing">Facturation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CurrentPlanOverview subscription={subscription} usage={usage || []} />
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <UsageDetails subscription={subscription} usage={usage || []} />
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <PlanSelection 
            plans={plans || []}
            billingCycle={billingCycle}
            currentPlanId={subscription.plan_id}
            onBillingCycleChange={handleBillingCycleChange}
            onPlanSelect={handlePlanChange}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingDetails subscription={subscription} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CurrentPlanOverview({ subscription, usage }: { 
  subscription: any; 
  usage: any[] 
}) {
  const plan = subscription.plan;
  const currentPrice = calculateSubscriptionPrice(plan, subscription.billing_cycle);
  
  const roomsUsage = usage.find(u => u.metric_name === 'rooms')?.metric_value || 0;
  const usersUsage = usage.find(u => u.metric_name === 'users')?.metric_value || 0;
  
  const isRoomsLimitReached = isUsageLimitReached(subscription, usage, 'rooms');
  const isUsersLimitReached = isUsageLimitReached(subscription, usage, 'users');

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plan Actuel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="text-muted-foreground">{plan.description}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Prix</span>
              <span className="font-medium">
                {currentPrice.toLocaleString('fr-FR')}€/{subscription.billing_cycle === 'yearly' ? 'an' : 'mois'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Cycle de facturation</span>
              <span className="font-medium capitalize">{subscription.billing_cycle}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Statut</span>
              <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                {subscription.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Utilisation Actuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.max_rooms && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Chambres
                </span>
                <span>{roomsUsage} / {plan.max_rooms}</span>
              </div>
              <Progress 
                value={(roomsUsage / plan.max_rooms) * 100} 
                className={isRoomsLimitReached ? 'bg-destructive/20' : ''}
              />
              {isRoomsLimitReached && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Limite atteinte
                </div>
              )}
            </div>
          )}

          {plan.max_users && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Utilisateurs
                </span>
                <span>{usersUsage} / {plan.max_users}</span>
              </div>
              <Progress 
                value={(usersUsage / plan.max_users) * 100}
                className={isUsersLimitReached ? 'bg-destructive/20' : ''}
              />
              {isUsersLimitReached && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Limite atteinte
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UsageDetails({ subscription, usage }: { 
  subscription: any; 
  usage: any[] 
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {usage.map((metric) => (
        <Card key={metric.metric_name}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium capitalize">
              {metric.metric_name === 'rooms' ? 'Chambres' :
               metric.metric_name === 'users' ? 'Utilisateurs' :
               metric.metric_name === 'transactions' ? 'Transactions' :
               metric.metric_name === 'api_calls' ? 'Appels API' :
               metric.metric_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.metric_value.toLocaleString('fr-FR')}</div>
            <p className="text-xs text-muted-foreground">
              Période actuelle
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PlanSelection({ 
  plans, 
  billingCycle, 
  currentPlanId,
  onBillingCycleChange, 
  onPlanSelect 
}: {
  plans: any[];
  billingCycle: 'monthly' | 'yearly';
  currentPlanId?: string;
  onBillingCycleChange: (yearly: boolean) => void;
  onPlanSelect: (planId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center space-x-4">
        <span className={billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
          Mensuel
        </span>
        <Switch
          checked={billingCycle === 'yearly'}
          onCheckedChange={onBillingCycleChange}
        />
        <span className={billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}>
          Annuel
        </span>
        {billingCycle === 'yearly' && (
          <Badge variant="secondary" className="ml-2">
            Économisez jusqu'à 17%
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            isCurrentPlan={currentPlanId === plan.id}
            isPopular={plan.slug === 'business'}
            onSelect={() => onPlanSelect(plan.id)}
          />
        ))}
      </div>
    </div>
  );
}

function BillingDetails({ subscription }: { subscription: any }) {
  const nextBillingDate = new Date(subscription.current_period_end);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informations de Facturation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium">Prochaine facturation</h4>
              <p className="text-muted-foreground">
                {nextBillingDate.toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Cycle de facturation</h4>
              <p className="text-muted-foreground capitalize">
                {subscription.billing_cycle}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Statut</h4>
              <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                {subscription.status}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-medium">Frais d'installation</h4>
              <Badge variant={subscription.setup_fee_paid ? 'default' : 'secondary'}>
                {subscription.setup_fee_paid ? 'Payé' : 'En attente'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}