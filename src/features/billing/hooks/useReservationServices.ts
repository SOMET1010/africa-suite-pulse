import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/services/logger.service';

export interface ReservationService {
  id: string;
  reservation_id: string;
  service_id: string;
  arrangement_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  folio_number: number;
  billing_condition: string;
  valid_from: string;
  valid_until: string;
  is_applied: boolean;
  service?: {
    code: string;
    label: string;
    price?: number;
  } | null;
}

export interface CreateReservationServiceInput {
  service_id: string;
  arrangement_id?: string;
  quantity: number;
  unit_price: number;
  folio_number: number;
  billing_condition: string;
  valid_from: string;
  valid_until: string;
}

export function useReservationServices(reservationId: string) {
  const [data, setData] = useState<ReservationService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      const { data: services, error } = await supabase
        .from('reservation_services')
        .select(`
          *,
          service:services(code, label, price)
        `)
        .eq('reservation_id', reservationId)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching reservation services', { error, reservationId });
        toast({
          title: "Erreur",
          description: "Impossible de charger les prestations",
          variant: "destructive",
        });
        return;
      }

      setData((services as any) || []);
    } catch (error) {
      logger.error('Error fetching reservation services (catch)', { error, reservationId });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addService = async (input: CreateReservationServiceInput) => {
    try {
      const totalPrice = input.quantity * input.unit_price;
      
      const { data: newService, error } = await supabase
        .from('reservation_services')
        .insert({
          reservation_id: reservationId,
          ...input,
          total_price: totalPrice
        })
        .select(`
          *,
          service:services(code, label, price)
        `)
        .single();

      if (error) {
        logger.error('Error adding reservation service', { error, reservationId });
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la prestation",
          variant: "destructive",
        });
        return;
      }

      setData(prev => [...prev, newService as any]);
      toast({
        title: "Succès",
        description: "Prestation ajoutée avec succès",
      });
    } catch (error) {
      logger.error('Error adding reservation service (catch)', { error, reservationId });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout",
        variant: "destructive",
      });
    }
  };

  const updateService = async (id: string, updates: Partial<CreateReservationServiceInput>) => {
    try {
      const totalPrice = updates.quantity && updates.unit_price 
        ? updates.quantity * updates.unit_price 
        : undefined;

      const { error } = await supabase
        .from('reservation_services')
        .update({
          ...updates,
          ...(totalPrice !== undefined && { total_price: totalPrice })
        })
        .eq('id', id);

      if (error) {
        logger.error('Error updating reservation service', { error, serviceId: id });
        toast({
          title: "Erreur",
          description: "Impossible de modifier la prestation",
          variant: "destructive",
        });
        return;
      }

      await fetchServices();
      toast({
        title: "Succès",
        description: "Prestation modifiée avec succès",
      });
    } catch (error) {
      logger.error('Error updating reservation service (catch)', { error, serviceId: id });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification",
        variant: "destructive",
      });
    }
  };

  const removeService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservation_services')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error removing reservation service', { error, serviceId: id });
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la prestation",
          variant: "destructive",
        });
        return;
      }

      setData(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Succès",
        description: "Prestation supprimée avec succès",
      });
    } catch (error) {
      logger.error('Error removing reservation service (catch)', { error, serviceId: id });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const applyServices = async (serviceIds: string[]) => {
    try {
      const { error } = await supabase
        .from('reservation_services')
        .update({ is_applied: true })
        .in('id', serviceIds);

      if (error) {
        logger.error('Error applying services', { error, serviceIds });
        toast({
          title: "Erreur",
          description: "Impossible d'appliquer les prestations",
          variant: "destructive",
        });
        return;
      }

      await fetchServices();
      toast({
        title: "Succès",
        description: "Prestations appliquées avec succès",
      });
    } catch (error) {
      logger.error('Error applying services (catch)', { error, serviceIds });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'application",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (reservationId) {
      fetchServices();
    }
  }, [reservationId]);

  return {
    data,
    isLoading,
    addService,
    updateService,
    removeService,
    applyServices,
    refetch: fetchServices
  };
}