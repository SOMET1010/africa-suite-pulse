import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TButton } from "@/core/ui/TButton";
import { Search, User, Calendar, MapPin, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/core/auth/useOrg";

interface ReservationSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface ReservationForCardex {
  id: string;
  reference: string | null;
  guest_name: string;
  room_number: string | null;
  date_arrival: string;
  date_departure: string | null;
  status: string;
  rate_total: number | null;
}

export function ReservationSelector({ selectedId, onSelect }: ReservationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { orgId } = useOrgId();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations-for-cardex', orgId, searchTerm],
    queryFn: async (): Promise<ReservationForCardex[]> => {
      let query = supabase
        .from('reservations_view_arrivals')
        .select('*')
        .eq('org_id', orgId)
        .order('date_arrival', { ascending: false })
        .limit(20);

      if (searchTerm.trim()) {
        query = query.or(`reference.ilike.%${searchTerm}%,guest_name.ilike.%${searchTerm}%,room_number.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(res => ({
        id: res.id,
        reference: res.reference,
        guest_name: res.guest_name || 'Client',
        room_number: res.room_number,
        date_arrival: res.date_arrival,
        date_departure: res.date_departure,
        status: res.status || 'confirmed',
        rate_total: res.rate_total
      }));
    },
    enabled: !!orgId
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-success/10 text-success border-success/20';
      case 'confirmed':
        return 'bg-info/10 text-info border-info/20';
      case 'departed':
        return 'bg-charcoal/10 text-charcoal border-charcoal/20';
      default:
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Présent';
      case 'confirmed':
        return 'Confirmé';
      case 'departed':
        return 'Parti';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal/50" />
        <Input
          placeholder="Rechercher par référence, nom client ou chambre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Liste des réservations */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-charcoal/10 rounded w-3/4"></div>
                    <div className="h-3 bg-charcoal/10 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reservations && reservations.length > 0 ? (
          reservations.map(reservation => (
            <Card
              key={reservation.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedId === reservation.id ? 'ring-2 ring-brand-accent bg-brand-accent/5' : 'hover:bg-accent-gold/5'
              }`}
              onClick={() => onSelect(reservation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-charcoal/50" />
                        <span className="font-medium">{reservation.guest_name}</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(reservation.status)}>
                        {getStatusLabel(reservation.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-charcoal/70">
                      <span>Réf: {reservation.reference || 'N/A'}</span>
                      {reservation.room_number && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Ch. {reservation.room_number}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(reservation.date_arrival).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    {reservation.rate_total && (
                      <div className="text-sm font-medium text-brand-accent">
                        Total: {reservation.rate_total} XOF
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedId === reservation.id && (
                      <Badge variant="default">Sélectionné</Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-charcoal/30" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-charcoal/30" />
              <p className="text-charcoal/50">
                {searchTerm ? 'Aucune réservation trouvée' : 'Saisissez un terme de recherche'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedId && (
        <div className="pt-4 border-t">
          <TButton onClick={() => {}} className="w-full">
            Accéder au cardex complet
          </TButton>
        </div>
      )}
    </div>
  );
}