import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CollectivitesStats, CollectivitesFilters } from '../types/stats';

export function useCollectivitesStats(filters: CollectivitesFilters) {
  return useQuery({
    queryKey: ['collectivites-stats', filters],
    queryFn: async (): Promise<CollectivitesStats> => {
      // For now, return mock data
      // In production, this would fetch real data from Supabase
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      return {
        totalMeals: 1456,
        mealsGrowth: 12.5,
        mealsByCategory: {
          students: 1020,
          employees: 356,
          visitors: 80
        },
        
        activeBeneficiaries: 2340,
        beneficiariesGrowth: 8.2,
        totalRegisteredBeneficiaries: 2580,
        
        totalSubsidies: 4368000, // in FCFA
        subsidiesGrowth: 15.3,
        userContributions: 1456000,
        contributionsGrowth: 6.8,
        
        averageCostPerMeal: 4000,
        costGrowth: -2.1, // Negative means cost reduction
        attendanceRate: 85.2,
        attendanceGrowth: 3.4,
        
        budgetUsed: 12500000,
        budgetTotal: 17000000,
        budgetPercentage: 73.5,
        
        mealsByHour: [
          { hour: '07:00', count: 45 },
          { hour: '08:00', count: 120 },
          { hour: '09:00', count: 80 },
          { hour: '10:00', count: 30 },
          { hour: '11:00', count: 180 },
          { hour: '12:00', count: 450 },
          { hour: '13:00', count: 380 },
          { hour: '14:00', count: 120 },
          { hour: '15:00', count: 60 },
          { hour: '16:00', count: 90 },
          { hour: '17:00', count: 150 },
          { hour: '18:00', count: 200 }
        ],
        
        subsidiesByOrganization: [
          {
            organizationId: 'org1',
            organizationName: 'École Primaire A',
            amount: 2850000,
            percentage: 65.2
          },
          {
            organizationId: 'org2',
            organizationName: 'Entreprise Tech B',
            amount: 1100000,
            percentage: 25.2
          },
          {
            organizationId: 'org3',
            organizationName: 'Collège C',
            amount: 418000,
            percentage: 9.6
          }
        ],
        
        weeklyTrend: [
          { date: '2024-01-08', meals: 1250, subsidies: 5500000, attendance: 83.2 },
          { date: '2024-01-09', meals: 1180, subsidies: 5200000, attendance: 81.5 },
          { date: '2024-01-10', meals: 1350, subsidies: 5950000, attendance: 87.1 },
          { date: '2024-01-11', meals: 1420, subsidies: 6250000, attendance: 89.3 },
          { date: '2024-01-12', meals: 1290, subsidies: 5680000, attendance: 85.7 },
          { date: '2024-01-13', meals: 680, subsidies: 3000000, attendance: 78.4 },
          { date: '2024-01-14', meals: 520, subsidies: 2290000, attendance: 72.1 }
        ]
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
}