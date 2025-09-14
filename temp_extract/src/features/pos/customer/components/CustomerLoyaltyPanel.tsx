import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Star, 
  Gift, 
  History, 
  Plus, 
  Crown,
  TrendingUp,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { useCustomerLoyalty } from '../hooks/useCustomerLoyalty';

interface CustomerLoyaltyPanelProps {
  onCustomerSelect?: (customer: any) => void;
  onRewardApply?: (reward: any) => void;
}

export function CustomerLoyaltyPanel({ onCustomerSelect, onRewardApply }: CustomerLoyaltyPanelProps) {
  const {
    customers,
    isLoading,
    selectedCustomer,
    setSelectedCustomer,
    activities,
    stats,
    awardPoints,
    redeemPoints,
    refresh
  } = useCustomerLoyalty();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  // Mock helper functions
  const searchCustomers = (query: string) => {
    return customers.filter(customer => 
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase()) ||
      (customer.phone && customer.phone.includes(query))
    );
  };

  const getTierBenefits = (tier: string) => {
    const tiers = {
      bronze: {
        name: 'Bronze',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        benefits: ['5% de réduction', 'Points sur achats', 'Offres spéciales']
      },
      silver: {
        name: 'Argent',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        benefits: ['10% de réduction', 'Livraison gratuite', 'Support prioritaire']
      },
      gold: {
        name: 'Or',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        benefits: ['15% de réduction', 'Accès VIP', 'Cadeaux exclusifs']
      },
      platinum: {
        name: 'Platine',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        benefits: ['20% de réduction', 'Service personnalisé', 'Événements privés']
      }
    };
    return tiers[tier as keyof typeof tiers] || tiers.bronze;
  };

  const rewards = [
    {
      id: '1',
      name: 'Boisson Gratuite',
      description: 'Une boisson de votre choix offerte',
      pointsCost: 100,
      isActive: true,
      restrictions: ['Valable 30 jours']
    },
    {
      id: '2',
      name: 'Dessert Gratuit',
      description: 'Un dessert au choix avec votre commande',
      pointsCost: 150,
      isActive: true,
      restrictions: ['Minimum 2 plats']
    },
    {
      id: '3',
      name: 'Réduction 20%',
      description: 'Réduction de 20% sur votre prochaine commande',
      pointsCost: 250,
      isActive: true,
      restrictions: ['Maximum 50.000 FCFA']
    }
  ];

  const transactions = activities.map(activity => ({
    ...activity,
    transactionType: activity.type === 'points_earned' ? 'Gain' : 'Utilisation',
    createdAt: activity.date
  }));

  const filteredCustomers = searchQuery ? searchCustomers(searchQuery) : customers.slice(0, 20);

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    onCustomerSelect?.(customer);
  };

  const handleRewardRedeem = async (reward: any) => {
    if (!selectedCustomer) return;
    
    try {
      await redeemPoints(selectedCustomer.id, reward.pointsCost, `Reward: ${reward.name}`);
      onRewardApply?.(reward);
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Programme de Fidélité
          </CardTitle>
          <CardDescription>
            Gérez les points et récompenses de vos clients fidèles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau Client Fidèle</DialogTitle>
                </DialogHeader>
                {/* New customer form would go here */}
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle>Clients ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredCustomers.map((customer) => {
                  const tierInfo = getTierBenefits(customer.loyaltyStatus);
                  
                  return (
                    <div
                      key={customer.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedCustomer?.id === customer.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <Badge 
                              variant="secondary" 
                              className={`${tierInfo.color} ${tierInfo.bgColor}`}
                            >
                              {tierInfo.name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {customer.totalPoints} pts
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {customer.totalSpent.toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCustomer ? 'Détails Client' : 'Sélectionnez un Client'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="rewards">Récompenses</TabsTrigger>
                  <TabsTrigger value="history">Historique</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>
                        <div className="text-lg font-medium">
                          {`${selectedCustomer.firstName} ${selectedCustomer.lastName}`.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        {getTierBenefits(selectedCustomer.loyaltyStatus).name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {selectedCustomer.totalPoints}
                      </div>
                      <div className="text-sm text-muted-foreground">Points</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCustomer.visitCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Visites</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Membre depuis {new Date(selectedCustomer.memberSince).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Avantages {getTierBenefits(selectedCustomer.loyaltyStatus).name}</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {getTierBenefits(selectedCustomer.loyaltyStatus).benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="rewards" className="space-y-4">
                  <div className="space-y-3">
                    {rewards.filter(reward => reward.isActive).map((reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{reward.name}</h4>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{reward.pointsCost} points</Badge>
                            {reward.restrictions && (
                              <span className="text-xs text-muted-foreground">
                                *{reward.restrictions.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={selectedCustomer.totalPoints >= reward.pointsCost ? "default" : "outline"}
                          disabled={selectedCustomer.totalPoints < reward.pointsCost}
                          onClick={() => handleRewardRedeem(reward)}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Échanger
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.transactionType}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un client pour voir ses détails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}