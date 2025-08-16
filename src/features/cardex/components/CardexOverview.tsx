import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataCard } from "@/core/ui/DataCard";
import { 
  User, 
  Calendar, 
  MapPin, 
  Euro, 
  CreditCard,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { cardexApi } from "@/services/cardex.api";
import { useCurrency } from "@/hooks/useCurrency";

interface CardexOverviewProps {
  reservationId: string;
}

export function CardexOverview({ reservationId }: CardexOverviewProps) {
  const { formatCurrency } = useCurrency();
  const { data: cardex, isLoading, error } = useQuery({
    queryKey: ['cardex-overview', reservationId],
    queryFn: () => cardexApi.getCardexOverview(reservationId),
    enabled: !!reservationId
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card shadow-luxury animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-charcoal/10 rounded mb-2"></div>
              <div className="h-6 bg-charcoal/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !cardex) {
    return (
      <Card className="glass-card shadow-luxury border-error/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-error" />
          <p className="text-error font-medium">Erreur lors du chargement du cardex</p>
          <p className="text-sm text-charcoal/70 mt-2">
            {error?.message || "Une erreur est survenue"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-error";
    if (balance < 0) return "text-success";
    return "text-charcoal";
  };

  const getBalanceStatus = (balance: number) => {
    if (balance > 0) return "Solde débiteur";
    if (balance < 0) return "Crédit client";
    return "Équilibré";
  };

  return (
    <div className="space-y-6">
      {/* Informations client et séjour */}
      <Card className="glass-card shadow-luxury">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {cardex.guest_name}
            </CardTitle>
            <Badge variant={cardex.total_balance > 0 ? "destructive" : cardex.total_balance < 0 ? "default" : "secondary"}>
              {getBalanceStatus(cardex.total_balance)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-charcoal/50" />
              <span>Chambre: {cardex.room_number || 'Non assignée'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-charcoal/50" />
              <span>Arrivée: {new Date(cardex.check_in).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-charcoal/50" />
              <span>Départ: {new Date(cardex.check_out).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DataCard
          title="Total débité"
          value={formatCurrency(cardex.total_debit)}
          icon={TrendingUp}
          variant="primary"
          subtitle={`${cardex.lines.filter(l => l.debit > 0).length} opérations`}
        />
        
        <DataCard
          title="Total crédité"
          value={formatCurrency(cardex.total_credit)}
          icon={CreditCard}
          variant="success"
          subtitle={`${cardex.lines.filter(l => l.credit > 0).length} paiements`}
        />
        
        <DataCard
          title="Solde actuel"
          value={formatCurrency(Math.abs(cardex.total_balance))}
          icon={Euro}
          variant={cardex.total_balance > 0 ? "warning" : cardex.total_balance < 0 ? "success" : "default"}
          subtitle={getBalanceStatus(cardex.total_balance)}
        />
        
        <DataCard
          title="Dernière activité"
          value={cardex.payment_summary.last_payment ? 
            new Date(cardex.payment_summary.last_payment).toLocaleDateString('fr-FR') :
            "Aucune"
          }
          icon={Clock}
          variant="default"
          subtitle={`${formatCurrency(cardex.payment_summary.pending_amount)} restant`}
        />
      </div>

      {/* Résumé des folios */}
      <Card className="glass-card shadow-luxury">
        <CardHeader>
          <CardTitle className="text-lg font-luxury">Résumé des folios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardex.folios.map(folio => (
              <div
                key={folio.folio_number}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  folio.balance !== 0 ? 'bg-brand-accent/5 border-brand-accent/20' : 'bg-charcoal/5 border-charcoal/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Folio {folio.folio_number}</span>
                  <Badge variant={folio.balance !== 0 ? "default" : "secondary"} className="text-xs">
                    {folio.item_count}
                  </Badge>
                </div>
                <p className="text-xs text-charcoal/70 mb-2">{folio.label}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Débit:</span>
                    <span className="font-medium">{formatCurrency(folio.total_debit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crédit:</span>
                    <span className="font-medium">{formatCurrency(folio.total_credit)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Solde:</span>
                    <span className={`font-bold ${getBalanceColor(folio.balance)}`}>
                      {formatCurrency(Math.abs(folio.balance))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}