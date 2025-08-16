import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TButton } from "@/core/ui/TButton";
import { 
  Plus, 
  Receipt, 
  Euro,
  Clock,
  User,
  FileText
} from "lucide-react";
import { cardexApi } from "@/services/cardex.api";
import { useCurrency } from "@/hooks/useCurrency";
import { FOLIO_DEFINITIONS } from "@/types/billing";

interface FoliosGridProps {
  reservationId: string;
}

export function FoliosGrid({ reservationId }: FoliosGridProps) {
  const { formatCurrency } = useCurrency();
  const { data: cardex, isLoading } = useQuery({
    queryKey: ['cardex-overview', reservationId],
    queryFn: () => cardexApi.getCardexOverview(reservationId),
    enabled: !!reservationId
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FOLIO_DEFINITIONS.map(folio => (
          <Card key={folio.number} className="glass-card shadow-luxury animate-pulse">
            <CardHeader className="pb-4">
              <div className="h-6 bg-charcoal/10 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-charcoal/10 rounded"></div>
                <div className="h-4 bg-charcoal/10 rounded"></div>
                <div className="h-8 bg-charcoal/10 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!cardex) {
    return (
      <div className="text-center py-8">
        <p className="text-charcoal/50">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cardex.folios.map(folio => {
        const folioLines = cardex.lines.filter(l => l.folio_number === folio.folio_number);
        const hasActivity = folio.item_count > 0;
        
        return (
          <Card 
            key={folio.folio_number} 
            className={`glass-card shadow-luxury transition-all hover:shadow-xl ${
              hasActivity ? 'ring-1 ring-brand-accent/20' : ''
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-luxury flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Folio {folio.folio_number}
                </CardTitle>
                <Badge variant={hasActivity ? "default" : "secondary"}>
                  {folio.item_count}
                </Badge>
              </div>
              <p className="text-sm text-charcoal/70">{folio.label}</p>
              {folio.description && (
                <p className="text-xs text-charcoal/50">{folio.description}</p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Résumé financier */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/70">Total débité:</span>
                  <span className="font-medium">{formatCurrency(folio.total_debit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/70">Total crédité:</span>
                  <span className="font-medium">{formatCurrency(folio.total_credit)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>Solde:</span>
                  <span className={folio.balance > 0 ? 'text-error' : folio.balance < 0 ? 'text-success' : 'text-charcoal'}>
                    {formatCurrency(Math.abs(folio.balance))}
                  </span>
                </div>
              </div>

              {/* Dernières opérations */}
              {hasActivity && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Dernières opérations
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {folioLines.slice(-3).map(line => (
                      <div key={line.id} className="flex justify-between text-xs p-2 bg-accent-gold/5 rounded">
                        <div>
                          <p className="font-medium truncate max-w-[120px]">{line.description}</p>
                          <p className="text-charcoal/50">
                            {new Date(line.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          {line.debit > 0 && (
                            <p className="text-error">+{formatCurrency(line.debit)}</p>
                          )}
                          {line.credit > 0 && (
                            <p className="text-success">-{formatCurrency(line.credit)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <TButton size="sm" variant="ghost" className="flex-1">
                  <Plus className="h-4 w-4" />
                  Ajouter
                </TButton>
                <TButton size="sm" variant="primary" className="flex-1" disabled={!hasActivity}>
                  <FileText className="h-4 w-4" />
                  Détails
                </TButton>
              </div>

              {/* Dernière activité */}
              {folio.last_activity && (
                <div className="text-xs text-charcoal/50 pt-2 border-t flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Dernière activité: {new Date(folio.last_activity).toLocaleDateString('fr-FR')}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}