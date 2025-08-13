import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TButton } from "@/core/ui/TButton";
import { 
  Calendar, 
  Filter,
  Download,
  Receipt,
  CreditCard,
  Settings,
  FileText,
  User
} from "lucide-react";
import { cardexApi } from "@/services/cardex.api";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface CardexHistoryProps {
  reservationId: string;
}

export function CardexHistory({ reservationId }: CardexHistoryProps) {
  const [filterFolio, setFilterFolio] = useState<number | null>(null);
  
  const { data: cardex, isLoading } = useQuery({
    queryKey: ['cardex-overview', reservationId],
    queryFn: () => cardexApi.getCardexOverview(reservationId),
    enabled: !!reservationId
  });

  if (isLoading) {
    return (
      <Card className="glass-card shadow-luxury">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-charcoal/10 rounded w-48"></div>
                  <div className="h-3 bg-charcoal/10 rounded w-32"></div>
                </div>
                <div className="h-6 bg-charcoal/10 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cardex) {
    return (
      <Card className="glass-card shadow-luxury">
        <CardContent className="p-8 text-center">
          <p className="text-charcoal/50">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  const filteredLines = filterFolio 
    ? cardex.lines.filter(line => line.folio_number === filterFolio)
    : cardex.lines;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <Receipt className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'adjustment':
        return <Settings className="h-4 w-4" />;
      case 'accommodation':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service':
        return 'bg-info/10 text-info border-info/20';
      case 'payment':
        return 'bg-success/10 text-success border-success/20';
      case 'adjustment':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'accommodation':
        return 'bg-brand-accent/10 text-brand-accent border-brand-accent/20';
      default:
        return 'bg-charcoal/10 text-charcoal border-charcoal/20';
    }
  };

  return (
    <Card className="glass-card shadow-luxury">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique détaillé
          </CardTitle>
          <div className="flex gap-2">
            <TButton size="sm" variant="ghost">
              <Filter className="h-4 w-4" />
              Filtrer
            </TButton>
            <TButton size="sm" variant="ghost">
              <Download className="h-4 w-4" />
              Export
            </TButton>
          </div>
        </div>
        
        {/* Filtres rapides par folio */}
        <div className="flex gap-2 flex-wrap">
          <TButton
            size="sm"
            variant={filterFolio === null ? "primary" : "ghost"}
            onClick={() => setFilterFolio(null)}
          >
            Tous
          </TButton>
          {[1, 2, 3, 4, 5, 6].map(folioNum => {
            const folioData = cardex.folios.find(f => f.folio_number === folioNum);
            const hasActivity = folioData && folioData.item_count > 0;
            
            return (
              <TButton
                key={folioNum}
                size="sm"
                variant={filterFolio === folioNum ? "primary" : "ghost"}
                onClick={() => setFilterFolio(folioNum)}
                disabled={!hasActivity}
              >
                Folio {folioNum}
                {hasActivity && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {folioData.item_count}
                  </Badge>
                )}
              </TButton>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1">
          {filteredLines.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-charcoal/30" />
              <p className="text-charcoal/50">Aucune opération trouvée</p>
            </div>
          ) : (
            filteredLines.map((line, index) => (
              <div
                key={line.id}
                className={`p-4 hover:bg-accent-gold/5 transition-colors ${
                  index % 2 === 0 ? 'bg-charcoal/2' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-full ${getTypeColor(line.type)}`}>
                      {getTypeIcon(line.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{line.description}</h4>
                        <Badge variant="outline" className="text-xs">
                          Folio {line.folio_number}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-charcoal/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(line.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span>{line.service_code}</span>
                        {line.reference && (
                          <span className="text-xs bg-charcoal/10 px-2 py-1 rounded">
                            {line.reference}
                          </span>
                        )}
                        {line.user_name && (
                          <span className="flex items-center gap-1 text-xs">
                            <User className="h-3 w-3" />
                            {line.user_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    {line.debit > 0 && (
                      <div className="text-error font-medium">
                        +{formatCurrency(line.debit)}
                      </div>
                    )}
                    {line.credit > 0 && (
                      <div className="text-success font-medium">
                        -{formatCurrency(line.credit)}
                      </div>
                    )}
                    <div className="text-xs text-charcoal/50">
                      Solde: {formatCurrency(line.balance)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}