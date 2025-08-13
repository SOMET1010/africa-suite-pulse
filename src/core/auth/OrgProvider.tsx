import React, { createContext, useContext } from 'react';

interface OrgContextType {
  orgId: string;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const value = {
    orgId: 'default-org-id', // Placeholder for now
  };

  return (
    <OrgContext.Provider value={value}>
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