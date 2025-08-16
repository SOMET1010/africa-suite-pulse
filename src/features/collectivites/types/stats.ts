export interface CollectivitesStats {
  // Meal statistics
  totalMeals: number;
  mealsGrowth: number; // Percentage change
  mealsByCategory: {
    students: number;
    employees: number;
    visitors: number;
  };
  
  // Beneficiaries
  activeBeneficiaries: number;
  beneficiariesGrowth: number;
  totalRegisteredBeneficiaries: number;
  
  // Financial data
  totalSubsidies: number;
  subsidiesGrowth: number;
  userContributions: number;
  contributionsGrowth: number;
  
  // Performance metrics
  averageCostPerMeal: number;
  costGrowth: number;
  attendanceRate: number;
  attendanceGrowth: number;
  
  // Budget tracking
  budgetUsed: number;
  budgetTotal: number;
  budgetPercentage: number;
  
  // Time-based data
  mealsByHour: Array<{
    hour: string;
    count: number;
  }>;
  
  subsidiesByOrganization: Array<{
    organizationId: string;
    organizationName: string;
    amount: number;
    percentage: number;
  }>;
  
  weeklyTrend: Array<{
    date: string;
    meals: number;
    subsidies: number;
    attendance: number;
  }>;
}

export interface CollectivitesFilters {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  organizationId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  beneficiaryCategory?: string[];
  businessType?: string[];
}