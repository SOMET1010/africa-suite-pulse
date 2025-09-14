import { useState, useEffect } from 'react';
import { DataProtectionService, DataProtectionStatus } from '@/services/data-protection.service';
import { useToast } from '@/hooks/use-toast';

export interface UseDataProtectionOptions {
  showToasts?: boolean;
  autoCheck?: boolean;
}

export function useDataProtection(options: UseDataProtectionOptions = {}) {
  const { showToasts = true, autoCheck = true } = options;
  const { toast } = useToast();
  const [hotelDate, setHotelDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer la date-hôtel au montage
  useEffect(() => {
    if (autoCheck) {
      loadHotelDate();
    }
  }, [autoCheck]);

  const loadHotelDate = async () => {
    setIsLoading(true);
    try {
      const date = await DataProtectionService.getCurrentHotelDate();
      setHotelDate(date);
    } catch (error) {
      console.error('Erreur chargement date-hôtel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkReservationProtection = async (reservationId: string): Promise<DataProtectionStatus> => {
    const status = await DataProtectionService.canModifyData('reservation', reservationId);
    
    if (status.isProtected && showToasts) {
      toast({
        title: "Modification interdite",
        description: status.reason,
        variant: "destructive",
      });
    }
    
    return status;
  };

  const checkInvoiceProtection = async (invoiceId: string): Promise<DataProtectionStatus> => {
    const status = await DataProtectionService.canModifyData('invoice', invoiceId);
    
    if (status.isProtected && showToasts) {
      toast({
        title: "Modification interdite",
        description: status.reason,
        variant: "destructive",
      });
    }
    
    return status;
  };

  const checkPaymentProtection = async (paymentId: string): Promise<DataProtectionStatus> => {
    const status = await DataProtectionService.canModifyData('payment', paymentId);
    
    if (status.isProtected && showToasts) {
      toast({
        title: "Modification interdite",
        description: status.reason,
        variant: "destructive",
      });
    }
    
    return status;
  };

  const isDateProtected = async (date: Date): Promise<boolean> => {
    const hotelDate = await DataProtectionService.getCurrentHotelDate();
    if (!hotelDate) return false;
    
    return date < hotelDate;
  };

  const refreshHotelDate = () => {
    loadHotelDate();
  };

  return {
    hotelDate,
    isLoading,
    checkReservationProtection,
    checkInvoiceProtection,
    checkPaymentProtection,
    isDateProtected,
    refreshHotelDate,
    loadHotelDate,
  };
}