import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RateManagementService, RateWindow, SeasonalRate } from '@/services/rateManagement.api';
import { useToast } from '@/hooks/use-toast';

export function useAdvancedRateWindows(orgId: string) {
  const [rateWindows, setRateWindows] = useState<RateWindow[]>([]);
  const [seasonalRates, setSeasonalRates] = useState<SeasonalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!orgId) return;
      
      try {
        setLoading(true);
        const [windows, seasonal] = await Promise.all([
          RateManagementService.getRateWindows(orgId),
          RateManagementService.getSeasonalRates(orgId)
        ]);
        
        setRateWindows(windows);
        setSeasonalRates(seasonal);
      } catch (error) {
        console.error('Error loading rate data:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données de tarification',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orgId, toast]);

  // Create rate window
  const createRateWindow = useMutation({
    mutationFn: async (data: Omit<RateWindow, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => {
      return await RateManagementService.createRateWindow(data);
    },
    onSuccess: (newWindow) => {
      setRateWindows(prev => [...prev, newWindow]);
      toast({
        title: 'Succès',
        description: 'Fenêtre de tarification créée'
      });
      queryClient.invalidateQueries({ queryKey: ['rate-windows', orgId] });
    },
    onError: (error) => {
      console.error('Error creating rate window:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la fenêtre de tarification',
        variant: 'destructive'
      });
    }
  });

  // Create seasonal rate
  const createSeasonalRate = useMutation({
    mutationFn: async (data: Omit<SeasonalRate, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => {
      return await RateManagementService.createSeasonalRate(data);
    },
    onSuccess: (newRate) => {
      setSeasonalRates(prev => [...prev, newRate]);
      toast({
        title: 'Succès',
        description: 'Tarif saisonnier créé'
      });
      queryClient.invalidateQueries({ queryKey: ['seasonal-rates', orgId] });
    },
    onError: (error) => {
      console.error('Error creating seasonal rate:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le tarif saisonnier',
        variant: 'destructive'
      });
    }
  });

  // Calculate advanced rate
  const calculateAdvancedRate = async (params: any) => {
    try {
      return await RateManagementService.calculateAdvancedRate(params, orgId);
    } catch (error) {
      console.error('Error calculating rate:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du calcul du tarif',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Calculate yield rate
  const calculateYieldRate = async (params: any, occupancyRate?: number) => {
    try {
      return await RateManagementService.calculateYieldRate(params, orgId, occupancyRate);
    } catch (error) {
      console.error('Error calculating yield rate:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du calcul du yield rate',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    rateWindows,
    seasonalRates,
    loading,
    createRateWindow,
    createSeasonalRate,
    calculateAdvancedRate,
    calculateYieldRate
  };
}