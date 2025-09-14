export interface RateWindow {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  rate_type: 'percentage' | 'fixed';
  adjustment_value: number;
  min_stay?: number;
  max_stay?: number;
  applicable_days: string[];
  client_types: string[];
  room_types: string[];
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRateWindowData {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  rate_type: 'percentage' | 'fixed';
  adjustment_value: number;
  min_stay?: number;
  max_stay?: number;
  applicable_days: string[];
  client_types: string[];
  room_types: string[];
  is_active: boolean;
  priority: number;
}

export interface RateCalculationContext {
  date: string;
  roomType: string;
  clientType: string;
  nightsCount: number;
  baseTariff: number;
}

export interface RateCalculationResult {
  baseTariff: number;
  adjustments: RateAdjustment[];
  finalRate: number;
  totalDiscount: number;
  totalSurcharge: number;
}

export interface RateAdjustment {
  windowId: string;
  windowName: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
  priority: number;
}