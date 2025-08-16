import React, { createContext, useContext } from 'react';
import { useOrgId as useOrgIdHook } from './useOrg';

interface OrgContextType {
  orgId: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const orgData = useOrgIdHook();

  return (
    <OrgContext.Provider value={orgData}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrgId() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrgId must be used within an OrgProvider');
  }
  return context;
}