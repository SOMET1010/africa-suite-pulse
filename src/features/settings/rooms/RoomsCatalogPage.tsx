import React, { useState } from 'react';
import { 
  Home, Plus, Filter, Grid3X3, List, Search, ChevronDown, 
  ChevronLeft, Settings, Download, Upload, RefreshCw,
  Building, Users, Target, Package, Layers, Check, X, MoreHorizontal
} from 'lucide-react';
import { useRoomsCatalog } from './useRoomsCatalog';
import { useRoomTypes } from './useRoomTypes';
import { useOrgId } from '@/core/auth/useOrg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomCard } from './components/RoomCard';
import { RoomsList } from './components/RoomsList';
import { CreateSeriesModal } from './components/CreateSeriesModal';
import { BulkActionsMenu } from './components/BulkActionsMenu';

export default function RoomsCatalogPage() {
  const orgId = useOrgId();
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 rounded-xl bg-primary/10">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Catalogue Chambres</h1>
                <p className="text-sm text-muted-foreground">Gestion complète des chambres réelles et fictives</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedRooms.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {selectedRooms.size} sélectionnée(s)
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Réelles</p>
                  <p className="text-2xl font-bold">{stats.real}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Layers className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fictives</p>
                  <p className="text-2xl font-bold">{stats.fictive}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disponibles</p>
                  <p className="text-2xl font-bold">{stats.available}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Main Actions */}
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreateSeries(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Création en série
                </Button>
                
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </Button>

                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>

              {/* Bulk Actions */}
              {selectedRooms.size > 0 && (
                <BulkActionsMenu
                  selectedCount={selectedRooms.size}
                  onBulkUpdate={bulkUpdate}
                  onBulkDelete={bulkDelete}
                  selectedRoomIds={Array.from(selectedRooms)}
                  roomTypes={roomTypes}
                />
              )}

              {/* View Controls */}
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="pl-10 w-64"
                  />
                </div>

                {/* Filters */}
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>

                {/* View Mode */}
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Floor */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Étage</label>
                    <Select value={filters.floor} onValueChange={(value) => updateFilters({ floor: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {stats.floors.map(floor => (
                          <SelectItem key={floor} value={floor}>Étage {floor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <Select value={filters.type} onValueChange={(value) => updateFilters({ type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {roomTypes.map(type => (
                          <SelectItem key={type.id} value={type.code}>
                            {type.code} - {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Statut</label>
                    <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="clean">Propre</SelectItem>
                        <SelectItem value="inspected">Inspectée</SelectItem>
                        <SelectItem value="dirty">Sale</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="out_of_order">HS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Nature */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Nature</label>
                    <Select value={filters.fictive} onValueChange={(value) => updateFilters({ fictive: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="real">Réelles</SelectItem>
                        <SelectItem value="fictive">Fictives</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end gap-2">
                    <Button variant="outline" onClick={resetFilters}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selection Controls */}
        {rooms.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={selectedRooms.size === rooms.length ? clearSelection : selectAll}
              >
                {selectedRooms.size === rooms.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>
              
              {selectedRooms.size > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedRooms.size} sur {rooms.length} sélectionnée(s)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rooms Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <Card>
            <RoomsList
              rooms={rooms}
              selectedRooms={selectedRooms}
              onToggleSelect={toggleSelection}
            />
          </Card>
        )}

        {/* Empty State */}
        {rooms.length === 0 && (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              Aucune chambre correspondant aux filtres
            </p>
            <Button onClick={() => setShowCreateSeries(true)}>
              Créer des chambres
            </Button>
          </div>
        )}
      </div>

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