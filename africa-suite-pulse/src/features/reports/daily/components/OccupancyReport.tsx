import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Building, Home, AlertTriangle, TrendingUp, Download } from "lucide-react";
import { useOccupancy } from "../hooks/useDailyReports";
import { Skeleton } from "@/components/ui/skeleton";

interface OccupancyReportProps {
  selectedDate: string;
}

export function OccupancyReport({ selectedDate }: OccupancyReportProps) {
  const { data: occupancy, isLoading } = useOccupancy(selectedDate);

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-success';
    if (rate >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getOccupancyBgColor = (rate: number) => {
    if (rate >= 90) return 'bg-success';
    if (rate >= 70) return 'bg-warning';
    return 'bg-destructive';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card border-accent-gold/20">
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-accent-gold/20">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="glass-card border-accent-gold/20">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!occupancy) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-luxury text-primary">{occupancy.totalRooms}</div>
            <p className="text-sm text-muted-foreground">Total chambres</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Home className="w-6 h-6 text-success" />
            </div>
            <div className="text-2xl font-luxury text-success">{occupancy.occupiedRooms}</div>
            <p className="text-sm text-muted-foreground">Occupées</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-accent-gold" />
            </div>
            <div className="text-2xl font-luxury text-accent-gold">{occupancy.availableRooms}</div>
            <p className="text-sm text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className={`w-6 h-6 ${occupancy.outOfOrderRooms > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            <div className={`text-2xl font-luxury ${occupancy.outOfOrderRooms > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {occupancy.outOfOrderRooms}
            </div>
            <p className="text-sm text-muted-foreground">Hors service</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Occupancy */}
      <Card className="glass-card border-accent-gold/20 shadow-luxury">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-luxury">Taux d'occupation global</CardTitle>
              <CardDescription>
                Situation au {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-luxury mb-2 ${getOccupancyColor(occupancy.occupancyRate)}`}>
                {occupancy.occupancyRate.toFixed(1)}%
              </div>
              <p className="text-muted-foreground">Taux d'occupation</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Chambres occupées</span>
                <span>{occupancy.occupiedRooms} / {occupancy.totalRooms - occupancy.outOfOrderRooms}</span>
              </div>
              <Progress 
                value={occupancy.occupancyRate} 
                className="h-3"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-accent-gold/20">
              <div>
                <div className="text-lg font-medium text-success">{occupancy.occupiedRooms}</div>
                <div className="text-sm text-muted-foreground">Occupées</div>
              </div>
              <div>
                <div className="text-lg font-medium text-primary">{occupancy.availableRooms}</div>
                <div className="text-sm text-muted-foreground">Disponibles</div>
              </div>
              <div>
                <div className="text-lg font-medium text-destructive">{occupancy.outOfOrderRooms}</div>
                <div className="text-sm text-muted-foreground">Hors service</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Types Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardHeader>
            <CardTitle className="font-luxury">Occupation par type de chambre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {occupancy.roomTypes.map((roomType) => (
                <div key={roomType.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{roomType.type}</span>
                    <div className="text-right">
                      <span className={`font-medium ${getOccupancyColor(roomType.rate)}`}>
                        {roomType.rate.toFixed(1)}%
                      </span>
                      <div className="text-sm text-muted-foreground">
                        {roomType.occupied}/{roomType.total}
                      </div>
                    </div>
                  </div>
                  <Progress value={roomType.rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardHeader>
            <CardTitle className="font-luxury">Occupation par étage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {occupancy.floors.map((floor) => (
                <div key={floor.floor} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {floor.floor === '0' ? 'RDC' : `Étage ${floor.floor}`}
                    </span>
                    <div className="text-right">
                      <span className={`font-medium ${getOccupancyColor(floor.rate)}`}>
                        {floor.rate.toFixed(1)}%
                      </span>
                      <div className="text-sm text-muted-foreground">
                        {floor.occupied}/{floor.total}
                      </div>
                    </div>
                  </div>
                  <Progress value={floor.rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="glass-card border-accent-gold/20 shadow-luxury">
        <CardHeader>
          <CardTitle className="font-luxury">Recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {occupancy.occupancyRate < 50 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">Occupation faible</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      L'occupation est inférieure à 50%. Considérez des actions commerciales ou promotionnelles.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {occupancy.occupancyRate >= 50 && occupancy.occupancyRate < 80 && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning">Occupation modérée</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      L'occupation est correcte. Optimisez la répartition par type de chambre pour maximiser les revenus.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {occupancy.occupancyRate >= 80 && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <h4 className="font-medium text-success">Excellente occupation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Très bonne performance ! Surveillez les surréservations et optimisez les tarifs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {occupancy.outOfOrderRooms > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">Chambres hors service</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {occupancy.outOfOrderRooms} chambre{occupancy.outOfOrderRooms > 1 ? 's' : ''} hors service. 
                      Planifiez les réparations pour maximiser la capacité disponible.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}