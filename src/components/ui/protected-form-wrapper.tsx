import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataProtectionIndicator } from './data-protection-indicator';
import { useDataProtection } from '@/hooks/useDataProtection';
import { DataProtectionStatus } from '@/services/data-protection.service';
import { cn } from '@/lib/utils';

interface ProtectedFormWrapperProps {
  children: React.ReactNode;
  reservationId?: string;
  invoiceId?: string;
  paymentId?: string;
  checkDate?: Date;
  disabled?: boolean;
  className?: string;
  onProtectionStatusChange?: (status: DataProtectionStatus) => void;
}

export function ProtectedFormWrapper({
  children,
  reservationId,
  invoiceId,
  paymentId,
  checkDate,
  disabled = false,
  className,
  onProtectionStatusChange
}: ProtectedFormWrapperProps) {
  const [protectionStatus, setProtectionStatus] = useState<DataProtectionStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const { 
    checkReservationProtection, 
    checkInvoiceProtection, 
    checkPaymentProtection,
    isDateProtected 
  } = useDataProtection({ showToasts: false });

  useEffect(() => {
    checkProtection();
  }, [reservationId, invoiceId, paymentId, checkDate]);

  const checkProtection = async () => {
    setIsChecking(true);
    try {
      let status: DataProtectionStatus;

      if (reservationId) {
        status = await checkReservationProtection(reservationId);
      } else if (invoiceId) {
        status = await checkInvoiceProtection(invoiceId);
      } else if (paymentId) {
        status = await checkPaymentProtection(paymentId);
      } else if (checkDate) {
        const isProtected = await isDateProtected(checkDate);
        status = {
          isProtected,
          reason: isProtected ? 'Date antérieure à la date-hôtel' : undefined,
          recordDate: checkDate
        };
      } else {
        status = { isProtected: false };
      }

      setProtectionStatus(status);
      onProtectionStatusChange?.(status);
    } catch (error) {
      console.error('Erreur vérification protection:', error);
      const errorStatus = {
        isProtected: true,
        reason: 'Erreur de vérification'
      };
      setProtectionStatus(errorStatus);
      onProtectionStatusChange?.(errorStatus);
    } finally {
      setIsChecking(false);
    }
  };

  const renderProtectionAlert = () => {
    if (!protectionStatus || isChecking) return null;

    if (protectionStatus.isProtected) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Modification interdite
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>{protectionStatus.reason}</p>
            {protectionStatus.hotelDate && protectionStatus.recordDate && (
              <div className="text-sm space-y-1">
                <p>• Date-hôtel: {protectionStatus.hotelDate.toLocaleDateString()}</p>
                <p>• Date de l'enregistrement: {protectionStatus.recordDate.toLocaleDateString()}</p>
              </div>
            )}
            <p className="text-sm font-medium">
              Pour effectuer des modifications, veuillez utiliser une contre-passation comptable.
            </p>
          </AlertDescription>
        </Alert>
      );
    }

    if (protectionStatus.hotelDate) {
      return (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            <DataProtectionIndicator
              isProtected={false}
              variant="icon"
              size="sm"
            />
            Modification autorisée
          </AlertTitle>
          <AlertDescription>
            Date-hôtel: {protectionStatus.hotelDate.toLocaleDateString()}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  const isFormDisabled = disabled || protectionStatus?.isProtected || isChecking;

  return (
    <div className={cn('space-y-4', className)}>
      {renderProtectionAlert()}
      
      <div className={cn(
        'transition-all duration-200',
        isFormDisabled && 'opacity-50 pointer-events-none'
      )}>
        {children}
      </div>
    </div>
  );
}