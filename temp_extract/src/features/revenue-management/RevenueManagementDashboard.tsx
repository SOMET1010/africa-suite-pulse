import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Brain, BarChart3, DollarSign, Calendar, Users, Percent, Crown, Sparkles, Activity, Zap } from 'lucide-react';
import { useOrgId } from '@/core/auth/useOrg';
import { DynamicPricingEngine } from './components/DynamicPricingEngine';
import { YieldOptimization } from './components/YieldOptimization';
import { DemandForecasting } from './components/DemandForecasting';
import { CompetitorAnalysis } from './components/CompetitorAnalysis';
import { RevenueKPIs } from './components/RevenueKPIs';
import { PricingRecommendations } from './components/PricingRecommendations';

export function RevenueManagementDashboard() {
  const { orgId } = useOrgId();
  const [activeStrategy, setActiveStrategy] = useState<'aggressive' | 'moderate' | 'conservative'>('moderate');

  if (!orgId) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-pearl">
      <div className="absolute inset-0 bg-gradient-to-br from-pearl via-background to-platinum/50" />
      
      <div className="relative container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <nav className="text-sm text-muted-foreground mb-6 font-premium">
            <span>Analytics</span> 
            <Crown className="inline mx-2 h-3 w-3 accent-gold" />
            <span className="accent-gold font-medium">Revenue Management</span>
          </nav>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 glass-card border-accent-gold shadow-luxury rounded-xl">
                  <TrendingUp className="h-8 w-8 accent-gold" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-luxury font-bold text-charcoal leading-tight">
                    Revenue Management
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 accent-gold" />
                    <span className="text-lg text-muted-foreground font-premium">
                      Optimisation intelligente des revenus avec IA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                <Badge variant="outline" className="border-success text-success">
                  Stratégie: {activeStrategy}
                </Badge>
              </div>
              <Button 
                onClick={() => setActiveStrategy(activeStrategy === 'aggressive' ? 'moderate' : 'aggressive')}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Optimiser
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs Overview */}
        <RevenueKPIs orgId={orgId} />

        {/* Main Tabs */}
        <Tabs defaultValue="pricing" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-4xl">
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Tarification Dynamique
            </TabsTrigger>
            <TabsTrigger value="yield" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Yield Management
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Prévisions
            </TabsTrigger>
            <TabsTrigger value="competitor" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Concurrence
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Recommandations IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-6">
            <DynamicPricingEngine orgId={orgId} strategy={activeStrategy} />
          </TabsContent>

          <TabsContent value="yield" className="space-y-6">
            <YieldOptimization orgId={orgId} strategy={activeStrategy} />
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <DemandForecasting orgId={orgId} />
          </TabsContent>

          <TabsContent value="competitor" className="space-y-6">
            <CompetitorAnalysis orgId={orgId} />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <PricingRecommendations orgId={orgId} strategy={activeStrategy} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}