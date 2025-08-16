import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import { FilterBar } from '@/core/ui/FilterBar';
import { DataCard } from '@/core/ui/DataCard';
import { TButton } from '@/core/ui/TButton';
import { GroupCard } from './components/GroupCard';
import { CreateGroupDialog } from './components/CreateGroupDialog';
import { reservationGroupsApi } from '@/services/reservationGroups.api';
import { queryKeys } from '@/lib/queryClient';
import { useCurrency } from '@/hooks/useCurrency';
import type { ReservationGroup, ReservationGroupSearchParams } from '@/types/reservationGroup';

export default function GroupsManagementPage() {
  const [selectedGroup, setSelectedGroup] = useState<ReservationGroup | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { formatCurrency } = useCurrency();
  
  // TODO: Get orgId from auth context
  const orgId = 'temp-org-id';

  const [searchParams, setSearchParams] = useState<ReservationGroupSearchParams>({
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const { data: groups = [], isLoading } = useQuery({
    queryKey: queryKeys.reservations.groups(orgId),
    queryFn: () => reservationGroupsApi.list(orgId, {
      ...searchParams,
      search: searchValue
    }),
    enabled: !!orgId
  });

  const { data: stats } = useQuery({
    queryKey: queryKeys.reservations.groupStats(orgId),
    queryFn: () => reservationGroupsApi.getStats(orgId),
    enabled: !!orgId
  });

  return (
    <GlobalNavigationLayout
      title="Gestion des groupes"
      headerAction={
        <TButton
          onClick={() => setShowCreateDialog(true)}
          variant="primary"
          size="md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau groupe
        </TButton>
      }
    >
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <DataCard
            title="Total Groupes"
            value={stats.total_groups}
            subtitle="groupes enregistrés"
            variant="primary"
          />
          <DataCard
            title="Total Chambres"
            value={stats.total_rooms}
            subtitle="chambres réservées"
            variant="default"
          />
          <DataCard
            title="Total Clients"
            value={stats.total_guests}
            subtitle="clients attendus"
            variant="success"
          />
          <DataCard
            title="Chiffre d'Affaires"
            value={formatCurrency(stats.total_revenue)}
            subtitle="revenus groupes"
            variant="primary"
          />
        </div>
      )}

      {/* Search and Filters */}
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Rechercher par nom, responsable..."
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement des groupes...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Aucun groupe trouvé</p>
              <TButton onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier groupe
              </TButton>
            </div>
          ) : (
            groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                isSelected={selectedGroup?.id === group.id}
                onClick={() => setSelectedGroup(group)}
              />
            ))
          )}
        </div>

        {/* Group Details Panel */}
        <div className="space-y-4">
          {selectedGroup ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Détails du groupe</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Informations générales</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nom:</span>
                      <span>{selectedGroup.group_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Responsable:</span>
                      <span>{selectedGroup.group_leader_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chambres:</span>
                      <span>{selectedGroup.total_rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clients:</span>
                      <span>{selectedGroup.total_guests}</span>
                    </div>
                  </div>
                </div>

                {selectedGroup.group_leader_email && (
                  <div>
                    <h4 className="font-medium mb-2">Contact</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{selectedGroup.group_leader_email}</span>
                      </div>
                      {selectedGroup.group_leader_phone && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Téléphone:</span>
                          <span>{selectedGroup.group_leader_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedGroup.group_rate && (
                  <div>
                    <h4 className="font-medium mb-2">Tarification</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tarif groupe:</span>
                        <span className="font-semibold">{formatCurrency(selectedGroup.group_rate)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedGroup.special_requests && (
                  <div>
                    <h4 className="font-medium mb-2">Demandes spéciales</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedGroup.special_requests}
                    </p>
                  </div>
                )}

                {selectedGroup.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes internes</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedGroup.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-muted-foreground">Sélectionnez un groupe pour voir les détails</p>
            </div>
          )}
        </div>
      </div>

      <CreateGroupDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        orgId={orgId}
      />
    </GlobalNavigationLayout>
  );
}