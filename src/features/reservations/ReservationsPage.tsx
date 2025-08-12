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
import { PageLayout } from "@/core/layout/PageLayout";
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
    <PageLayout
      title="Gestion des Réservations"
      description="Gérez toutes vos réservations et suivez leur statut en temps réel"
      breadcrumbs={[{ label: "Réservations" }]}
      headerActions={
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
      }
    >
      <div className="space-y-6">

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card border-accent-gold/20 shadow-luxury hover:shadow-elevate transition-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-premium font-medium">Total</CardTitle>
                <Calendar className="h-4 w-4 accent-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-luxury font-bold text-charcoal">{stats.total}</div>
                <p className="text-xs text-muted-foreground font-premium">
                  Toutes réservations
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-success/30 shadow-luxury hover:shadow-elevate transition-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-premium font-medium">Confirmées</CardTitle>
                <Building2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-luxury font-bold text-success">{stats.confirmed}</div>
                <p className="text-xs text-muted-foreground font-premium">
                  Prêtes pour arrivée
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-primary/30 shadow-luxury hover:shadow-elevate transition-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-premium font-medium">Présentes</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-luxury font-bold text-primary">{stats.present}</div>
                <p className="text-xs text-muted-foreground font-premium">
                  Clients sur place
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-warning/30 shadow-luxury hover:shadow-elevate transition-elegant">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-premium font-medium">Options</CardTitle>
                <Crown className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-luxury font-bold text-warning">{stats.options}</div>
                <p className="text-xs text-muted-foreground font-premium">
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
              className="pl-10 glass-card border-accent-gold/20 bg-background/80 backdrop-blur-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(true)}
            className="gap-2 glass-card border-accent-gold/20 hover:bg-accent-gold/10"
          >
            <Filter className="h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-accent-gold/20 text-accent-gold border-accent-gold/30">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Onglets par statut */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 glass-card border-accent-gold/20 bg-background/80 backdrop-blur-sm">
            <TabsTrigger value="all" className="font-premium data-[state=active]:bg-accent-gold/20 data-[state=active]:text-accent-gold">{getTabLabel("all")}</TabsTrigger>
            <TabsTrigger value="option" className="font-premium data-[state=active]:bg-accent-gold/20 data-[state=active]:text-accent-gold">{getTabLabel("option")}</TabsTrigger>
            <TabsTrigger value="confirmed" className="font-premium data-[state=active]:bg-accent-gold/20 data-[state=active]:text-accent-gold">{getTabLabel("confirmed")}</TabsTrigger>
            <TabsTrigger value="present" className="font-premium data-[state=active]:bg-accent-gold/20 data-[state=active]:text-accent-gold">{getTabLabel("present")}</TabsTrigger>
            <TabsTrigger value="cancelled" className="font-premium data-[state=active]:bg-accent-gold/20 data-[state=active]:text-accent-gold">{getTabLabel("cancelled")}</TabsTrigger>
            <TabsTrigger value="noshow" className="font-premium data-[state=active]:bg-accent-gold/20 data-[state=active]:text-accent-gold">{getTabLabel("noshow")}</TabsTrigger>
          </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Liste des réservations */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des réservations...
            </div>
          ) : reservations?.length === 0 ? (
            <Card className="glass-card border-accent-gold/20 shadow-luxury">
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-xl font-luxury font-semibold mb-3 text-charcoal">Aucune réservation trouvée</h3>
                <p className="text-muted-foreground mb-6 font-premium">
                  {searchTerm || activeFiltersCount > 0
                    ? "Aucune réservation ne correspond à vos critères de recherche."
                    : activeTab === "all"
                    ? "Vous n'avez pas encore de réservations enregistrées."
                    : `Aucune réservation avec le statut "${getTabLabel(activeTab)}".`}
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2 glass-card border-accent-gold/20 hover:bg-accent-gold/10">
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
    </PageLayout>
  );
}