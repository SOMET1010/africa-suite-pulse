import React, { createContext, useContext } from 'react';

interface OrgContextType {
  orgId: string;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const value = {
    orgId: '7e389008-3dd1-4f54-816d-4f1daff1f435', // Utiliser l'org_id fixe pour éviter les conflits
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