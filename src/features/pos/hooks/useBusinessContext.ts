import { useState, useEffect, createContext, useContext } from 'react';

type BusinessType = 'restaurant' | 'fast_food' | 'bar' | 'boutique' | 'collectivites';

interface BusinessContextType {
  businessType: BusinessType | null;
  setBusinessType: (type: BusinessType) => void;
  isCollectivites: boolean;
  getBusinessConfig: () => BusinessConfig;
}

interface BusinessConfig {
  name: string;
  icon: string;
  color: string;
  layout: 'standard' | 'fast_service' | 'bar_mode' | 'retail' | 'collectivites';
  features: string[];
  shortcuts: Record<string, string>;
}

const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
  restaurant: {
    name: 'Restaurant',
    icon: '🍽️',
    color: 'orange',
    layout: 'standard',
    features: ['table_service', 'kitchen_orders', 'wine_pairing'],
    shortcuts: { 'F9': 'kitchen', 'F10': 'payment', 'F3': 'tables' }
  },
  fast_food: {
    name: 'Fast-Food',
    icon: '🍔',
    color: 'yellow',
    layout: 'fast_service',
    features: ['quick_order', 'combo_meals', 'pickup_counter'],
    shortcuts: { 'F5': 'quick_menu', 'F6': 'combos', 'F10': 'payment' }
  },
  bar: {
    name: 'Bar',
    icon: '🍹',
    color: 'blue',
    layout: 'bar_mode',
    features: ['mixology', 'happy_hour', 'tab_management'],
    shortcuts: { 'F7': 'mixology', 'F8': 'happy_hour', 'F10': 'payment' }
  },
  boutique: {
    name: 'Boutique',
    icon: '🛍️',
    color: 'pink',
    layout: 'retail',
    features: ['inventory_tracking', 'barcode_scanner', 'customer_accounts'],
    shortcuts: { 'F4': 'scanner', 'F5': 'inventory', 'F6': 'labels' }
  },
  collectivites: {
    name: 'Collectivités',
    icon: '🏫',
    color: 'green',
    layout: 'collectivites',
    features: ['badge_scanner', 'subsidy_calculation', 'meal_planning', 'group_management'],
    shortcuts: { 'F1': 'badge_scan', 'F2': 'beneficiaries', 'F3': 'subsidies', 'F10': 'payment' }
  }
};

export const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
}

export function useBusinessContextProvider() {
  const [businessType, setBusinessTypeState] = useState<BusinessType | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('pos_business_type') as BusinessType;
    if (saved && BUSINESS_CONFIGS[saved]) {
      setBusinessTypeState(saved);
    }
  }, []);

  const setBusinessType = (type: BusinessType) => {
    setBusinessTypeState(type);
    sessionStorage.setItem('pos_business_type', type);
  };

  const isCollectivites = businessType === 'collectivites';

  const getBusinessConfig = (): BusinessConfig => {
    return businessType ? BUSINESS_CONFIGS[businessType] : BUSINESS_CONFIGS.restaurant;
  };

  return {
    businessType,
    setBusinessType,
    isCollectivites,
    getBusinessConfig
  };
}