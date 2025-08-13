import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Version simplifiée temporaire sans Recharts pour éviter les erreurs de build
export function DashboardCharts() {
  const mockData = [
    { day: 'Lun', occupancy: 78, revenue: 12500 },
    { day: 'Mar', occupancy: 82, revenue: 14200 },
    { day: 'Mer', occupancy: 85, revenue: 15800 },
    { day: 'Jeu', occupancy: 91, revenue: 18900 },
    { day: 'Ven', occupancy: 95, revenue: 22300 },
    { day: 'Sam', occupancy: 89, revenue: 19800 },
    { day: 'Dim', occupancy: 76, revenue: 13400 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Occupation 7 jours */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            Occupation sur 7 jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockData.map((data, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">{data.day}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${data.occupancy}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{data.occupancy}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenus 7 jours */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            Revenus journaliers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockData.map((data, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">{data.day}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-accent rounded-full" 
                      style={{ width: `${(data.revenue / 25000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {(data.revenue / 1000).toFixed(0)}k XOF
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sources de réservation */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            Sources de réservation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Direct', value: 45, color: 'bg-primary' },
              { name: 'Booking.com', value: 25, color: 'bg-accent' },
              { name: 'Expedia', value: 15, color: 'bg-success' },
              { name: 'Walk-in', value: 10, color: 'bg-warning' },
              { name: 'Autres', value: 5, color: 'bg-info' }
            ].map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                  <span className="text-sm">{source.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${source.color}`}
                      style={{ width: `${source.value * 2}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{source.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Évolution ADR */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            Évolution ADR (7 jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockData.map((data, index) => {
              const adr = Math.round(data.revenue / (data.occupancy * 0.8)); // Mock ADR calculation
              return (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{data.day}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 bg-success rounded-full" 
                        style={{ width: `${Math.min((adr / 300) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{adr} XOF</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}