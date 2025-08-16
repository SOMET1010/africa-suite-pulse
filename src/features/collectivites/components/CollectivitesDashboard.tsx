import React, { useState } from 'react';
import { Calendar, Download, Users, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DataCard } from '@/core/ui/DataCard';
import { CollectivitesKPICards } from './CollectivitesKPICards';
import { CollectivitesCharts } from './CollectivitesCharts';
import { CollectivitesExports } from './CollectivitesExports';
import { useCollectivitesStats } from '../hooks/useCollectivitesStats';
import { cn } from '@/core/utils/cn';
import { DateRange } from 'react-day-picker';

type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export function CollectivitesDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: stats, isLoading } = useCollectivitesStats({
    period: selectedPeriod,
    organizationId: selectedOrg !== 'all' ? selectedOrg : undefined,
    dateRange: dateRange && dateRange.from && dateRange.to ? {
      from: dateRange.from,
      to: dateRange.to
    } : undefined
  });

  const handleExport = (format: 'excel' | 'pdf') => {
    // Export functionality will be implemented
    console.log('Exporting in', format);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Collectivités</h1>
          <p className="text-muted-foreground">
            Suivi des repas, subventions et bénéficiaires
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <CollectivitesExports onExport={handleExport} />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === 'custom' && (
              <DatePickerWithRange 
                date={dateRange} 
                onDateChange={(date) => setDateRange(date)}
              />
            )}

            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Organisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les organisations</SelectItem>
                <SelectItem value="school1">École Primaire A</SelectItem>
                <SelectItem value="school2">Collège B</SelectItem>
                <SelectItem value="company1">Entreprise Tech C</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <CollectivitesKPICards stats={stats} isLoading={isLoading} />

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CollectivitesCharts stats={stats} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Objectifs & Alertes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 text-success font-medium">
                <TrendingUp className="h-4 w-4" />
                Budget en bonne voie
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                73% du budget mensuel consommé (objectif: 75%)
              </p>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 text-warning font-medium">
                <Users className="h-4 w-4" />
                Fréquentation faible
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                École Primaire A: 45% de fréquentation cette semaine
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-primary font-medium">
                <DollarSign className="h-4 w-4" />
                Optimisation possible
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Réduction de 12% des coûts avec nouveaux fournisseurs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>
            Dernières transactions et événements importants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    450 repas servis - École Primaire A
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Subvention appliquée: 1,350 FCFA - Il y a {i * 2}h
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">450 repas</p>
                  <p className="text-xs text-success">+12% vs hier</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}