import React, { createContext, useContext } from 'react';
import { usePOSAuth, POSSession, POSRole } from './usePOSAuth';

interface POSAuthContextType {
  session: POSSession | null;
  loading: boolean;
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
  const posAuth = usePOSAuth();

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