import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Server, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { HotelHealthCard } from '../components';
import { AlertsPanel } from '../components';
import { useHotelHealthSummary, useHotelHealthStatus, useActiveAlerts } from '../hooks/useMonitoring';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

export default function MonitoringDashboard() {
  const { data: summary, isLoading: summaryLoading } = useHotelHealthSummary();
  const { data: hotelHealth, isLoading: healthLoading } = useHotelHealthStatus();
  const { data: alerts, isLoading: alertsLoading } = useActiveAlerts();

  const stats = [
    {
      title: "Total Hôtels",
      value: summary?.total_hotels || 0,
      icon: Server,
      description: "Hôtels surveillés",
    },
    {
      title: "Hôtels Sains",
      value: summary?.healthy_hotels || 0,
      icon: Activity,
      description: "Fonctionnement normal",
      color: "text-success",
    },
    {
      title: "Hôtels Dégradés",
      value: summary?.degraded_hotels || 0,
      icon: AlertTriangle,
      description: "Performance réduite",
      color: "text-warning",
    },
    {
      title: "Temps Réponse Moy.",
      value: summary?.avg_response_time ? `${Math.round(summary.avg_response_time)}ms` : "N/A",
      icon: Clock,
      description: "Latence moyenne",
    },
  ];

  return (
    <UnifiedLayout title="Centre de Monitoring" showStatusBar={true}>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color || ''}`}>
                  {summaryLoading ? "..." : stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hotel Health Status */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  État des Hôtels
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : hotelHealth && hotelHealth.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotelHealth.map((hotel) => (
                      <HotelHealthCard 
                        key={hotel.id} 
                        hotel={hotel}
                        onClick={() => {
                          // Navigate to hotel detail page
                          console.log('Navigate to hotel detail:', hotel.org_id);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Server className="h-12 w-12 mx-auto mb-2" />
                    <p>Aucun hôtel surveillé pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          <div>
            {alertsLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            ) : (
              <AlertsPanel alerts={alerts || []} />
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vue d'ensemble des Performances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-success">
                  {summary?.avg_uptime ? `${summary.avg_uptime.toFixed(1)}%` : "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">Disponibilité Moyenne</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {summary?.avg_response_time ? `${Math.round(summary.avg_response_time)}ms` : "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">Temps de Réponse</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning">
                  {alerts?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Alertes Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
}