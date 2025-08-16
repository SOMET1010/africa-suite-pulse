import React, { useState, useEffect } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { DataProtectionIndicator } from './data-protection-indicator';
import { useDataProtection } from '@/hooks/useDataProtection';
import { DataProtectionStatus } from '@/services/data-protection.service';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

export interface ProtectedActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: () => void | Promise<void>;
  reservationId?: string;
  invoiceId?: string;
  paymentId?: string;
  checkDate?: Date;
  showIndicator?: boolean;
  indicatorPosition?: 'left' | 'right';
  onProtectionCheck?: (status: DataProtectionStatus) => void;
}

export function ProtectedActionButton({
  children,
  onClick,
  reservationId,
  invoiceId,
  paymentId,
  checkDate,
  showIndicator = true,
  indicatorPosition = 'right',
  onProtectionCheck,
  disabled,
  className,
  ...props
}: ProtectedActionButtonProps) {
  const [protectionStatus, setProtectionStatus] = useState<DataProtectionStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { 
    checkReservationProtection, 
    checkInvoiceProtection, 
    checkPaymentProtection,
    isDateProtected 
  } = useDataProtection({ showToasts: false });

  // Vérifier la protection au montage
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
      onProtectionCheck?.(status);
    } catch (error) {
      logger.security('Erreur vérification protection', error);
      setProtectionStatus({
        isProtected: true,
        reason: 'Erreur de vérification'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClick = async () => {
    if (protectionStatus?.isProtected) {
      // Ne pas exécuter l'action si protégé
      return;
    }

    if (onClick) {
      await onClick();
    }
  };

  const isDisabled = disabled || protectionStatus?.isProtected || isChecking;

  const indicator = showIndicator && protectionStatus && (
    <DataProtectionIndicator
      isProtected={protectionStatus.isProtected}
      reason={protectionStatus.reason}
      hotelDate={protectionStatus.hotelDate}
      recordDate={protectionStatus.recordDate}
      variant="icon"
      size="sm"
    />
  );

  return (
    <Button
      {...props}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2',
        protectionStatus?.isProtected && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {showIndicator && indicatorPosition === 'left' && indicator}
      {children}
      {showIndicator && indicatorPosition === 'right' && indicator}
    </Button>
  );
}