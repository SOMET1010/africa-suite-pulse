import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Calendar, Users, Crown, Building2, MapPin, Copy, Eye, Pencil, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useOrgId } from "@/core/auth/useOrg";
import { ReservationCard } from "./components/ReservationCard";
import { CreateReservationDialog } from "./components/CreateReservationDialog";
import { DuplicateReservationDialog } from "./components/DuplicateReservationDialog";
import { ReservationFiltersSheet } from "./components/ReservationFiltersSheet";
import { reservationsApi } from "@/services/reservations.api";
import type { Reservation, ReservationFilters } from "@/types/reservation";

export default function ReservationsPage() {
  const navigate = useNavigate();
  const { orgId } = useOrgId();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ReservationFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Charger les réservations
  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations-management", orgId, { search: searchTerm, ...filters, status: activeTab === "all" ? undefined : activeTab }],
    queryFn: () => reservationsApi.list(orgId!, { 
      search: searchTerm, 
      ...filters,
      status: activeTab === "all" ? undefined : (activeTab as any)
    }),
    enabled: !!orgId,
    select: (result) => result.data || [],
  });

  // Charger les statistiques
  const { data: stats } = useQuery({
    queryKey: ["reservations-stats", orgId],
    queryFn: () => reservationsApi.getStats(orgId!),
    enabled: !!orgId,
  });

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const getTabLabel = (status: string) => {
    switch (status) {
      case "all": return "Toutes";
      case "option": return "Options";
      case "confirmed": return "Confirmées";
      case "present": return "Présentes";
      case "cancelled": return "Annulées";
      case "noshow": return "No Show";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Réservations</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos réservations et suivez leur statut
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Réservation
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/reservations/new/quick")}
            className="gap-2"
          >
            ⚡ Express
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Toutes réservations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
              <Building2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground">
                Prêtes pour arrivée
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Présentes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.present}</div>
              <p className="text-xs text-muted-foreground">
                Clients sur place
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Options</CardTitle>
              <Crown className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.options}</div>
              <p className="text-xs text-muted-foreground">
                À confirmer
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par référence, nom de client ou chambre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(true)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Onglets par statut */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">{getTabLabel("all")}</TabsTrigger>
          <TabsTrigger value="option">{getTabLabel("option")}</TabsTrigger>
          <TabsTrigger value="confirmed">{getTabLabel("confirmed")}</TabsTrigger>
          <TabsTrigger value="present">{getTabLabel("present")}</TabsTrigger>
          <TabsTrigger value="cancelled">{getTabLabel("cancelled")}</TabsTrigger>
          <TabsTrigger value="noshow">{getTabLabel("noshow")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Liste des réservations */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des réservations...
            </div>
          ) : reservations?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune réservation trouvée</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || activeFiltersCount > 0
                    ? "Aucune réservation ne correspond à vos critères de recherche."
                    : activeTab === "all"
                    ? "Vous n'avez pas encore de réservations enregistrées."
                    : `Aucune réservation avec le statut "${getTabLabel(activeTab)}".`}
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer la première réservation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
            {reservations?.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation as Reservation} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogues */}
      <CreateReservationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <DuplicateReservationDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        reservation={selectedReservation}
        onSuccess={() => {
          setShowDuplicateDialog(false);
          setSelectedReservation(null);
        }}
      />
      
      <ReservationFiltersSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}