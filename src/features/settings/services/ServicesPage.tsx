import React, { useState } from 'react';
import { 
  Tags, Plus, Search, Filter, ChevronLeft, Package, 
  Star, Download, Upload, Save, Settings, TrendingUp,
  DollarSign, Percent, Check, Users, Clock, Target
} from 'lucide-react';
import { useServices } from './useServices';
import { useOrgId } from '@/core/auth/useOrg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FamiliesTab } from './components/FamiliesTab';
import { ServicesTab } from './components/ServicesTab';
import { ArrangementsTab } from './components/ArrangementsTab';

export default function ServicesPage() {
  const { orgId, loading: orgLoading, error: orgError } = useOrgId();
  const {
    families,
    services,
    arrangements,
    stats,
    loading,
    saving,
    saveFamily,
    deleteFamily,
    saveService,
    deleteService,
    saveArrangement,
    deleteArrangement,
    exportFamilies,
    exportServices,
    exportArrangements
  } = useServices(orgId || ''); // Passer une chaîne vide si orgId est null

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Gestion des états de chargement et d'erreur
  if (orgLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p>Chargement de l'organisation...</p>
        </div>
      </div>
    );
  }

  if (orgError || !orgId) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center text-destructive">
          <p>Erreur: Impossible de charger l'organisation</p>
          <p className="text-sm text-muted-foreground mt-2">
            {orgError || 'Organisation non trouvée'}
          </p>
        </div>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="p-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 rounded-xl bg-primary/10">
                <Tags className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Services & Prestations</h1>
                <p className="text-sm text-muted-foreground">
                  Configuration des familles, prestations et arrangements
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saving && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm text-primary font-medium">Sauvegarde...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Familles</p>
                    <p className="text-2xl font-bold">{stats.totalFamilies}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-500/10">
                    <Tags className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Services</p>
                    <p className="text-2xl font-bold">{stats.totalServices}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Arrangements</p>
                    <p className="text-2xl font-bold">{stats.totalArrangements}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10">
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actifs</p>
                    <p className="text-2xl font-bold">{stats.activeServices}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-yellow-500/10">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix moyen</p>
                    <p className="text-2xl font-bold">
                      {Math.round(stats.averagePrice).toLocaleString()} F
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CA potentiel</p>
                    <p className="text-2xl font-bold">
                      {Math.round(stats.totalRevenuePotential / 1000).toLocaleString()}K F
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 md:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration des Services
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="families" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="families" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Familles
                  <Badge variant="secondary">{families.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  Services
                  <Badge variant="secondary">{services.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="arrangements" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Arrangements
                  <Badge variant="secondary">{arrangements.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="families" className="mt-6">
                <FamiliesTab
                  families={families}
                  searchQuery={searchQuery}
                  onExport={exportFamilies}
                  onSaveFamily={saveFamily}
                  onDeleteFamily={deleteFamily}
                />
              </TabsContent>

              <TabsContent value="services" className="mt-6">
                <ServicesTab
                  services={services}
                  families={families}
                  searchQuery={searchQuery}
                  onExport={exportServices}
                  onSaveService={saveService}
                  onDeleteService={deleteService}
                />
              </TabsContent>

              <TabsContent value="arrangements" className="mt-6">
                <ArrangementsTab
                  arrangements={arrangements}
                  services={services}
                  searchQuery={searchQuery}
                  onExport={exportArrangements}
                  onSaveArrangement={saveArrangement}
                  onDeleteArrangement={deleteArrangement}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Spacer for bottom navigation if needed */}
      <div className="h-20" />
    </div>
  );
}