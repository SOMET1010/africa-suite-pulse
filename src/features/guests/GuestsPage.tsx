import { useState } from "react";
import { Plus, Search, Filter, Users, Crown, Building2 } from "lucide-react";
import { TButton } from "@/core/ui/TButton";

import { FilterBar } from "@/core/ui/FilterBar";
import { DataCard } from "@/core/ui/DataCard";
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
      {/* Statistiques */}
      {stats && (
        <div className="grid-adaptive-1 gap-4">
          <DataCard
            title="Total Clients"
            value={stats.total}
            icon={Users}
            variant="default"
          />
          <DataCard
            title="Clients VIP"
            value={stats.vips}
            icon={Crown}
            variant="primary"
          />
          <DataCard
            title="Entreprises"
            value={stats.corporate}
            icon={Building2}
            variant="success"
          />
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par nom, email ou téléphone..."
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
              <TButton onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer le premier client
              </TButton>
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