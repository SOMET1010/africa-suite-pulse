import React, { ReactNode } from 'react';
import { BusinessContext, useBusinessContextProvider } from '../hooks/useBusinessContext';

interface BusinessProviderProps {
  children: ReactNode;
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  const contextValue = useBusinessContextProvider();

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
}