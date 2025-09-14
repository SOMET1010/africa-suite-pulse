import React, { createContext, useContext } from 'react';
import { usePOSAuthSecure, POSSecureSession, POSRole } from './usePOSAuthSecure';

interface POSAuthContextType {
  session: POSSecureSession | null;
  loading: boolean;
  error: string | null;
  authenticate: (employeeCode: string, pin: string, orgId: string) => Promise<{ success: boolean; error?: string; lockedUntil?: Date }>;
  logout: () => Promise<void>;
  updateOutlet: (outletId: string) => Promise<void>;
  hasRole: (requiredRole: POSRole) => boolean;
  isHostess: boolean;
  isServer: boolean;
  isCashier: boolean;
  isManager: boolean;
  isAuthenticated: boolean;
}

const POSAuthContext = createContext<POSAuthContextType | undefined>(undefined);

export function POSAuthProvider({ children }: { children: React.ReactNode }) {
  const posAuth = usePOSAuthSecure();

  return (
    <POSAuthContext.Provider value={posAuth}>
      {children}
    </POSAuthContext.Provider>
  );
}

export function usePOSAuthContext() {
  const context = useContext(POSAuthContext);
  if (context === undefined) {
    throw new Error('usePOSAuthContext must be used within a POSAuthProvider');
  }
  return context;
}

// Export des types pour compatibilité
export type { POSSecureSession as POSSession, POSRole };