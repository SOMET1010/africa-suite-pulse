import React, { useState } from 'react';
import { 
  Plus, Filter, Grid3X3, List, Search, ChevronDown, 
  Download, Upload, RefreshCw, Building, Users, Target, 
  Package, Layers, Check, X, MoreHorizontal
} from 'lucide-react';
import { useRoomsCatalog } from '../useRoomsCatalog';
import { useRoomTypes } from '../useRoomTypes';
import { useOrgId } from '@/core/auth/useOrg';
import type { Room } from '@/types/room';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomCard } from './RoomCard';
import { RoomsList } from './RoomsList';
import { CreateSeriesModal } from './CreateSeriesModal';
import { BulkActionsMenu } from './BulkActionsMenu';

export default function RoomsCatalogTab() {
  const { orgId } = useOrgId();
  const {
    rooms,
    stats,
    loading,
    selectedRooms,
    filters,
    createSeries,
    bulkUpdate,
    bulkDelete,
    exportToCSV,
    toggleSelection,
    selectAll,
    clearSelection,
    updateFilters,
    resetFilters
  } = useRoomsCatalog(orgId);
  
  const { roomTypes } = useRoomTypes(orgId);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des chambres...</p>
        </div>
      </div>
    );
  }

  const uniqueFloors = [...new Set(rooms.map(r => r.floor).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(rooms.map(r => r.type))].sort();

  return (
    <div className="space-y-6">
      {/* Selection Summary */}
      {selectedRooms.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedRooms.size} chambre(s) sélectionnée(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BulkActionsMenu
                selectedCount={selectedRooms.size}
                selectedRoomIds={Array.from(selectedRooms)}
                roomTypes={roomTypes}
                onBulkUpdate={bulkUpdate}
                onBulkDelete={bulkDelete}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="gap-2"
              >
                <X className="h-3 w-3" />
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-500" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Réelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.real}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              Fictives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fictive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-500" />
              Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCreateSeries(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Créer en série
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importer
          </Button>
          
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro, type, étage..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres
            {showFilters && <ChevronDown className="h-3 w-3" />}
          </Button>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Étage</label>
                <Select value={filters.floor} onValueChange={(value) => updateFilters({ floor: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les étages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les étages</SelectItem>
                    {uniqueFloors.map((floor) => (
                      <SelectItem key={floor} value={floor!}>
                        Étage {floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={filters.type} onValueChange={(value) => updateFilters({ type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="clean">Propre</SelectItem>
                    <SelectItem value="inspected">Inspectée</SelectItem>
                    <SelectItem value="dirty">Sale</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out_of_order">Hors service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Nature</label>
                <Select value={filters.fictive} onValueChange={(value) => updateFilters({ fictive: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="real">Réelles seulement</SelectItem>
                    <SelectItem value="fictive">Fictives seulement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rooms Display */}
      {rooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune chambre trouvée</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search || filters.floor !== 'all' || filters.type !== 'all' || filters.status !== 'all' || filters.fictive !== 'all'
                ? 'Aucune chambre ne correspond à vos critères de recherche.'
                : 'Commencez par créer vos premières chambres.'
              }
            </p>
            {!(filters.search || filters.floor !== 'all' || filters.type !== 'all' || filters.status !== 'all' || filters.fictive !== 'all') && (
              <Button onClick={() => setShowCreateSeries(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer des chambres
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              selected={selectedRooms.has(room.id!)}
              onToggleSelect={() => toggleSelection(room.id!)}
            />
          ))}
        </div>
      ) : (
        <RoomsList
          rooms={rooms}
          selectedRooms={selectedRooms}
          onToggleSelect={toggleSelection}
        />
      )}

      {/* Modals */}
      {showCreateSeries && (
        <CreateSeriesModal
          roomTypes={roomTypes}
          onClose={() => setShowCreateSeries(false)}
          onConfirm={createSeries}
        />
      )}
    </div>
  );
}