import React, { createContext, useContext, useCallback } from 'react';
import { DataProtectionService, DataProtectionStatus } from '@/services/data-protection.service';
import { useToast } from '@/hooks/use-toast';

interface DataProtectionContextType {
  checkAndExecute: (
    action: () => Promise<void> | void,
    protectionParams: {
      type: 'reservation' | 'invoice' | 'payment';
      id: string;
    } | {
      type: 'date';
      date: Date;
    }
  ) => Promise<void>;
  validateAccess: (
    type: 'reservation' | 'invoice' | 'payment',
    id: string
  ) => Promise<DataProtectionStatus>;
}

const DataProtectionContext = createContext<DataProtectionContextType | null>(null);

export function useDataProtectionMiddleware() {
  const context = useContext(DataProtectionContext);
  if (!context) {
    throw new Error('useDataProtectionMiddleware must be used within DataProtectionProvider');
  }
  return context;
}

interface DataProtectionProviderProps {
  children: React.ReactNode;
}

export function DataProtectionProvider({ children }: DataProtectionProviderProps) {
  const { toast } = useToast();

  const validateAccess = useCallback(async (
    type: 'reservation' | 'invoice' | 'payment',
    id: string
  ): Promise<DataProtectionStatus> => {
    return await DataProtectionService.canModifyData(type, id);
  }, []);

  const checkAndExecute = useCallback(async (
    action: () => Promise<void> | void,
    protectionParams: {
      type: 'reservation' | 'invoice' | 'payment';
      id: string;
    } | {
      type: 'date';
      date: Date;
    }
  ) => {
    try {
      let status: DataProtectionStatus;

      if (protectionParams.type === 'date') {
        const hotelDate = await DataProtectionService.getCurrentHotelDate();
        const isProtected = hotelDate ? protectionParams.date < hotelDate : false;
        status = {
          isProtected,
          reason: isProtected ? 'Date antérieure à la date-hôtel' : undefined,
          hotelDate: hotelDate || undefined,
          recordDate: protectionParams.date
        };
      } else {
        status = await DataProtectionService.canModifyData(protectionParams.type, protectionParams.id);
      }

      if (status.isProtected) {
        toast({
          title: "Action interdite",
          description: status.reason || "Cette action est protégée par la date-hôtel",
          variant: "destructive",
        });
        return;
      }

      // Exécuter l'action si autorisée
      await action();
      
    } catch (error) {
      console.error('Erreur lors de la vérification de protection:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les permissions",
        variant: "destructive",
      });
    }
  }, [toast]);

  const value: DataProtectionContextType = {
    checkAndExecute,
    validateAccess,
  };

  return (
    <DataProtectionContext.Provider value={value}>
      {children}
    </DataProtectionContext.Provider>
  );
}

// HOC pour protéger automatiquement les composants
export function withDataProtection<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  protectionConfig: {
    getProtectionParams: (props: T) => {
      type: 'reservation' | 'invoice' | 'payment';
      id: string;
    } | null;
  }
) {
  return function ProtectedComponent(props: T) {
    const { validateAccess } = useDataProtectionMiddleware();
    const [isProtected, setIsProtected] = React.useState<boolean | null>(null);
    const [protectionStatus, setProtectionStatus] = React.useState<DataProtectionStatus | null>(null);

    React.useEffect(() => {
      const checkProtection = async () => {
        const params = protectionConfig.getProtectionParams(props);
        if (!params) {
          setIsProtected(false);
          return;
        }

        const status = await validateAccess(params.type, params.id);
        setProtectionStatus(status);
        setIsProtected(status.isProtected);
      };

      checkProtection();
    }, [props, validateAccess]);

    if (isProtected === null) {
      // Loading state
      return <div className="animate-pulse bg-muted rounded h-8 w-32" />;
    }

    if (isProtected) {
      // Render disabled/protected state
      return (
        <div className="opacity-50 pointer-events-none relative">
          <WrappedComponent {...props} />
          <div className="absolute inset-0 bg-background/10 rounded" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}