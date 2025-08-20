import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loyaltyApi } from '@/services/loyalty.api';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalPoints: number;
  tierName?: string;
  memberSince: string;
  lastVisit?: string;
  totalSpent: number;
  visitCount: number;
  averageSpend: number;
  preferredItems: string[];
  birthdayMonth?: number;
  loyaltyStatus: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface LoyaltyTransaction {
  id: string;
  customerId: string;
  points: number;
  transactionType: 'earned' | 'redeemed' | 'expired' | 'bonus';
  description: string;
  orderId?: string;
  createdAt: string;
  expiresAt?: string;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'freeItem' | 'upgrade' | 'experience';
  value: number;
  isActive: boolean;
  restrictions?: string[];
}

export function useCustomerLoyalty() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch all customers with loyalty data
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ['pos-loyalty-customers'],
    queryFn: async () => {
      const { data: guests, error } = await supabase
        .from('guests')
        .select(`
          *,
          customer_loyalty_points(*),
          reservations(rate_total)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return guests?.map(guest => {
        const loyaltyData = guest.customer_loyalty_points?.[0];
        const reservations = guest.reservations || [];
        const totalSpent = reservations.reduce((sum: number, res: any) => sum + (res.rate_total || 0), 0);
        const visitCount = reservations.length;
        const averageSpend = visitCount > 0 ? totalSpent / visitCount : 0;

        // Determine loyalty status based on total spent
        let loyaltyStatus: Customer['loyaltyStatus'] = 'bronze';
        if (totalSpent >= 500000) loyaltyStatus = 'platinum';
        else if (totalSpent >= 200000) loyaltyStatus = 'gold';
        else if (totalSpent >= 50000) loyaltyStatus = 'silver';

        return {
          id: guest.id,
          firstName: guest.first_name || '',
          lastName: guest.last_name || '',
          email: guest.email || '',
          phone: guest.phone || '',
          totalPoints: loyaltyData?.total_points || 0,
          tierName: loyaltyStatus,
          memberSince: guest.created_at,
          totalSpent,
          visitCount,
          averageSpend,
          preferredItems: [], // Would need order history analysis
          birthdayMonth: guest.date_of_birth ? new Date(guest.date_of_birth).getMonth() + 1 : undefined,
          loyaltyStatus
        };
      }) || [];
    },
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch loyalty transactions for a customer
  const { data: transactions = [] } = useQuery<LoyaltyTransaction[]>({
    queryKey: ['loyalty-transactions', selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      
      const data = await loyaltyApi.getLoyaltyTransactions(selectedCustomer.id);
      return data.map(transaction => ({
        id: transaction.id,
        customerId: transaction.guest_id,
        points: transaction.points,
        transactionType: transaction.transaction_type as any,
        description: transaction.description || '',
        orderId: transaction.reference,
        createdAt: transaction.created_at,
        expiresAt: transaction.expires_at
      }));
    },
    enabled: !!selectedCustomer?.id,
  });

  // Available loyalty rewards
  const { data: rewards = [] } = useQuery<LoyaltyReward[]>({
    queryKey: ['loyalty-rewards'],
    queryFn: async () => {
      // Mock data - would come from database
      return [
        {
          id: '1',
          name: 'Réduction 10%',
          description: 'Remise de 10% sur votre prochaine commande',
          pointsCost: 100,
          category: 'discount',
          value: 10,
          isActive: true,
          restrictions: ['Minimum 5000 FCFA']
        },
        {
          id: '2',
          name: 'Boisson Offerte',
          description: 'Une boisson gratuite de votre choix',
          pointsCost: 50,
          category: 'freeItem',
          value: 1500,
          isActive: true
        },
        {
          id: '3',
          name: 'Dessert Gratuit',
          description: 'Un dessert offert parmi la sélection',
          pointsCost: 75,
          category: 'freeItem',
          value: 2500,
          isActive: true
        },
        {
          id: '4',
          name: 'Surclassement VIP',
          description: 'Service prioritaire et table VIP',
          pointsCost: 200,
          category: 'upgrade',
          value: 0,
          isActive: true,
          restrictions: ['Réservation obligatoire']
        }
      ];
    },
  });

  // Add points to customer
  const addPointsMutation = useMutation({
    mutationFn: async ({ customerId, points, orderId, description }: {
      customerId: string;
      points: number;
      orderId?: string;
      description: string;
    }) => {
      const loyaltyProgram = await loyaltyApi.getActiveLoyaltyProgram('current-org');
      if (!loyaltyProgram) throw new Error('No active loyalty program');

      await loyaltyApi.addLoyaltyPoints(
        customerId,
        loyaltyProgram.id,
        points,
        'earned',
        description,
        orderId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-loyalty-customers'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
      toast({
        title: 'Points ajoutés',
        description: 'Les points de fidélité ont été ajoutés avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'ajouter les points: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Redeem reward
  const redeemRewardMutation = useMutation({
    mutationFn: async ({ customerId, rewardId, pointsCost }: {
      customerId: string;
      rewardId: string;
      pointsCost: number;
    }) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer || customer.totalPoints < pointsCost) {
        throw new Error('Points insuffisants');
      }

      const loyaltyProgram = await loyaltyApi.getActiveLoyaltyProgram('current-org');
      if (!loyaltyProgram) throw new Error('No active loyalty program');

      await loyaltyApi.addLoyaltyPoints(
        customerId,
        loyaltyProgram.id,
        -pointsCost,
        'redeemed',
        `Récompense échangée: ${rewardId}`,
        rewardId
      );

      return { customerId, rewardId, pointsCost };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pos-loyalty-customers'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
      toast({
        title: 'Récompense échangée',
        description: 'La récompense a été appliquée avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'échanger la récompense: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create new customer
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dateOfBirth?: string;
    }) => {
      const { data: guest, error } = await supabase
        .from('guests')
        .insert([{
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          date_of_birth: customerData.dateOfBirth,
          guest_type: 'individual',
          org_id: 'current' // Handled by RLS
        }])
        .select()
        .single();

      if (error) throw error;

      // Initialize loyalty points
      const loyaltyProgram = await loyaltyApi.getActiveLoyaltyProgram('current-org');
      if (loyaltyProgram) {
        await loyaltyApi.addLoyaltyPoints(
          guest.id,
          loyaltyProgram.id,
          0, // Start with 0 points
          'earned',
          'Nouveau membre - Bienvenue!'
        );
      }

      return guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-loyalty-customers'] });
      toast({
        title: 'Client créé',
        description: 'Le nouveau client a été ajouté au programme de fidélité.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer le client: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Search customers
  const searchCustomers = (query: string) => {
    const searchTerm = query.toLowerCase();
    return customers.filter(customer => 
      customer.firstName.toLowerCase().includes(searchTerm) ||
      customer.lastName.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm) ||
      customer.phone.includes(query)
    );
  };

  // Get customer by phone/email for quick lookup
  const findCustomer = async (phoneOrEmail: string) => {
    return customers.find(customer => 
      customer.phone === phoneOrEmail || 
      customer.email.toLowerCase() === phoneOrEmail.toLowerCase()
    );
  };

  // Calculate points for purchase amount
  const calculatePointsForPurchase = (amount: number): number => {
    // 1 point per 1000 FCFA spent
    return Math.floor(amount / 1000);
  };

  // Get tier benefits
  const getTierBenefits = (loyaltyStatus: Customer['loyaltyStatus']) => {
    const benefits = {
      bronze: {
        name: 'Bronze',
        multiplier: 1,
        benefits: ['Points standards', 'Offres spéciales'],
        color: 'text-amber-600',
        bgColor: 'bg-amber-100'
      },
      silver: {
        name: 'Argent',
        multiplier: 1.2,
        benefits: ['20% de points bonus', 'Réductions exclusives', 'Service prioritaire'],
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      },
      gold: {
        name: 'Or',
        multiplier: 1.5,
        benefits: ['50% de points bonus', 'Réductions VIP', 'Invitations événements'],
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      },
      platinum: {
        name: 'Platine',
        multiplier: 2,
        benefits: ['Points doublés', 'Service VIP', 'Accès exclusif', 'Cadeaux personnalisés'],
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      }
    };
    return benefits[loyaltyStatus];
  };

  return {
    customers,
    isLoadingCustomers,
    selectedCustomer,
    setSelectedCustomer,
    transactions,
    rewards,
    addPoints: addPointsMutation.mutate,
    isAddingPoints: addPointsMutation.isPending,
    redeemReward: redeemRewardMutation.mutate,
    isRedeemingReward: redeemRewardMutation.isPending,
    createCustomer: createCustomerMutation.mutate,
    isCreatingCustomer: createCustomerMutation.isPending,
    searchCustomers,
    findCustomer,
    calculatePointsForPurchase,
    getTierBenefits,
  };
}