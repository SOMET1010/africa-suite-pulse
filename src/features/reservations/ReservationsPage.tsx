import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Calendar, Users, Crown, Building2, MapPin, Copy, Eye, Pencil, MoreHorizontal } from "lucide-react";
import { TButton } from "@/core/ui/TButton";
import { MainAppLayout } from "@/core/layout/MainAppLayout";
import { FilterBar } from "@/core/ui/FilterBar";
import { DataCard } from "@/core/ui/DataCard";
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
    <MainAppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gestion des Réservations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez toutes vos réservations clients
            </p>
          </div>
          <div className="flex gap-2">
            <TButton onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Réservation
            </TButton>
            <TButton 
              variant="default"
              onClick={() => navigate("/reservations/new/quick")}
              className="gap-2"
            >
              ⚡ Express
            </TButton>
          </div>
        </div>

        {/* Content */}
        {/* Statistiques */}
        {stats && (
          <div className="grid-adaptive-1 gap-4">
            <DataCard
              title="Total"
              value={stats.total}
              subtitle="Toutes réservations"
              icon={Calendar}
              variant="default"
            />
            <DataCard
              title="Confirmées"
              value={stats.confirmed}
              subtitle="Prêtes pour arrivée"
              icon={Building2}
              variant="success"
            />
            <DataCard
              title="Présentes"
              value={stats.present}
              subtitle="Clients sur place"
              icon={Users}
              variant="primary"
            />
            <DataCard
              title="Options"
              value={stats.options}
              subtitle="À confirmer"
              icon={Crown}
              variant="warning"
            />
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher par référence, nom de client ou chambre..."
        >
          <TButton
            variant="default"
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
          </TButton>
        </FilterBar>

        {/* Onglets par statut */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-6 w-full max-w-4xl">
              <TabsTrigger value="all">{getTabLabel("all")}</TabsTrigger>
              <TabsTrigger value="option">{getTabLabel("option")}</TabsTrigger>
              <TabsTrigger value="confirmed">{getTabLabel("confirmed")}</TabsTrigger>
              <TabsTrigger value="present">{getTabLabel("present")}</TabsTrigger>
              <TabsTrigger value="cancelled">{getTabLabel("cancelled")}</TabsTrigger>
              <TabsTrigger value="noshow">{getTabLabel("noshow")}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Liste des réservations */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement des réservations...
              </div>
            ) : reservations?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                  <h3 className="text-xl font-semibold mb-3">Aucune réservation trouvée</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || activeFiltersCount > 0
                      ? "Aucune réservation ne correspond à vos critères de recherche."
                      : activeTab === "all"
                      ? "Vous n'avez pas encore de réservations enregistrées."
                      : `Aucune réservation avec le statut "${getTabLabel(activeTab)}".`}
                  </p>
                  <TButton onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer la première réservation
                  </TButton>
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
    </MainAppLayout>
  );
}