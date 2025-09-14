export interface LoyaltyCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalPoints: number;
  tier: string;
  joinDate: string;
  lastActivity: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  orderId?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  earnRate: number; // points per currency unit
  tiers: LoyaltyTier[];
  isActive: boolean;
}

export interface LoyaltyStats {
  totalCustomers: number;
  activeCustomers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  averagePointsPerCustomer: number;
  monthlyGrowth: number;
}