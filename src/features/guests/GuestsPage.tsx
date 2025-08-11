import { useState } from "react";
import { Plus, Search, Filter, Users, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { guestsApi } from "@/services/guests.api";
import { useOrgId } from "@/core/auth/useOrg";
import { GuestCard } from "./components/GuestCard";
import { CreateGuestDialog } from "./components/CreateGuestDialog";
import { GuestFiltersSheet } from "./components/GuestFiltersSheet";
import type { GuestFilters } from "@/types/guest";

export default function GuestsPage() {
  const { orgId } = useOrgId();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<GuestFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Charger les clients
  const { data: guests, isLoading } = useQuery({
    queryKey: ["guests", orgId, { search: searchTerm, ...filters }],
    queryFn: () => guestsApi.list(orgId!, { search: searchTerm, ...filters }),
    enabled: !!orgId,
    select: (result) => result.data || [],
  });

  // Charger les statistiques
  const { data: stats } = useQuery({
    queryKey: ["guests-stats", orgId],
    queryFn: () => guestsApi.getStats(orgId!),
    enabled: !!orgId,
  });

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Clients</h1>
          <p className="text-muted-foreground">
            Gérez vos clients et consultez leur historique de séjours
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Client
        </Button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients VIP</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vips}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entreprises</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.corporate}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone..."
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

      {/* Liste des clients */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement des clients...
          </div>
        ) : guests?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun client trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || activeFiltersCount > 0
                  ? "Aucun client ne correspond à vos critères de recherche."
                  : "Vous n'avez pas encore de clients enregistrés."}
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer le premier client
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {guests?.map((guest) => (
              <GuestCard key={guest.id} guest={guest} />
            ))}
          </div>
        )}
      </div>

      {/* Dialogues */}
      <CreateGuestDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      
      <GuestFiltersSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}