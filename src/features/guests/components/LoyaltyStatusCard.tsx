import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Crown, Gift, Star } from 'lucide-react';
import { loyaltyApi } from '@/services/loyalty.api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LoyaltyStatusCardProps {
  guestId: string;
}

export function LoyaltyStatusCard({ guestId }: LoyaltyStatusCardProps) {
  const { data: loyaltyStatus } = useQuery({
    queryKey: ['customer-loyalty', guestId],
    queryFn: () => loyaltyApi.getCustomerLoyalty(guestId),
  });

  const { data: transactions } = useQuery({
    queryKey: ['loyalty-transactions', guestId],
    queryFn: () => loyaltyApi.getLoyaltyTransactions(guestId),
    enabled: !!loyaltyStatus,
  });

  if (!loyaltyStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Programme de Fidélité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Client non inscrit au programme de fidélité
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTierIcon = (tierCode?: string) => {
    switch (tierCode) {
      case 'platinum':
        return <Crown className="h-4 w-4" style={{ color: '#e5e4e2' }} />;
      case 'gold':
        return <Crown className="h-4 w-4" style={{ color: '#ffd700' }} />;
      case 'silver':
        return <Star className="h-4 w-4" style={{ color: '#c0c0c0' }} />;
      default:
        return <Gift className="h-4 w-4" style={{ color: '#cd7f32' }} />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'earned': return 'Gagné';
      case 'redeemed': return 'Utilisé';
      case 'bonus': return 'Bonus';
      case 'adjustment': return 'Ajustement';
      case 'expired': return 'Expiré';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'earned': return 'bg-green-500/10 text-green-600';
      case 'redeemed': return 'bg-red-500/10 text-red-600';
      case 'bonus': return 'bg-blue-500/10 text-blue-600';
      case 'adjustment': return 'bg-yellow-500/10 text-yellow-600';
      case 'expired': return 'bg-gray-500/10 text-gray-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Programme de Fidélité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getTierIcon(loyaltyStatus.tier?.code)}
              <Badge 
                style={{ 
                  backgroundColor: loyaltyStatus.tier?.color || '#6b7280',
                  color: 'white'
                }}
                className="font-medium"
              >
                {loyaltyStatus.tier?.name || 'Bronze'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {loyaltyStatus.program?.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {loyaltyStatus.total_points.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">points</p>
          </div>
        </div>

        {/* Tier Benefits */}
        {loyaltyStatus.tier?.benefits && loyaltyStatus.tier.benefits.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Avantages</h4>
              <ul className="space-y-1">
                {loyaltyStatus.tier.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Recent Transactions */}
        {transactions && transactions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Historique récent</h4>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getTransactionTypeColor(transaction.transaction_type)}`}
                        >
                          {getTransactionTypeLabel(transaction.transaction_type)}
                        </Badge>
                        <span className="text-muted-foreground">
                          {format(new Date(transaction.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      <span className={`font-medium ${
                        transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {transactions.length > 5 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{transactions.length - 5} transactions supplémentaires
                </p>
              )}
            </div>
          </>
        )}

        {loyaltyStatus.last_activity_at && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Dernière activité: {format(new Date(loyaltyStatus.last_activity_at), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}