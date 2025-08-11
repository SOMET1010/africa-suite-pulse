import { useState, useEffect, useCallback } from 'react';
import { ServicesService } from './servicesService';
import type { ServiceFamily, Service, Arrangement, ServiceStats } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useServices(orgId: string) {
  const [families, setFamilies] = useState<ServiceFamily[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [arrangements, setArrangements] = useState<Arrangement[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [familiesData, servicesData, arrangementsData, statsData] = await Promise.all([
        ServicesService.getFamilies(orgId),
        ServicesService.getServices(orgId),
        ServicesService.getArrangements(orgId),
        ServicesService.getStats(orgId)
      ]);
      
      setFamilies(familiesData);
      setServices(servicesData);
      setArrangements(arrangementsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading services data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données des services',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, toast]);

  // Service Families
  const saveFamily = useCallback(async (family: Partial<ServiceFamily>) => {
    try {
      setSaving(true);
      const savedFamily = await ServicesService.saveFamily(orgId, family);
      
      if (family.id) {
        setFamilies(prev => prev.map(f => f.id === family.id ? savedFamily : f));
      } else {
        setFamilies(prev => [...prev, savedFamily]);
      }

      toast({
        title: 'Succès',
        description: 'Famille de services sauvegardée'
      });
      
      return savedFamily;
    } catch (error) {
      console.error('Error saving family:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la famille',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [orgId, toast]);

  const deleteFamily = useCallback(async (id: string) => {
    try {
      await ServicesService.deleteFamily(id);
      setFamilies(prev => prev.filter(f => f.id !== id));
      toast({
        title: 'Succès',
        description: 'Famille de services supprimée'
      });
    } catch (error) {
      console.error('Error deleting family:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer cette famille',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Services
  const saveService = useCallback(async (service: Partial<Service>) => {
    try {
      setSaving(true);
      const savedService = await ServicesService.saveService(orgId, service);
      
      if (service.id) {
        setServices(prev => prev.map(s => s.id === service.id ? savedService : s));
      } else {
        setServices(prev => [...prev, savedService]);
      }

      toast({
        title: 'Succès',
        description: 'Service sauvegardé'
      });
      
      return savedService;
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le service',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [orgId, toast]);

  const deleteService = useCallback(async (id: string) => {
    try {
      await ServicesService.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      toast({
        title: 'Succès',
        description: 'Service supprimé'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer ce service',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Arrangements
  const saveArrangement = useCallback(async (arrangement: Partial<Arrangement>) => {
    try {
      setSaving(true);
      const savedArrangement = await ServicesService.saveArrangement(orgId, arrangement);
      
      if (arrangement.id) {
        setArrangements(prev => prev.map(a => a.id === arrangement.id ? savedArrangement : a));
      } else {
        setArrangements(prev => [...prev, savedArrangement]);
      }

      toast({
        title: 'Succès',
        description: 'Arrangement sauvegardé'
      });
      
      return savedArrangement;
    } catch (error) {
      console.error('Error saving arrangement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder l\'arrangement',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [orgId, toast]);

  const deleteArrangement = useCallback(async (id: string) => {
    try {
      await ServicesService.deleteArrangement(id);
      setArrangements(prev => prev.filter(a => a.id !== id));
      toast({
        title: 'Succès',
        description: 'Arrangement supprimé'
      });
    } catch (error) {
      console.error('Error deleting arrangement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer cet arrangement',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Export functions
  const exportFamilies = useCallback(() => {
    ServicesService.exportFamiliesToCSV(families);
  }, [families]);

  const exportServices = useCallback(() => {
    ServicesService.exportServicesToCSV(services);
  }, [services]);

  const exportArrangements = useCallback(() => {
    ServicesService.exportArrangementsToCSV(arrangements);
  }, [arrangements]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const statsData = await ServicesService.getStats(orgId);
      setStats(statsData);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }, [orgId]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh stats when data changes
  useEffect(() => {
    if (!loading) {
      refreshStats();
    }
  }, [families, services, arrangements, loading, refreshStats]);

  return {
    // Data
    families,
    services,
    arrangements,
    stats,
    
    // State
    loading,
    saving,
    
    // Actions
    loadData,
    
    // Families
    saveFamily,
    deleteFamily,
    
    // Services
    saveService,
    deleteService,
    
    // Arrangements
    saveArrangement,
    deleteArrangement,
    
    // Export
    exportFamilies,
    exportServices,
    exportArrangements,
    
    // Utils
    refreshStats
  };
}