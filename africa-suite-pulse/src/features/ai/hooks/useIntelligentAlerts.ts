import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrgId } from '@/core/auth/useOrg';

interface IntelligentAlert {
  id: string;
  type: 'opportunity' | 'warning' | 'risk' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  category: string;
  actionRequired: boolean;
  recommendedAction: string;
  potentialImpact: string;
  confidence: number;
  triggerData: any;
  createdAt: Date;
  resolvedAt?: Date;
  isActive: boolean;
}

export function useIntelligentAlerts() {
  const { orgId } = useOrgId();
  const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAlerts = async (analyticsData: any) => {
    if (!orgId) {
      setError('Organisation ID manquant');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('ai-smart-suggestions', {
        body: {
          context: 'intelligent_alerts',
          data: analyticsData,
          orgId
        }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Transform AI suggestions into alerts
      const aiAlerts: IntelligentAlert[] = data.suggestions?.map((suggestion: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        type: determineAlertType(suggestion),
        severity: suggestion.priority === 'high' ? 'high' : suggestion.priority === 'medium' ? 'medium' : 'low',
        title: suggestion.title,
        message: suggestion.description,
        category: suggestion.category || 'général',
        actionRequired: suggestion.priority === 'high',
        recommendedAction: suggestion.action || 'Aucune action spécifiée',
        potentialImpact: suggestion.impact || 'Impact non déterminé',
        confidence: suggestion.confidence || 75,
        triggerData: analyticsData,
        createdAt: new Date(),
        isActive: true
      })) || [];

      // Add rule-based alerts
      const ruleBasedAlerts = generateRuleBasedAlerts(analyticsData);
      
      setAlerts([...aiAlerts, ...ruleBasedAlerts]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur génération alertes:', err);
      
      // Fallback to rule-based alerts only
      const fallbackAlerts = generateRuleBasedAlerts(analyticsData);
      setAlerts(fallbackAlerts);
    } finally {
      setIsLoading(false);
    }
  };

  const determineAlertType = (suggestion: any): IntelligentAlert['type'] => {
    if (suggestion.category?.includes('opportunity') || suggestion.title?.includes('opportunité')) {
      return 'opportunity';
    }
    if (suggestion.priority === 'high' && suggestion.category?.includes('risk')) {
      return 'risk';
    }
    if (suggestion.category?.includes('performance')) {
      return 'performance';
    }
    return 'warning';
  };

  const generateRuleBasedAlerts = (data: any): IntelligentAlert[] => {
    const alerts: IntelligentAlert[] = [];
    
    // Occupancy rate alerts
    if (data.occupancyRate > 90) {
      alerts.push({
        id: `rule-occupancy-high-${Date.now()}`,
        type: 'opportunity',
        severity: 'high',
        title: 'Taux d\'occupation très élevé',
        message: `Taux d'occupation à ${data.occupancyRate}%. Opportunité d'optimisation tarifaire.`,
        category: 'Revenue Management',
        actionRequired: true,
        recommendedAction: 'Augmenter les tarifs de 10-20%',
        potentialImpact: '+15-25% revenus',
        confidence: 95,
        triggerData: data,
        createdAt: new Date(),
        isActive: true
      });
    } else if (data.occupancyRate < 50) {
      alerts.push({
        id: `rule-occupancy-low-${Date.now()}`,
        type: 'risk',
        severity: 'high',
        title: 'Taux d\'occupation faible',
        message: `Taux d'occupation à ${data.occupancyRate}%. Action urgente requise.`,
        category: 'Marketing',
        actionRequired: true,
        recommendedAction: 'Lancer des promotions et contacter les TO',
        potentialImpact: 'Éviter perte de revenus',
        confidence: 90,
        triggerData: data,
        createdAt: new Date(),
        isActive: true
      });
    }

    // ADR alerts
    if (data.adr && data.adr < 40000) {
      alerts.push({
        id: `rule-adr-low-${Date.now()}`,
        type: 'warning',
        severity: 'medium',
        title: 'ADR sous les objectifs',
        message: `ADR actuel: ${data.adr} F CFA. Objectif: 50,000 F CFA.`,
        category: 'Pricing',
        actionRequired: false,
        recommendedAction: 'Revoir la stratégie tarifaire',
        potentialImpact: 'Amélioration marge',
        confidence: 80,
        triggerData: data,
        createdAt: new Date(),
        isActive: true
      });
    }

    return alerts;
  };

  const resolveAlert = async (alertId: string) => {
    setAlerts(current => 
      current.map(alert => 
        alert.id === alertId 
          ? { ...alert, isActive: false, resolvedAt: new Date() }
          : alert
      )
    );
  };

  const getActiveAlerts = () => alerts.filter(alert => alert.isActive);
  const getAlertsByType = (type: IntelligentAlert['type']) => 
    alerts.filter(alert => alert.type === type && alert.isActive);
  const getAlertsBySeverity = (severity: IntelligentAlert['severity']) => 
    alerts.filter(alert => alert.severity === severity && alert.isActive);

  return {
    alerts: getActiveAlerts(),
    allAlerts: alerts,
    isLoading,
    error,
    generateAlerts,
    resolveAlert,
    getAlertsByType,
    getAlertsBySeverity,
    stats: {
      total: getActiveAlerts().length,
      high: getAlertsBySeverity('high').length,
      medium: getAlertsBySeverity('medium').length,
      low: getAlertsBySeverity('low').length,
      opportunities: getAlertsByType('opportunity').length,
      risks: getAlertsByType('risk').length
    }
  };
}