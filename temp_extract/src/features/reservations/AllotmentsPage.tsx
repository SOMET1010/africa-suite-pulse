import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, Building2, Calendar, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrgId } from "@/core/auth/useOrg";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Allotment {
  id: string;
  code: string;
  partner_name: string;
  partner_type: string;
  room_type: string;
  total_units: number;
  remaining_units: number;
  valid_from: string;
  valid_until: string;
  release_date?: string;
  rate_per_night?: number;
  is_active: boolean;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  contract_terms?: string;
  created_at: string;
  updated_at: string;
}

export default function AllotmentsPage() {
  const { orgId } = useOrgId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAllotment, setSelectedAllotment] = useState<Allotment | null>(null);

  // Load allotments
  const { data: allotments = [], isLoading } = useQuery({
    queryKey: ["allotments", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      // Simulate API call - replace with actual Supabase query
      const mockAllotments: Allotment[] = [
        {
          id: "1",
          code: "CORP-ABIDJAN-2024",
          partner_name: "Hotel Corp Abidjan",
          partner_type: "corporate",
          room_type: "STD",
          total_units: 50,
          remaining_units: 35,
          valid_from: "2024-01-01",
          valid_until: "2024-12-31",
          release_date: "2024-11-15",
          rate_per_night: 45000,
          is_active: true,
          contact_email: "reservations@hotelcorp.ci",
          contact_phone: "+225 27 20 12 34",
          notes: "Contrat corporate avec réduction 15%",
          contract_terms: "Paiement à 30 jours, annulation gratuite jusqu'à 48h",
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-15T14:30:00Z"
        },
        {
          id: "2",
          code: "TO-EVASION-2024",
          partner_name: "Evasion Tours",
          partner_type: "tour_operator",
          room_type: "SUP",
          total_units: 100,
          remaining_units: 78,
          valid_from: "2024-03-01",
          valid_until: "2024-10-31",
          release_date: "2024-09-30",
          rate_per_night: 65000,
          is_active: true,
          contact_email: "booking@evasiontours.ci",
          contact_phone: "+225 07 89 12 34",
          notes: "Tour operator spécialisé voyage d'affaires",
          contract_terms: "Commission 12%, paiement à réception",
          created_at: "2024-02-15T09:00:00Z",
          updated_at: "2024-02-20T16:45:00Z"
        },
        {
          id: "3",
          code: "AGC-SUNSET-2024",
          partner_name: "Sunset Travel Agency",
          partner_type: "agency",
          room_type: "DLX",
          total_units: 25,
          remaining_units: 5,
          valid_from: "2024-06-01",
          valid_until: "2024-08-31",
          release_date: "2024-07-15",
          rate_per_night: 85000,
          is_active: true,
          contact_email: "res@sunset-travel.ci",
          notes: "Agence spécialisée tourisme de luxe",
          contract_terms: "Prépaiement obligatoire, pas d'annulation",
          created_at: "2024-05-01T11:30:00Z",
          updated_at: "2024-06-10T08:15:00Z"
        }
      ];
      
      return mockAllotments;
    },
    enabled: !!orgId,
  });

  const getPartnerTypeLabel = (type: string) => {
    switch (type) {
      case "corporate": return "Entreprise";
      case "tour_operator": return "Tour Opérateur";
      case "agency": return "Agence";
      case "airline": return "Compagnie Aérienne";
      default: return type;
    }
  };

  const getPartnerTypeColor = (type: string) => {
    switch (type) {
      case "corporate": return "blue";
      case "tour_operator": return "green";
      case "agency": return "purple";
      case "airline": return "orange";
      default: return "gray";
    }
  };

  const getUsagePercentage = (allotment: Allotment) => {
    return ((allotment.total_units - allotment.remaining_units) / allotment.total_units) * 100;
  };

  const getStatusIcon = (allotment: Allotment) => {
    const today = new Date();
    const validUntil = parseISO(allotment.valid_until);
    const releaseDate = allotment.release_date ? parseISO(allotment.release_date) : null;
    
    if (!allotment.is_active) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    
    if (isAfter(today, validUntil)) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    
    if (releaseDate && isAfter(today, releaseDate)) {
      return <TrendingDown className="h-4 w-4 text-warning" />;
    }
    
    if (allotment.remaining_units <= 5) {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  const getStatusLabel = (allotment: Allotment) => {
    const today = new Date();
    const validUntil = parseISO(allotment.valid_until);
    const releaseDate = allotment.release_date ? parseISO(allotment.release_date) : null;
    
    if (!allotment.is_active) return "Inactif";
    if (isAfter(today, validUntil)) return "Expiré";
    if (releaseDate && isAfter(today, releaseDate)) return "À libérer";
    if (allotment.remaining_units <= 5) return "Stock faible";
    return "Actif";
  };

  const performRelease = async (allotmentId: string) => {
    try {
      // Simulate release action
      toast({
        title: "Chambres libérées",
        description: "Les chambres non vendues ont été remises en stock général",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["allotments", orgId] });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de libérer les chambres",
        variant: "destructive",
      });
    }
  };

  // Stats calculations
  const totalUnits = allotments.reduce((sum, a) => sum + a.total_units, 0);
  const totalSold = allotments.reduce((sum, a) => sum + (a.total_units - a.remaining_units), 0);
  const totalRemaining = allotments.reduce((sum, a) => sum + a.remaining_units, 0);
  const activeAllotments = allotments.filter(a => a.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Allotements</h1>
          <p className="text-muted-foreground">
            Gérez les contrats avec vos partenaires et le stock de chambres allouées
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel Allotement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allotements Actifs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAllotments}</div>
            <p className="text-xs text-muted-foreground">
              Sur {allotments.length} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres Allouées</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              Unités sous contrat
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres Vendues</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalSold}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSold / totalUnits) * 100).toFixed(1)}% du stock
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Restant</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totalRemaining}</div>
            <p className="text-xs text-muted-foreground">
              Chambres disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Allotments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Allotements</CardTitle>
          <CardDescription>
            Suivi en temps réel de vos contrats partenaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des allotements...
            </div>
          ) : allotments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun allotement trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre premier contrat d'allotement avec un partenaire.
              </p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Créer le premier allotement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {allotments.map((allotment) => (
                <Card 
                  key={allotment.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedAllotment?.id === allotment.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedAllotment(allotment)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(allotment)}
                        <div>
                          <h3 className="font-semibold text-lg">{allotment.partner_name}</h3>
                          <p className="text-sm text-muted-foreground">{allotment.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`mb-2 text-${getPartnerTypeColor(allotment.partner_type)}-600`}
                        >
                          {getPartnerTypeLabel(allotment.partner_type)}
                        </Badge>
                        <p className="text-sm font-medium">{getStatusLabel(allotment)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Type chambre</p>
                        <p className="font-medium">{allotment.room_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tarif/nuit</p>
                        <p className="font-medium">
                          {allotment.rate_per_night?.toLocaleString() || 'N/A'} F
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Période</p>
                        <p className="font-medium text-xs">
                          {format(parseISO(allotment.valid_from), "dd/MM", { locale: fr })} - {" "}
                          {format(parseISO(allotment.valid_until), "dd/MM/yy", { locale: fr })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="font-medium text-xs">
                          {allotment.contact_email?.split('@')[0] || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stock utilisé</span>
                        <span>
                          {allotment.total_units - allotment.remaining_units} / {allotment.total_units}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(allotment)} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{getUsagePercentage(allotment).toFixed(1)}% utilisé</span>
                        <span>{allotment.remaining_units} restantes</span>
                      </div>
                    </div>

                    {allotment.release_date && (
                      <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-warning-foreground">
                              Release prévu le {format(parseISO(allotment.release_date), "dd/MM/yyyy", { locale: fr })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {allotment.remaining_units} chambres seront libérées
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              performRelease(allotment.id);
                            }}
                          >
                            Libérer maintenant
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Allotment Details */}
      {selectedAllotment && (
        <Card>
          <CardHeader>
            <CardTitle>Détails du contrat: {selectedAllotment.partner_name}</CardTitle>
            <CardDescription>
              Informations complètes sur l'allotement {selectedAllotment.code}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Informations partenaire</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Nom:</span>
                      <span className="font-medium">{selectedAllotment.partner_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{getPartnerTypeLabel(selectedAllotment.partner_type)}</span>
                    </div>
                    {selectedAllotment.contact_email && (
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-medium">{selectedAllotment.contact_email}</span>
                      </div>
                    )}
                    {selectedAllotment.contact_phone && (
                      <div className="flex justify-between">
                        <span>Téléphone:</span>
                        <span className="font-medium">{selectedAllotment.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAllotment.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                      {selectedAllotment.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Conditions contractuelles</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Période:</span>
                      <span className="font-medium">
                        {format(parseISO(selectedAllotment.valid_from), "dd/MM/yyyy", { locale: fr })} - {" "}
                        {format(parseISO(selectedAllotment.valid_until), "dd/MM/yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type chambre:</span>
                      <span className="font-medium">{selectedAllotment.room_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tarif/nuit:</span>
                      <span className="font-medium">
                        {selectedAllotment.rate_per_night?.toLocaleString() || 'N/A'} F
                      </span>
                    </div>
                    {selectedAllotment.release_date && (
                      <div className="flex justify-between">
                        <span>Date release:</span>
                        <span className="font-medium">
                          {format(parseISO(selectedAllotment.release_date), "dd/MM/yyyy", { locale: fr })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAllotment.contract_terms && (
                  <div>
                    <h4 className="font-medium mb-2">Termes du contrat</h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                      {selectedAllotment.contract_terms}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}